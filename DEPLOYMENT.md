# Production deployment

TuberIA deploys as five containers behind Caddy, which terminates TLS and is
the only service that binds a public port.

**Images are built in GitHub Actions and pulled by the VPS.** The server never
builds. A `vite build` plus a full dependency install on a 2 GB box competes for
RAM with `mongod` and reliably gets it OOM-killed mid-deploy.

```
                 ┌──────── VPS ────────────────────────────────┐
  internet ──443─┤ caddy ──┬── frontend  (nginx, 8080)          │
                 │         └── backend   (node,  5000)          │
                 │                 └── mongo / redis            │
                 │                    (internal network only)   │
                 └─────────────────────────────────────────────┘
```

---

## 1. Server preparation

```bash
# Docker (official convenience script)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"   # log out and back in

git clone https://github.com/TuberIA-App/TuberIA.git ~/TuberIA
cd ~/TuberIA
```

### Docker daemon settings

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "local",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "default-address-pools": [
    { "base": "172.20.0.0/14", "size": 24 }
  ]
}
```

Then `sudo systemctl restart docker`.

**Why.** The default `json-file` driver has *no* rotation, so container logs
grow until the disk fills. And Docker's default network pool hands out a `/16`
per network, allowing only ~31 networks before
`all predefined address pools have been assigned`. A `/24` size yields ~1000
networks — this matters as soon as the host runs more than a handful of stacks.

> Restarting the daemon restarts running containers. Do this before your first
> deploy, or during a maintenance window.

---

## 2. Configuration

Two files, neither committed:

```bash
cp .env.example .env                  # compose: ports, images, domain
cp backend/.env.example backend/.env  # application secrets
chmod 600 backend/.env
```

**`.env`** — set at minimum:

```bash
GHCR_OWNER=obezeq         # lowercase GitHub org/user that owns the images
DOMAIN_NAME=tuberia.app
SSL_EMAIL=you@example.com
MONGO_USER=tuberia
MONGO_PASSWORD=<a long random string>
```

**`backend/.env`** — generate real secrets:

```bash
echo "JWT_SECRET=$(openssl rand -hex 32)"          >> backend/.env
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"  >> backend/.env
```

Also set `OPENROUTER_API_KEY`, and a `MONGODB_URI` matching the credentials
above:

```
MONGODB_URI=mongodb://tuberia:<password>@mongo:27017/tuberia_db?authSource=admin
```

`scripts/deployment.sh` refuses to deploy if a secret is missing, shorter than
32 characters, or still holds a placeholder from `.env.example`.

> **Docker secrets are not used.** Everything comes from `backend/.env` with
> mode 600. One mechanism for every environment means one place to look when
> something is missing, and no code path that only runs in production.

---

## 3. DNS

Point both records at the server:

| Type | Name | Value |
|---|---|---|
| A | `@` | your server IP |
| A | `www` | your server IP |

Caddy obtains and renews the certificate automatically on first request. It
needs ports 80 and 443 reachable from the internet — ACME's HTTP-01 challenge
uses port 80, so do not firewall it off.

---

## 4. GitHub repository setup

Under **Settings → Environments**, create an environment named `production`
(protection rules such as required reviewers apply here).

**Secrets** (environment-scoped, not repository-wide):

| Secret | Value |
|---|---|
| `DO_SSH_PRIVATE_KEY` | private key authorised on the VPS |
| `VPS_HOST` | server hostname or IP |
| `DEPLOY_USER` | SSH user |
| `SSH_KNOWN_HOSTS` | output of `ssh-keyscan -t ed25519 <host>` |

**Variables:**

| Variable | Value |
|---|---|
| `DOMAIN_NAME` | `tuberia.app` |

`SSH_KNOWN_HOSTS` is pinned rather than generated at deploy time. Running
`ssh-keyscan` on every run is trust-on-first-use — it accepts whatever key is
presented, so it does not prevent the man-in-the-middle attack it appears to.

Capture it once, on the VPS:

```bash
ssh-keyscan -t ed25519 "$(hostname -f)"
```

---

## 5. Deploying

### Automatic

Push to `main`. The pipeline runs: **CI gate → build and push images → SSH to
the VPS → health-gated restart → public smoke test.**

A failure at any stage stops the deploy, and an unhealthy new version is rolled
back automatically.

### Manual

```bash
cd ~/TuberIA
git pull
IMAGE_TAG=<commit-sha> ./scripts/deployment.sh
```

### Rollback

```bash
./scripts/deployment.sh --rollback
```

The last successfully deployed tag is recorded in `.deploy/current_tag`.
Because images are tagged with the immutable commit SHA, rolling back re-pulls
a known-good image rather than rebuilding anything.

### Emergency: build on the server

```bash
./scripts/deployment.sh --build
```

Only when CI is unavailable. On a 2 GB VPS this competes for RAM with `mongod`
and may get it OOM-killed.

---

## 6. What the deploy actually does

1. Validates `.env` and `backend/.env`, and tightens `backend/.env` to 0600.
2. Takes an exclusive `flock`, so two concurrent deploys cannot interleave.
3. Pulls the images for the requested tag.
4. `docker compose up -d --remove-orphans --wait --wait-timeout 240`.
5. Polls `/health` until the API confirms Mongo *and* Redis are reachable.
6. On failure: prints logs, redeploys the previous tag, exits non-zero.
7. On success: records the tag and prunes only dangling images.

Deliberately absent, each having caused a real problem:

| Not done | Why |
|---|---|
| `docker compose down` first | Turned a ~3 s container swap into a multi-minute outage. |
| `--force-recreate` | Bounced Mongo and Redis every deploy, dropping in-flight BullMQ jobs. |
| `build --no-cache` | Wiped BuildKit cache mounts, so the pnpm store cache could never help. |
| `up -d` without `--wait` | Returned 0 as soon as containers were *created* — a crash-looping backend reported success. |
| `docker system prune -a --volumes` | `-a` deletes the rollback image; `--volumes` deletes the database. |

---

## 7. Verifying

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
curl https://tuberia.app/api/health
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend
```

