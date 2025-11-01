export function resolveWsUrl(): string {
  // Vite exposes env vars via import.meta.env, prefixed with VITE_
  const envUrl = import.meta.env.VITE_WS_URL;

  // Debug: log env variable access (remove in production)
  if (import.meta.env.DEV) {
    console.debug('[config] VITE_WS_URL:', envUrl);
    console.debug('[config] import.meta.env.DEV:', import.meta.env.DEV);
  }

  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  // In Vite dev (run via Bun), avoid the dev-server proxy and connect directly
  // to the backend to sidestep Bun's incompatibility with some proxy socket APIs.
  if (import.meta.env.DEV) {
    return 'ws://localhost:8000/ws';
  }

  // Fallback for local development
  // Prefer protocol-aware default when running in a browser, else localhost
  if (typeof window !== 'undefined' && typeof location !== 'undefined') {
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${scheme}://${location.host}/ws`;
  }

  return 'ws://localhost:8000/ws';
}

export const wsUrl: string = resolveWsUrl();

// Debug: log the resolved URL in dev mode
if (import.meta.env.DEV) {
  console.debug('[config] Resolved WebSocket URL:', wsUrl);
}
