# Caddy

Caddy terminates TLS and is the only service in the production stack that binds
a public port. Its full configuration, with the reasoning inline, lives in
[`/Caddyfile`](../../Caddyfile).

For deployment steps see [`/DEPLOYMENT.md`](../../DEPLOYMENT.md).

---

## What it does

| Path | Upstream |
|---|---|
| `/api/*` | `backend:5000` |
| everything else | `frontend:8080` |

Certificates are obtained and renewed from Let's Encrypt automatically, HTTP
redirects to HTTPS, and HTTP/2 and HTTP/3 are on by default. There is nothing
to configure beyond `DOMAIN_NAME` and `SSL_EMAIL` in `.env`.

---

## Details worth knowing

**`handle`, not `handle_path`.** `handle_path` strips the matched prefix, so
`/api/videos` would arrive at the backend as `/videos`. `backend/src/app.js`
mounts its router with `app.use('/api', routes)` and expects the prefix to
survive. `handle_path` is the more commonly cited snippet online and looks like
a drop-in replacement — it would 404 every API route.

**Directive order is fixed.** Caddy executes directives in a defined order
(`root` → `header` → `redir` → `rewrite` → `encode` → `handle` →
`reverse_proxy`), not in the order they appear in the file. A `header` block
written after a `handle` block still applies.

**Security headers use `>`.** That means "set and defer". Helmet on Express
emits its own `X-Frame-Options`, HSTS and `Referrer-Policy` for `/api/*`
responses; a plain `header Foo bar` is applied on the way *in*, so the upstream
value would win. Deferring makes Caddy authoritative.

**`X-XSS-Protection` is removed, not set.** The header is deprecated, the XSS
Auditor it controlled has been deleted from every major browser, and
`1; mode=block` can itself introduce information disclosure.

**CSP currently ships as report-only.** See section 8 of the root deployment
guide for how to turn on enforcement.

**Access logs go to stdout.** Writing to a mounted log directory fails under the
production hardening: `cap_drop: ALL` removes `CAP_DAC_OVERRIDE`, so root inside
the container cannot write to a host directory owned by another uid, and Caddy
crash-loops with `permission denied`. Docker's `json-file` driver rotates the
stdout stream instead, and `docker compose logs caddy` shows access logs and
errors together.

**The healthcheck probes Caddy itself**, via an internal-only site block on
`127.0.0.1:2021/healthz`. The previous version proxied to
`backend:5000/api/health`, which marked the TLS terminator unhealthy whenever
the application was down — exactly when the proxy needs to stay up to return a
clean 502 — and never verified Caddy's own config or listener.

---

## Operations

```bash
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

$COMPOSE logs -f caddy                    # access logs + errors
$COMPOSE exec caddy caddy validate --config /etc/caddy/Caddyfile
$COMPOSE restart caddy                    # after editing the Caddyfile
$COMPOSE exec caddy caddy fmt --overwrite /etc/caddy/Caddyfile
```

Certificates live in the `caddy_data` volume. Do not delete it casually —
Let's Encrypt rate-limits certificate issuance per domain, so repeatedly
wiping it can lock you out of new certificates for a week.

### Coexisting with other services on ports 80/443

Only one process can bind them. If the host already runs another web server:

- **Preferred** — make this Caddy the single edge proxy and add the other
  site as another block in the `Caddyfile`.
- **Alternative** — keep the existing proxy and point it at TuberIA. Publish
  `frontend` and `backend` on loopback ports (as `docker-compose.dev.yml`
  does) and proxy to those, leaving the `caddy` service out of the stack.

To verify the whole TLS path locally without touching 80/443, use
`docker-compose.local-prod.yml`, which moves Caddy to `127.0.0.1:7104/7105`.
