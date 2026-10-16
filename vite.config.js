import { defineConfig } from 'vite';

const backend = process.env.API_PROXY_TARGET || 'http://localhost:3000';

export default defineConfig({
  esbuild: {
    jsx: 'automatic'
  },
  build: {
    outDir: 'client/dist',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '^/api/': backend,
      '/uploads': backend,
      '/socket.io': {
        target: backend,
        ws: true
      }
    }
  }
});
