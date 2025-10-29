---
title: 'Docker Compose'
summary: 'Compose provides dev and prod profiles: Vite dev server with HMR in dev; Nginx static serving in prod.'
source_paths:
  - 'docker-compose.yml'
last_updated: '2025-10-29'
owner: 'Mateusz Nędzi'
tags: ['module', 'config', 'compose', 'docker']
links:
parent: '../../SUMMARY.md'
siblings: ['./docker.md']
---

# Docker Compose

> Purpose: Define convenient profiles for development (hot reloading) and production (built static assets via Nginx) using a single compose file.

## Profiles

- dev:
  - Image: `oven/bun:1`
  - Command: `bunx --bun vite --host 0.0.0.0 --port 5173`
  - Volumes: project mounted at `/app` for HMR
  - Port: `5173:5173`

- prod (web):
  - Builds local Dockerfile and serves via Nginx
  - Port: `8080:80`

## Usage

```bash
# Development
docker compose --profile dev up --build
# open http://localhost:5173

# Production-like
docker compose --profile prod up --build -d
# open http://localhost:8080
```

## Notes

- You can pass Vite envs (e.g., `VITE_WS_URL`) via the `environment` section in the `dev` service.
- The dev service mounts the workspace and keeps `node_modules` isolated inside the container.
