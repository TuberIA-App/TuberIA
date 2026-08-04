#!/usr/bin/env bash
# ============================================================================
# TuberIA - production deploy
# ============================================================================
# Pulls the CI-built images for a given tag, starts them, waits for health, and
# rolls back to the previous tag if the new one does not come up.
#
#   ./scripts/deployment.sh                  # deploy IMAGE_TAG from .env
#   IMAGE_TAG=<sha> ./scripts/deployment.sh  # deploy a specific build
#   ./scripts/deployment.sh --rollback       # go back to the last good tag
#   ./scripts/deployment.sh --build          # build locally (see warning)
#
# Design notes - each replaces something the previous script did wrong:
#   * Images are PULLED, not built. Building here ran `vite build` + a full
#     dependency install on a 2 GB box next to a live mongod, which OOM-kills
#     mongod. Use --build only as an emergency fallback when CI is unavailable.
#   * No `docker compose down` first. `up -d` recreates only the services whose
#     image or config actually changed, turning a multi-minute outage into a
#     ~3 second container swap.
#   * No `--force-recreate`. It bounced mongo and redis on every deploy,
#     dropping in-flight BullMQ jobs for no reason.
#   * No `--no-cache`. It wipes BuildKit's cache mounts, so the pnpm store
#     cache can never do anything.
#   * `--wait` gates on healthchecks. Plain `up -d` returns 0 as soon as
#     containers are CREATED, so a crash-looping backend reported success.
# ============================================================================

# -E so the ERR trap is inherited by functions and subshells; without it the
# error handling silently stops working inside the very helpers that deploy.
set -Eeuo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.prod.yml)
STATE_DIR="$APP_DIR/.deploy"
CURRENT_TAG_FILE="$STATE_DIR/current_tag"
PREVIOUS_TAG_FILE="$STATE_DIR/previous_tag"
LOCK_FILE="$APP_DIR/.deploy.lock"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-240}"

# Compose reads this; pinning it means a renamed checkout directory can never
# make `down` and `up` target two different projects and strand the volumes.
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-tuberia}"
# The prod overlay is passed explicitly, so the dev default from .env must not
# leak in through COMPOSE_FILE.
unset COMPOSE_FILE

MODE="deploy"
for arg in "$@"; do
    case "$arg" in
        --rollback) MODE="rollback" ;;
        --build)    MODE="build" ;;
        -h|--help)  sed -n '2,25p' "${BASH_SOURCE[0]}"; exit 0 ;;
        *) echo "Unknown argument: $arg" >&2; exit 2 ;;
    esac
done

