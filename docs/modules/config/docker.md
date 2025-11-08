---
title: 'Docker'
summary: 'Multi-stage Dockerfile builds the Vite + Bun app and serves static assets via a minimal Bun HTTP server (SPA fallback to index.html).'
source_paths:
  - 'Dockerfile'
last_updated: '2025-11-08'
owner: 'Mateusz Nędzi'
tags: ['module', 'config', 'build', 'docker']
links:
parent: '../../SUMMARY.md'
siblings: ['./docker-compose.md']
---

# Docker

> Purpose: Provide a production-ready container image. The image compiles the app with Bun + Vite and serves the resulting static site through a small Bun HTTP server configured with SPA history fallback.

## Context & Motivation

- We need a reproducible, production-friendly container to deploy the client.
- Build step uses Bun to match local tooling and ensure fast installs.
- Runtime uses a Bun-based static server (`index.ts`) for efficient static serving and SPA fallback to `index.html`.

## Responsibilities & Boundaries

- In-scope: building artifacts, static serving, SPA routing via Bun HTTP server.
- Out-of-scope: server-side APIs, WebSocket backend.

## Architecture & Design

- Multi-stage build:
  - Install: caches dev and prod dependencies.
  - Prerelease: copies sources and runs `bun run build` to produce `dist/`.
  - Release: copies prod `node_modules`, the built `dist/`, and `index.ts` static server entrypoint.

## Public API / Usage

```bash
docker build -t vista:latest .
docker run -p 8080:3000 vista:latest
```

Open `http://localhost:8080`.

## Implementation Notes

- The Dockerfile’s release stage runs `bun run index.ts` to serve files from `dist/` with a SPA fallback.
- Exposes port 3000 in the container.

## References

- `docker-compose.md` for dev and prod profiles.
- `vite.config.ts` for build configuration.
