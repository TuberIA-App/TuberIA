# syntax=docker/dockerfile:1.19
# ============================================================================
# TuberIA backend image
# ============================================================================
# Build context is the REPOSITORY ROOT, not ./backend, because the pnpm
# workspace's lockfile and manifest live there:
#
#     docker build -f backend/Dockerfile .
#
# Compose already does this (see the `build:` block in docker-compose.yml).
# `backend/Dockerfile.dockerignore` keeps the frontend's source out of the
# context so touching frontend code never invalidates this image's cache.
# ============================================================================

ARG NODE_VERSION=24.15.0
ARG PNPM_VERSION=11.20.0

# ----------------------------------------------------------------------------
# base - shared runtime foundation
# ----------------------------------------------------------------------------
# node:24-slim (Debian/glibc), NOT alpine (musl). The backend loads
# @sentry/node-cpu-profiler, a native addon whose glibc prebuild is the
# best-tested one; musl builds have historically been a source of
# "cannot open shared object file" crashes at boot.
FROM node:${NODE_VERSION}-slim AS base

# pnpm is installed explicitly rather than via `corepack enable`: Corepack is
# no longer distributed with Node 25+, and its signature checks break whenever
# npm rotates keys. An explicit pin matches package.json "packageManager"
# exactly, so pnpm never tries to self-switch mid-build.
ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false
RUN npm install --global "pnpm@${PNPM_VERSION}" \
 && npm cache clean --force

WORKDIR /app

# ----------------------------------------------------------------------------
# deps - resolve dependencies (the expensive, highly cacheable layer)
# ----------------------------------------------------------------------------
FROM base AS deps

# Copy ONLY the manifests first. Source changes then cannot invalidate the
# install layer - only a lockfile/manifest change can.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# --frozen-lockfile: fail instead of silently re-resolving (reproducible builds)
# --filter ...     : install only what the backend needs, skipping Vite/React
# cache mount      : the pnpm store persists across builds without landing in
#                    a layer, so re-installs are near-instant and add 0 bytes
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile --filter "@tuberia/backend..."

# ----------------------------------------------------------------------------
# development - hot reload via nodemon
# ----------------------------------------------------------------------------
FROM deps AS development

ENV NODE_ENV=development

# Source is bind-mounted by docker-compose.dev.yml; this COPY only makes the
# image usable standalone (e.g. `docker run` without compose).
COPY backend/ ./backend/

WORKDIR /app/backend
EXPOSE 5000

# Invoke nodemon directly instead of `pnpm dev`. As PID 1, pnpm does not
# forward SIGTERM, so `docker compose stop` would hang for the full grace
# period and then SIGKILL. nodemon does forward it.
CMD ["./node_modules/.bin/nodemon", "--watch", "src", "--ext", "js,json", "--exec", "node src/index.js"]

# ----------------------------------------------------------------------------
# pruned - production-only dependency tree
# ----------------------------------------------------------------------------
FROM deps AS pruned

COPY backend/ ./backend/

# `pnpm deploy` produces a self-contained directory: real (non-symlinked)
# node_modules plus the package's own files. Copying `node_modules` between
# stages by hand does NOT work in a pnpm workspace - those entries are symlinks
# into the root .pnpm virtual store and dangle the moment they leave the stage.
#
# --legacy is required because this workspace does not use injected
# dependencies; without it pnpm 10+ refuses to deploy from a non-injected repo.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm --filter "@tuberia/backend" --prod --legacy deploy /prod/backend

# ----------------------------------------------------------------------------
# production - final runtime image
# ----------------------------------------------------------------------------
# Deliberately built on the raw node image rather than on `base`: the runtime
# executes `node src/index.js` and never needs pnpm, so inheriting the
# globally-installed package manager would ship ~40 MB of dead weight and an
# extra npm/pnpm attack surface into production.
FROM node:${NODE_VERSION}-slim AS production

# Keep V8's heap under the container memory limit so the kernel OOM killer
# never has to choose - Node exits with a clean heap error instead.
ENV NODE_ENV=production \
    PORT=5000 \
    NODE_OPTIONS="--max-old-space-size=384"

WORKDIR /app

# `node` (uid/gid 1000) ships with the official image - no need to invent a
# user, and uid 1000 matches the typical host user on bind mounts.
COPY --from=pruned --chown=node:node /prod/backend ./

# Winston writes here; must be writable by the unprivileged user.
RUN mkdir -p logs && chown node:node logs

USER node

EXPOSE 5000

# Node itself is PID 1 so the app's own SIGTERM handler runs and BullMQ can
# drain in-flight jobs. Do NOT wrap this in pnpm/npm: measured, they swallow
# the signal. tini is unnecessary - Node reaps its own children here.
CMD ["node", "src/index.js"]

# Liveness is defined in docker-compose.yml (one place, environment-aware)
# rather than baked in, so dev and prod can differ.
HEALTHCHECK NONE

LABEL org.opencontainers.image.title="TuberIA Backend" \
      org.opencontainers.image.description="Express 5 API, BullMQ workers and YouTube ingestion for TuberIA" \
      org.opencontainers.image.source="https://github.com/TuberIA-App/TuberIA" \
      org.opencontainers.image.licenses="PolyForm-Noncommercial-1.0.0"
