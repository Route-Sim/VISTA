export function resolveWsUrl(): string {
  const envUrl = (import.meta as any)?.env?.VITE_WS_URL as string | undefined;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl;
  }

  // Fallback for local development
  // Prefer protocol-aware default when running in a browser, else localhost
  if (typeof window !== 'undefined' && typeof location !== 'undefined') {
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${scheme}://${location.host}/ws`;
  }

  return 'ws://localhost:8080/ws';
}

export const wsUrl: string = resolveWsUrl();
