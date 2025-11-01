import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
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
