# Docker & local development

How TuberIA runs in containers, and how to run it beside your other projects
without a single port collision.

---

## TL;DR

```bash
cp .env.example .env
cp backend/.env.example backend/.env    # then fill in the secrets
./scripts/check-ports.sh                # confirm 7100-7105 are free
pnpm dev                                # build + start with hot reload
```

| Service | URL |
|---|---|
| Frontend | <http://127.0.0.1:7100> |
| Backend API | <http://127.0.0.1:7101/api> |
| Health (deep) | <http://127.0.0.1:7101/health> |
| MongoDB | `127.0.0.1:7102` |
| Redis | `127.0.0.1:7103` |

---

## File layout

| File | Committed | Purpose |
|---|---|---|
| `docker-compose.yml` | yes | Base topology: images, healthchecks, volumes, logging. Publishes **no** ports and names **no** containers. |
| `docker-compose.dev.yml` | yes | Dev overlay: `target: development`, file watching, loopback-published ports. |
| `docker-compose.prod.yml` | yes | Prod overlay: GHCR images, Caddy, resource limits, hardening, internal network. |
| `docker-compose.local-prod.yml` | yes | Runs the **prod** stack locally against locally built images, for pre-deploy verification. |

`.env` sets `COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml`, so a bare
`docker compose up` picks up the dev overlay with no `-f` flags.

There is deliberately **no `docker-compose.override.yml`**. Compose auto-loads
it for a bare `docker compose up` but ignores it whenever `-f` is passed, so the
same file was sometimes active and sometimes not. Worse, it was gitignored yet
held the only backend healthcheck — meaning a fresh clone had no healthcheck at
all and `condition: service_healthy` could never be satisfied.

---

## Ports: why 7100-7105

This project claims the contiguous block **7100-7105**, and every port is bound
to **127.0.0.1**.

**Why a private block?** Defaults collide. Vite wants 5173, Postgres 5432,
Redis 6379, Mongo 27017 — and if you run more than one project, so does
everything else. A dedicated block means TuberIA never fights a sibling stack.
The block also sits below this kernel's ephemeral range
(`net.ipv4.ip_local_port_range`, typically 32768-60999), so a static bind here
can never race an outbound connection.

**Why loopback?** Docker inserts its own iptables DNAT rules that **bypass
ufw/firewalld entirely**. A port published as `5000:5000` is reachable from the
LAN — and often the internet — even when `ufw status` says that port is denied.
Publishing as `127.0.0.1:5000:5000` is immune: the kernel will not route
external traffic to a loopback address.

### Moving the block

Every port is an `.env` variable. If 7100-7105 is taken on your machine:

```bash
FRONTEND_HOST_PORT=7200
BACKEND_HOST_PORT=7201
MONGO_HOST_PORT=7202
REDIS_HOST_PORT=7203
CADDY_HTTP_PORT=7204
CADDY_HTTPS_PORT=7205
```

Nothing inside the containers changes — only the host-side mapping.
Run `./scripts/check-ports.sh` to see what is free and what is holding a port.

> **Naming matters.** These variables all end in `_HOST_PORT`. Do **not**
> shorten them to `REDIS_PORT` / `BACKEND_PORT`: those names are also used by
> the backend application (`backend/.env`) with different values — `REDIS_PORT`
> there is `6379`, the port *inside* the Docker network. Since
> `check-ports.sh` sources `.env` into your shell, a short name would leak a
> host port into the app's config and point it at a Redis that isn't there.

---

## Hot reload

Dev uses Compose's `develop.watch`, not bind mounts:

```bash
docker compose up --watch     # or: pnpm dev
```

**Why not bind mounts?** The old setup mounted `./backend:/app` with an
anonymous volume over `/app/node_modules`. Under pnpm that combination is
fatal: a package's `node_modules` is a tree of symlinks pointing into the
workspace-root `node_modules/.pnpm` store, which lives *outside* the mounted
directory. The anonymous volume preserved the symlinks while masking the store
they point at, giving `MODULE_NOT_FOUND`.

`watch` copies changed files *into* the container instead of mounting the host
tree over it, so the container's `node_modules` stays intact and no filesystem
polling (`CHOKIDAR_USEPOLLING`) is needed.

| Change | Action |
|---|---|
| `backend/src/**`, `frontend/src/**`, `index.html`, `public/**` | synced live |
| `vite.config.js`, `backend/.env` | synced + restart |
| `pnpm-lock.yaml`, any `package.json` | image rebuild |

Plain `up -d` (without `--watch`) starts the stack but will **not** sync edits.

---

## How the frontend reaches the API

**The same way in both environments: a relative `/api`, same-origin.**

| | Who serves `/api` |
|---|---|
| dev | the Vite dev server proxies it to `backend:5000` (`vite.config.js`) |
| prod | Caddy routes `/api/*` to `backend:5000` |

`VITE_API_URL` is `/api` in both. This is deliberate — an absolute URL in dev
(e.g. `http://127.0.0.1:7101/api`) makes every browser request cross-origin and
puts CORS on a code path that production never exercises. It was already
failing: the dev CORS allowlist was hardcoded to `localhost:5173` and
`localhost:3000`, so the browser blocked every API call the moment the port
changed — and `localhost` and `127.0.0.1` are different origins to a browser
regardless of port.

