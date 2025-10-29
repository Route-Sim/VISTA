---
title: 'Docker'
summary: 'Multi-stage Dockerfile builds the Vite + Bun app and serves static assets via Nginx with SPA fallback for client-side routing.'
source_paths:
  - 'Dockerfile'
last_updated: '2025-10-29'
owner: 'Mateusz Nędzi'
tags: ['module', 'config', 'build', 'docker']
links:
parent: '../../SUMMARY.md'
siblings: ['./docker-compose.md']
---

# Docker

> Purpose: Provide a production-ready container image. The image compiles the app with Bun + Vite and serves the resulting static site through Nginx configured for SPA history fallback.

## Context & Motivation

- We need a reproducible, production-friendly container to deploy the client.
- Build step uses Bun to match local tooling and ensure fast installs.
- Runtime uses Nginx for efficient static serving and a clean SPA fallback to `index.html`.

## Responsibilities & Boundaries

- In-scope: building artifacts, static serving, SPA routing via Nginx.
- Out-of-scope: server-side APIs, WebSocket backend.

## Architecture & Design

- Multi-stage build:
  - Builder: `oven/bun:1` installs dependencies and runs `vite build` to produce `dist/`.
  - Runtime: `nginx:alpine` serves `/usr/share/nginx/html` and falls back to `/index.html`.

## Public API / Usage

```bash
docker build -t vista:latest .
docker run -p 8080:80 vista:latest
```

Open `http://localhost:8080`.

## Implementation Notes

- The Dockerfile writes an Nginx `default.conf` enabling `try_files $uri $uri/ /index.html;`.
- Exposes port 80 in the container.

## References

- `docker-compose.md` for dev and prod profiles.
- `vite.config.ts` for build configuration.
