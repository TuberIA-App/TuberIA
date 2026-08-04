#!/usr/bin/env bash
# ============================================================================
# Run the PRODUCTION stack locally, against locally built images
# ============================================================================
#   ./scripts/local-prod.sh          # build, start, smoke test
#   ./scripts/local-prod.sh down     # stop and remove the test volumes
#
# Exercises the production configuration - read-only root filesystems, dropped
# capabilities, non-root users, the internal network, Caddy with TLS - none of
# which the dev overlay covers. Worth running before any VPS deploy.
#
# Caddy is published on loopback high ports (7104/7105 by default) rather than
# 80/443, so this cannot collide with anything else serving HTTP on the machine.
# ============================================================================
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

[[ -f .env ]] || { echo "Missing .env (cp .env.example .env)" >&2; exit 1; }
[[ -f backend/.env ]] || { echo "Missing backend/.env (cp backend/.env.example backend/.env)" >&2; exit 1; }

# Load .env first, then force the local-test values on top. Order matters:
# .env defines IMAGE_TAG and DOMAIN_NAME itself, so setting them beforehand
# would just be overwritten by the source.
set -a
# shellcheck source=/dev/null
source .env
set +a

# The dev overlay is .env's default COMPOSE_FILE; this script passes its own -f
# flags, so that default must not also apply.
unset COMPOSE_FILE

export IMAGE_TAG=localtest        # never deploy a real tag from here
export DOMAIN_NAME=localhost      # Caddy issues a locally-trusted certificate
export SSL_EMAIL="${SSL_EMAIL:-admin@example.com}"

: "${GHCR_OWNER:?GHCR_OWNER must be set in .env}"

COMPOSE_FILES=(
    -f docker-compose.yml
    -f docker-compose.prod.yml
    -f docker-compose.local-prod.yml
)

compose() { docker compose "${COMPOSE_FILES[@]}" "$@"; }

if [[ "${1:-up}" == "down" ]]; then
    echo "Stopping local production stack and removing its volumes..."
    compose down -v
    exit 0
fi

echo "[1/3] Building production images as :${IMAGE_TAG}"
for svc in backend frontend; do
    docker build \
        --file "${svc}/Dockerfile" \
        --target production \
        --tag "ghcr.io/${GHCR_OWNER}/tuberia-${svc}:${IMAGE_TAG}" \
        .
done

echo "[2/3] Starting the stack (health-gated)"
compose up -d --wait --wait-timeout 300

echo "[3/3] Smoke test"
HTTPS_PORT="${CADDY_HTTPS_PORT:-7105}"

# The hostname MUST be "localhost", not 127.0.0.1. Caddy selects a site by SNI,
# and a request to a bare IP sends no SNI at all - so it matches no site and the
# handshake fails with "tlsv1 alert internal error", which looks like a broken
# stack when nothing is wrong. -k because the certificate is issued by Caddy's
# own local CA, which this machine does not trust.
URL="https://localhost:${HTTPS_PORT}"

# Caddy provisions its local certificate on first use; give it a few seconds.
for attempt in $(seq 1 10); do
    if curl -fsSk -m 15 "${URL}/api/health" | grep -q '"status"'; then
        echo
        echo "  Production stack is healthy."
        echo "  App  : ${URL}"
        echo "  API  : ${URL}/api/health"
        echo "  Stop : ./scripts/local-prod.sh down"
        exit 0
    fi
    [[ $attempt -eq 1 ]] && echo "  waiting for Caddy to provision its local certificate..."
    sleep 3
done

echo "  Smoke test FAILED" >&2
compose ps
compose logs --tail 30 caddy backend >&2
exit 1
