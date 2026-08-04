# syntax=docker/dockerfile:1.19
# ============================================================================
# TuberIA frontend image (Vite + React, served by nginx in production)
# ============================================================================
# Build context is the REPOSITORY ROOT (the pnpm workspace lockfile lives
# there):
#
#     docker build -f frontend/Dockerfile .
#
# `frontend/Dockerfile.dockerignore` keeps backend source out of the context.
# ============================================================================

ARG NODE_VERSION=24.15.0
ARG PNPM_VERSION=11.20.0
ARG NGINX_VERSION=1.29

# ----------------------------------------------------------------------------
# base - toolchain
# ----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-slim AS base

ARG PNPM_VERSION
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false
RUN npm install --global "pnpm@${PNPM_VERSION}" \
 && npm cache clean --force

WORKDIR /app

# ----------------------------------------------------------------------------
# deps - dependency resolution (cached independently of source)
# ----------------------------------------------------------------------------
FROM base AS deps

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile --filter "@tuberia/frontend..."

# ----------------------------------------------------------------------------
# development - Vite dev server with HMR
# ----------------------------------------------------------------------------
FROM deps AS development

ENV NODE_ENV=development

COPY frontend/ ./frontend/

WORKDIR /app/frontend
EXPOSE 5173

# Vite binds 0.0.0.0 (see vite.config.js) so the port is reachable from the
# host. Called through the local binary rather than `pnpm dev` so that Vite,
# not pnpm, is PID 1 and receives SIGTERM directly.
CMD ["./node_modules/.bin/vite", "--host", "0.0.0.0", "--port", "5173"]

# ----------------------------------------------------------------------------
# build - produce the static bundle
# ----------------------------------------------------------------------------
FROM deps AS build

# Vite inlines VITE_* variables into the bundle at BUILD time - they are not
# runtime configuration. The default "/api" is a same-origin relative path, so
# the bundle works behind any domain Caddy serves it from without a rebuild.
ARG VITE_API_URL=/api
ARG VITE_SENTRY_DSN=
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_SENTRY_DSN=${VITE_SENTRY_DSN} \
    NODE_ENV=production

COPY frontend/ ./frontend/

RUN pnpm --filter "@tuberia/frontend" build

# ----------------------------------------------------------------------------
# production - static files behind nginx
# ----------------------------------------------------------------------------
# nginx-unprivileged instead of the stock nginx image: the stock one starts its
# master process as root. This variant runs entirely as uid 101 and is
# pre-configured to keep its pid file, cache and temp paths off the read-only
# root filesystem the compose file gives it.
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine AS production

# Listens on 8080: an unprivileged process cannot bind ports below 1024, and
# 8080 is this image's documented convention.
EXPOSE 8080

COPY --chown=nginx:nginx frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/frontend/dist /usr/share/nginx/html

# Liveness is declared in docker-compose.yml so it can differ per environment.
HEALTHCHECK NONE

LABEL org.opencontainers.image.title="TuberIA Frontend" \
      org.opencontainers.image.description="React SPA for TuberIA, served as static assets by nginx" \
      org.opencontainers.image.source="https://github.com/TuberIA-App/TuberIA" \
      org.opencontainers.image.licenses="PolyForm-Noncommercial-1.0.0"
