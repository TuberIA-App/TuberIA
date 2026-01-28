import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Proxy configuration
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend address
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Remove /api from the final path
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
