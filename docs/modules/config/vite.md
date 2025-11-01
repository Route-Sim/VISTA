---
title: "Vite Config – Development Server"
summary: "Configures Vite's development server for React + TypeScript, with path aliases and direct WebSocket connections to avoid Bun compatibility issues."
source_paths:
  - "vite.config.ts"
last_updated: "2025-11-01"
owner: "Mateusz Nędzi"
tags: ["config", "net", "devserver"]
links:
  parent: "../../SUMMARY.md"
  siblings: []
---

# config/vite – Development Server

> Purpose: Configure Vite's development server for React + TypeScript development, providing path aliases and noting WebSocket connection strategy to avoid Bun compatibility issues.

## Context & Motivation

- The app runs with Bun (`bunx --bun vite`), which has compatibility issues with Vite's WebSocket proxy implementation.
- Vite's proxy code uses `socket.destroySoon()`, which is not available in Bun's socket implementation.
- The app is configured to connect directly to the backend WebSocket server (`ws://localhost:8000/ws`) in development mode, bypassing Vite's proxy entirely.

## Responsibilities & Boundaries

- In-scope: React plugin configuration, path alias resolution (`@` → `src`).
- Out-of-scope: WebSocket proxying (removed due to Bun incompatibility), backend server startup.

## Configuration

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // Note: WebSocket proxy removed to avoid Bun compatibility issues with socket.destroySoon()
  // The app connects directly to ws://localhost:8000/ws in dev mode (see src/app/config.ts)
});
```

## WebSocket Connection Strategy

- In development mode, the app detects `import.meta.env.DEV` and connects directly to `ws://localhost:8000/ws`.
- This bypasses Vite's proxy and avoids the `socket.destroySoon()` compatibility issue.
- The WebSocket URL resolution logic is in [`app/config.ts`](../app/config.md).

## Usage

- Run `bun run dev` to start the Vite dev server.
- The app will automatically connect to `ws://localhost:8000/ws` in development mode.
- Alternatively, set `VITE_WS_URL` explicitly to override the default connection URL.

## References

- App config: [`app/config`](../app/config.md)
- Transport: [`net/transport/browser-websocket`](../net/transport/browser-websocket.md)