Confirm the isolation invariants hold — CI asserts these on every run, but it
is worth checking on the server after the first deploy:

```bash
# Mongo and Redis must publish nothing, and must be on backend-internal only.
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps --format \
  'table {{.Service}}\t{{.Ports}}'
```

Only `caddy` should show published ports.

---

## 8. Enabling CSP enforcement

The `Caddyfile` currently sends **`Content-Security-Policy-Report-Only`**. The
allowlist was derived from the source, but a missing host in an *enforcing*
policy fails silently in the browser, so it ships in report-only mode first.

1. Browse the app — dashboard, channel view, video summary, auth — with the
   browser console open.
2. Any `[Report Only] Refused to load …` message names a host to add.
3. When the console is clean, delete the `-Report-Only` suffix from the header
   name in the `(csp)` block and redeploy.

---

## 9. Backups

```bash
./scripts/backup-redis.sh    # Redis (BullMQ job state)

docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec mongo mongodump --username "$MONGO_USER" --password "$MONGO_PASSWORD" \
  --authenticationDatabase admin --archive=/backups/dump-$(date +%F).archive
```

`./mongo-backups` is mounted into the Mongo container at `/backups`.

Back up **before** the first deploy that lands the Redis 8 upgrade: Redis 8
reads Redis 7 data forward-compatibly, but the reverse is not true.

---

## 10. Resource budget

Tuned for 2 GB RAM. Adjust in `docker-compose.prod.yml` on a larger box.

| Service | Memory limit | CPU |
|---|---|---|
| mongo | 640 MB | 1.0 |
| backend | 512 MB | 1.0 |
| redis | 256 MB | 0.5 |
| caddy | 128 MB | 0.5 |
| frontend | 64 MB | 0.25 |
| **Total** | **~1.6 GB** | leaves ~400 MB for the OS |

Two settings that matter more than they look:

- **`mongod --wiredTigerCacheSizeGB 0.25`** — WiredTiger sizes its cache from
  *host* RAM and ignores the cgroup limit. Without this it tries to take ~1 GB
  regardless of `mem_limit`.
- **Redis `maxmemory` 96 MB inside a 256 MB limit** — `maxmemory` bounds the
  dataset only. It excludes client buffers and the copy-on-write pages of the
  `fork()` an AOF rewrite performs. Setting them equal means the kernel
  OOM-kills Redis before Redis can apply its own policy, and with `noeviction`
  (required by BullMQ) that means lost jobs.

---

## Deferred: MongoDB 7 → 8

Pinned to `mongo:7.0` (supported to 2027-08-31). Major upgrades need an
in-place binary swap plus a `featureCompatibilityVersion` step and **cannot be
downgraded**, so this belongs in its own change, gated on a verified restore
from backup — not bundled with an infrastructure refactor.