# ----------------------------------------------------------------------------
# Output helpers
# ----------------------------------------------------------------------------
log()  { printf '\033[0;36m[%s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
ok()   { printf '\033[0;32m  ✓\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m  !\033[0m %s\n' "$*"; }
die()  { printf '\033[0;31m[FATAL]\033[0m %s\n' "$*" >&2; exit 1; }

compose() { docker compose "${COMPOSE_FILES[@]}" "$@"; }

# ----------------------------------------------------------------------------
# Single-instance lock
# ----------------------------------------------------------------------------
# Two pushes to main in quick succession would otherwise run two deploys
# against the same directory and can roll production backwards.
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    die "Another deploy is already running (lock: $LOCK_FILE)"
fi

# ----------------------------------------------------------------------------
# Pre-flight
# ----------------------------------------------------------------------------
log "Pre-flight checks"

[[ -f .env ]]         || die "Missing .env (copy .env.example and fill it in)"
[[ -f backend/.env ]] || die "Missing backend/.env (copy backend/.env.example and fill it in)"

# Capture the caller's IMAGE_TAG BEFORE sourcing .env.
#
# `.env` defines IMAGE_TAG itself, so `source .env` would silently overwrite the
# value the deploy workflow passes in as `IMAGE_TAG=<sha> ./scripts/deployment.sh`.
# Every CI deploy would then ship whatever `.env` happens to say (usually
# `latest`), the recorded tag would never change, and both rollback paths would
# be dead on arrival.
CALLER_IMAGE_TAG="${IMAGE_TAG:-}"

# Load .env so GHCR_OWNER / DOMAIN_NAME / MONGO_* are available to this script,
# not just to Compose. `set -a` exports everything it defines.
set -a
# shellcheck source=/dev/null
source .env
set +a

# An explicitly supplied tag always wins over the file default.
if [[ -n "$CALLER_IMAGE_TAG" ]]; then
    IMAGE_TAG="$CALLER_IMAGE_TAG"
fi

# Validate that required values are actually present AND not still the
# shipped placeholders - a deploy that silently runs with example credentials
# is worse than one that refuses to start.
require_env() {
    local name="$1" value="${!1:-}"
    [[ -n "$value" ]] || die "$name is empty in .env"
}
require_env GHCR_OWNER
require_env DOMAIN_NAME
require_env MONGO_USER
require_env MONGO_PASSWORD

grep -qE '^JWT_SECRET=.{32,}'         backend/.env || die "backend/.env: JWT_SECRET missing or shorter than 32 chars"
grep -qE '^JWT_REFRESH_SECRET=.{32,}' backend/.env || die "backend/.env: JWT_REFRESH_SECRET missing or shorter than 32 chars"
grep -qE '^OPENROUTER_API_KEY=.+'     backend/.env || die "backend/.env: OPENROUTER_API_KEY is not set"

if grep -qE '^(JWT_SECRET|JWT_REFRESH_SECRET)=(your-super-secret|change-this)' backend/.env; then
    die "backend/.env still contains placeholder secrets from .env.example"
fi

# backend/.env holds every application secret; it must not be world-readable.
perms="$(stat -c '%a' backend/.env)"
if [[ "$perms" != "600" ]]; then
    warn "backend/.env is mode $perms; tightening to 600"
    chmod 600 backend/.env
fi

ok "configuration validated"

# No logs/ directory is created: Caddy writes access logs to stdout, where
# Docker's json-file driver rotates them. A bind-mounted log directory is
# unwritable anyway once cap_drop: ALL removes CAP_DAC_OVERRIDE.
mkdir -p "$STATE_DIR" mongo-backups

# ----------------------------------------------------------------------------
# Resolve the tag to deploy
# ----------------------------------------------------------------------------
# Two slots are tracked, not one:
#   current_tag  - what is running right now
#   previous_tag - what was running before that
#
# They answer different questions. Automatic rollback after a FAILED deploy
# wants `current_tag` (the new images never took over, so the last known-good
# tag is still the current one). A manual `--rollback` wants `previous_tag` -
# using `current_tag` there would redeploy the exact version being rolled back
# from, which looks like it worked and changes nothing.
CURRENT_TAG="$(cat "$CURRENT_TAG_FILE" 2>/dev/null || echo '')"
PRIOR_TAG="$(cat "$PREVIOUS_TAG_FILE" 2>/dev/null || echo '')"

if [[ "$MODE" == "rollback" ]]; then
    [[ -n "$PRIOR_TAG" ]] || die "No prior tag recorded in $PREVIOUS_TAG_FILE - nothing to roll back to"
    [[ "$PRIOR_TAG" != "$CURRENT_TAG" ]] || die "Prior tag equals the running tag ($CURRENT_TAG); rollback would be a no-op"
    TARGET_TAG="$PRIOR_TAG"
    log "Rolling back from ${CURRENT_TAG:-unknown} to $TARGET_TAG"
else
    TARGET_TAG="${IMAGE_TAG:-latest}"
fi

# The tag to fall back to if this deploy fails: whatever is running now.
FALLBACK_TAG="$CURRENT_TAG"

export IMAGE_TAG="$TARGET_TAG"
ok "deploying tag: $IMAGE_TAG (running: ${CURRENT_TAG:-none}, prior: ${PRIOR_TAG:-none})"

# ----------------------------------------------------------------------------
# Source sync happens BEFORE this script runs, not inside it
# ----------------------------------------------------------------------------
# This script deliberately does NOT run `git reset --hard`. Doing so would
# rewrite scripts/deployment.sh while bash is part-way through reading it -
# bash reads a script incrementally, so an edit mid-run can make it execute
# garbage or silently skip the rest of the file.
#
# The deploy workflow therefore syncs in a separate SSH step, and a fresh bash
# then reads the updated file. Deploying by hand? Run `git pull` first.
if [[ -d .git ]]; then
    ok "repository at $(git rev-parse --short HEAD)"
fi

# ----------------------------------------------------------------------------
# Fetch images
# ----------------------------------------------------------------------------
if [[ "$MODE" == "build" ]]; then
    warn "Building on this host. On a 2 GB VPS this competes for RAM with"
    warn "mongod and can get it OOM-killed. Prefer CI-built images."
    log "Building images locally and tagging them as $IMAGE_TAG"

    # `docker compose build` is NOT usable here: docker-compose.prod.yml sets
    # `build: !reset null` so production can never accidentally build, which
    # makes `compose build` a silent no-op that then falls through to pulling
    # from GHCR - the exact opposite of what --build is for.
    #
    # Building directly and tagging with the image reference the prod overlay
    # expects means the subsequent `up` finds them locally.
    for svc in backend frontend; do
        log "  building ${svc}"
        docker build \
            --file "${svc}/Dockerfile" \
            --target production \
            --pull \
            --tag "ghcr.io/${GHCR_OWNER}/tuberia-${svc}:${IMAGE_TAG}" \
            . || die "build of ${svc} failed"
    done
    ok "images built locally"
else
    log "Pulling images for tag $IMAGE_TAG"
    compose pull --quiet
    ok "images present locally"
fi

# ----------------------------------------------------------------------------
# Deploy
# ----------------------------------------------------------------------------
log "Starting services (health-gated, timeout ${HEALTH_TIMEOUT}s)"

deploy_failed=0
compose up -d --remove-orphans --wait --wait-timeout "$HEALTH_TIMEOUT" || deploy_failed=1

# ----------------------------------------------------------------------------
# Verify readiness
# ----------------------------------------------------------------------------
# --wait only proves the containers' own healthchecks pass, and the backend's
# is deliberately shallow (liveness). This asserts the DEEP check: that the API
# can actually reach MongoDB and Redis.
if [[ "$deploy_failed" -eq 0 ]]; then
    log "Verifying application readiness"
    ready=0
    for _ in $(seq 1 30); do
        if compose exec -T backend node -e "
            fetch('http://127.0.0.1:5000/health')
              .then(r => r.json())
              .then(h => process.exit(h.status === 'ok' ? 0 : 1))
              .catch(() => process.exit(1))
        " >/dev/null 2>&1; then
            ready=1
            break
        fi
        sleep 2
    done

    if [[ "$ready" -eq 1 ]]; then
        ok "backend reports all dependencies healthy"
    else
        warn "backend never reported status=ok"
        deploy_failed=1
    fi
fi

# ----------------------------------------------------------------------------
# Roll back on failure
# ----------------------------------------------------------------------------
if [[ "$deploy_failed" -ne 0 ]]; then
    printf '\n'
    warn "Deployment of $IMAGE_TAG FAILED. Recent backend logs:"
    compose logs --tail 40 backend || true

    if [[ -n "$FALLBACK_TAG" && "$FALLBACK_TAG" != "$IMAGE_TAG" ]]; then
        warn "Rolling back to $FALLBACK_TAG"
        export IMAGE_TAG="$FALLBACK_TAG"
        if compose up -d --remove-orphans --wait --wait-timeout "$HEALTH_TIMEOUT"; then
            die "Deploy failed; successfully rolled back to $FALLBACK_TAG"
        fi
        die "Deploy failed AND rollback to $FALLBACK_TAG also failed - manual intervention required"
    fi

    die "Deploy failed and there is no previously deployed tag to roll back to"
fi

# Record state only after a fully verified deploy. The tag being replaced
# becomes the rollback target, unless this deploy WAS a rollback (in which case
# the slots would ping-pong between two versions forever).
if [[ "$MODE" != "rollback" && -n "$CURRENT_TAG" && "$CURRENT_TAG" != "$IMAGE_TAG" ]]; then
    printf '%s' "$CURRENT_TAG" > "$PREVIOUS_TAG_FILE"
fi
printf '%s' "$IMAGE_TAG" > "$CURRENT_TAG_FILE"

# ----------------------------------------------------------------------------
# Clean up
# ----------------------------------------------------------------------------
log "Pruning dangling images"
# ONLY dangling (untagged, unreferenced) images. Deliberately NOT `-a`, which
# would delete the previous tag's image and make rollback impossible, and
# never `--volumes`, which removes any volume not currently attached to a
# running container - that is the whole database.
docker image prune -f >/dev/null 2>&1 || true
ok "done"

printf '\n'
log "Deployment complete"
compose ps --format 'table {{.Service}}\t{{.Status}}'
printf '\n'
ok "live at https://${DOMAIN_NAME}"
ok "deployed tag: $IMAGE_TAG"
printf '  roll back with: ./scripts/deployment.sh --rollback\n\n'
