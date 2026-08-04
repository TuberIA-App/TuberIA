# Deployment

> **This document has moved to [`/DEPLOYMENT.md`](../../DEPLOYMENT.md) at the
> repository root.**

It previously duplicated the root guide. Keeping two copies meant they drifted:
this one still described Docker secrets, hardcoded container names, npm, and
building on the VPS — all of which have since been replaced.

The root guide covers:

- server preparation and `/etc/docker/daemon.json` settings
- configuring `.env` and `backend/.env`
- DNS and automatic TLS
- GitHub environment secrets and variables
- deploying, rolling back, and the emergency build-on-server path
- enabling CSP enforcement
- backups and the 2 GB resource budget

For local development and the container layout, see
[README-DOCKER.md](README-DOCKER.md).