The backend still allows any loopback origin when `NODE_ENV !== 'production'`,
so running `pnpm --filter @tuberia/frontend dev` outside Docker against the
published backend port also works. In production the allowlist is exactly one
origin: `FRONTEND_URL`.

> The Vite proxy deliberately does **not** rewrite `/api` away.
> `backend/src/app.js` mounts its router with `app.use('/api', routes)`, so the
> backend expects the prefix. The old config stripped it and every proxied
> request 404'd.

---

## Common commands

```bash
pnpm dev                  # build + start with watch
pnpm dev:down             # stop
pnpm dev:logs             # follow all logs
pnpm ports                # check for port collisions

docker compose logs -f backend
docker compose exec backend sh
docker compose exec redis redis-cli
docker compose exec mongo mongosh -u mongo -p mongo --authenticationDatabase admin

# tests (need Mongo + Redis, so run them inside the network)
docker compose exec backend ./node_modules/.bin/vitest run --project unit
docker compose exec backend ./node_modules/.bin/vitest run --project integration

docker compose down -v    # stop AND delete volumes (wipes the database)
```

Note there are **no `container_name:` entries** any more, so address services
by their compose service name (`docker compose logs backend`), not by a global
container name (`docker logs tuberia-backend`). Hardcoded container names are a
flat, machine-global namespace shared with every other Docker project on the
box, and they block `--scale` outright.

---

## Testing the production stack locally

Worth doing before any VPS deploy — several production-only settings
(read-only root filesystems, dropped capabilities, the internal network, Caddy
TLS) simply are not exercised by the dev overlay.

```bash
docker build -f backend/Dockerfile  --target production \
    -t ghcr.io/obezeq/tuberia-backend:localtest .
docker build -f frontend/Dockerfile --target production \
    -t ghcr.io/obezeq/tuberia-frontend:localtest .

IMAGE_TAG=localtest DOMAIN_NAME=localhost COMPOSE_FILE= \
  docker compose -f docker-compose.yml \
                 -f docker-compose.prod.yml \
                 -f docker-compose.local-prod.yml up -d --wait

curl -k https://localhost:7105/api/health     # -k: Caddy uses a local CA cert

COMPOSE_FILE= docker compose -f docker-compose.yml \
    -f docker-compose.prod.yml -f docker-compose.local-prod.yml down -v
```

---

## Images

| | Backend | Frontend |
|---|---|---|
| Base | `node:24-slim` | `nginxinc/nginx-unprivileged:1.29-alpine` |
| Runs as | `node` (uid 1000) | `nginx` (uid 101) |
| Internal port | 5000 | 8080 |
| Size | ~476 MB | ~83 MB |

Both build from the **repository root**, not from their own directory, because
the pnpm workspace lockfile lives at the root:

```bash
docker build -f backend/Dockerfile .
```

Each has its own `Dockerfile.dockerignore`, which BuildKit prefers over the
root `.dockerignore`. That is what keeps frontend edits from invalidating the
backend image cache even though both share a build context.

**Why `node:24-slim` and not alpine?** The backend loads
`@sentry/node-cpu-profiler`, a native addon. Its glibc prebuild is the
best-tested one, and glibc avoids musl's slower allocator on this workload.
Alpine would save ~65 MB; correctness and predictable performance won.

**Why not `corepack enable`?** Corepack is no longer distributed with Node 25+,
and its signature checks break whenever npm rotates signing keys. The images
install an explicitly pinned `pnpm@11.20.0` that matches `packageManager` in
`package.json`, so pnpm never tries to self-switch mid-build.

**Why `CMD ["node", "src/index.js"]` and not `pnpm start`?** As PID 1, pnpm does
not forward SIGTERM. The container would hang for its full grace period and
then be SIGKILLed, orphaning in-flight BullMQ jobs in the `active` state.

---

## Health checks

Two distinct endpoints, deliberately:

| Endpoint | Asserts | Polled by |
|---|---|---|
| `/health/live` | the process can serve HTTP | the container `HEALTHCHECK` |
| `/health` | Mongo **and** Redis are reachable | `scripts/deployment.sh` |

The container probe is shallow on purpose. A liveness probe that also checked
dependencies would flap the backend on any transient Redis blip — and since the
frontend declares `depends_on: backend: {condition: service_healthy}`, a single
blip would cascade into a wedged deploy.

---

## Troubleshooting

**A port is already in use** — run `./scripts/check-ports.sh`; it names the
process holding each port. Then shift the block in `.env`.

**`MODULE_NOT_FOUND` after changing dependencies** — the image needs rebuilding:
`docker compose up -d --build`.

**Mongo won't start after a compose change** — check you have not renamed a
volume: `docker volume ls | grep tuberia`. Renaming a volume silently creates a
new, empty one rather than failing.

**Redis reports healthy but every queue operation fails** — the healthcheck uses
`redis-cli -e ping`. The `-e` is load-bearing: plain `redis-cli ping` exits 0
even on an error reply, so a `NOAUTH` or `LOADING` response would still be
reported healthy.

**Too many Docker networks / "all predefined address pools have been assigned"**
— see `DEPLOYMENT.md` for the `default-address-pools` setting in
`/etc/docker/daemon.json`.
