import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    // Bind all interfaces so the port is reachable from outside the container.
    host: '0.0.0.0',
    port: 5173,

    proxy: {
      // The app requests a RELATIVE "/api" in development (VITE_API_URL=/api),
      // exactly as it does in production behind Caddy. Dev therefore mirrors
      // prod: same-origin requests, and CORS is never involved.
      '/api': {
        // Inside Docker this is the backend service on the compose network.
        // Falls back to the published loopback port for anyone running
        // `pnpm dev` directly on their machine.
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://127.0.0.1:7101',
        changeOrigin: true,

        // NOTE: there is deliberately no `rewrite` stripping /api.
        // backend/src/app.js mounts its router with `app.use('/api', routes)`,
        // so the backend EXPECTS the prefix. The previous config removed it,
        // which meant every proxied request 404'd.
      },
    },
  },

  build: {
    outDir: 'dist',
    // Source maps are not published: they would expose the unminified source.
    sourcemap: false,
  },
})
