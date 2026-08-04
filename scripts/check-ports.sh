#!/usr/bin/env bash
# ============================================
# check-ports.sh - verify TuberIA's port block is free
# ============================================
# Run this before `pnpm dev` on a machine that hosts several Docker projects.
# It reports which of the ports TuberIA wants are already taken, and by what,
# so you can move TuberIA's block in .env instead of fighting a collision.
#
#   ./scripts/check-ports.sh
#
# Exit codes: 0 = all free, 1 = at least one port is in use.
# ============================================
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Load .env if present so we check the ports actually configured, not defaults.
if [[ -f .env ]]; then
    set -a
    # shellcheck source=/dev/null
    source .env
    set +a
fi

HOST_BIND_ADDR="${HOST_BIND_ADDR:-127.0.0.1}"

declare -a CHECKS=(
    "${FRONTEND_HOST_PORT:-7100}|Frontend (Vite / nginx)"
    "${BACKEND_HOST_PORT:-7101}|Backend API (Express)"
    "${MONGO_HOST_PORT:-7102}|MongoDB (debug only)"
    "${REDIS_HOST_PORT:-7103}|Redis (debug only)"
    "${CADDY_HTTP_PORT:-7104}|Caddy HTTP"
    "${CADDY_HTTPS_PORT:-7105}|Caddy HTTPS"
)

# Prefer `ss`; fall back to `lsof`, then `netstat`.
port_user() {
    local port="$1"
    if command -v ss >/dev/null 2>&1; then
        ss -tlnp 2>/dev/null | awk -v p=":${port}\$" '$4 ~ p {print; exit}'
    elif command -v lsof >/dev/null 2>&1; then
        lsof -nP -iTCP:"${port}" -sTCP:LISTEN 2>/dev/null | awk 'NR==2 {print; exit}'
    else
        netstat -tlnp 2>/dev/null | awk -v p=":${port}\$" '$4 ~ p {print; exit}'
    fi
}

echo "TuberIA port check"
echo "  published ports bind to: ${HOST_BIND_ADDR}"
echo

conflicts=0
for entry in "${CHECKS[@]}"; do
    port="${entry%%|*}"
    label="${entry#*|}"
    if holder="$(port_user "${port}")" && [[ -n "${holder}" ]]; then
        printf '  \033[31m✗\033[0m %-5s  %-26s IN USE\n' "${port}" "${label}"
        printf '        └─ %s\n' "${holder}"
        conflicts=$((conflicts + 1))
    else
        printf '  \033[32m✓\033[0m %-5s  %-26s free\n' "${port}" "${label}"
    fi
done

echo
if (( conflicts > 0 )); then
    cat <<EOF
${conflicts} port(s) already in use.

Fix: edit .env and shift TuberIA to another free block, e.g.

    FRONTEND_HOST_PORT=7200
    BACKEND_HOST_PORT=7201
    MONGO_HOST_PORT=7202
    REDIS_HOST_PORT=7203
    CADDY_HTTP_PORT=7204
    CADDY_HTTPS_PORT=7205

Nothing inside the containers changes - only the host-side published ports.
EOF
    exit 1
fi

echo "All ports free. Safe to start TuberIA alongside your other projects."
