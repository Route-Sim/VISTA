import { file, serve } from 'bun';
import { join, normalize } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');
const DEFAULT_FILE = 'index.html';
const PORT = Number(process.env.PORT || 3000);

const MIME_MAP: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

function getMimeType(pathname: string): string | undefined {
  const idx = pathname.lastIndexOf('.');
  if (idx === -1) return undefined;
  const ext = pathname.slice(idx);
  return MIME_MAP[ext];
}

function safeResolvePath(pathname: string): string {
  // Prevent directory traversal outside of DIST_DIR
  const decoded = decodeURIComponent(pathname.split('?')[0]);
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  return join(DIST_DIR, normalized);
}

async function serveFile(pathname: string): Promise<Response> {
  const fullPath = safeResolvePath(pathname);
  const f = file(fullPath);
  if (!(await f.exists())) {
    // SPA fallback to index.html
    const indexFile = file(join(DIST_DIR, DEFAULT_FILE));
    if (await indexFile.exists()) {
      return new Response(indexFile, {
        headers: { 'Content-Type': MIME_MAP['.html'] },
      });
    }
    return new Response('Not Found', { status: 404 });
  }

  const contentType = getMimeType(fullPath) || 'application/octet-stream';
  return new Response(f, { headers: { 'Content-Type': contentType } });
}

serve({
  port: PORT,
  fetch: async (req: Request) => {
    const url = new URL(req.url);
    const pathname = url.pathname === '/' ? `/${DEFAULT_FILE}` : url.pathname;
    try {
      return await serveFile(pathname);
    } catch {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
});

console.log(`[vista] static server listening on http://0.0.0.0:${PORT}`);
