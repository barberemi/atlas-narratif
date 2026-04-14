import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// @vitest/globals → pas besoin d'importer describe/it/expect dans chaque test

export default defineConfig({
  plugins: [react()],

  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['server/**', 'node_modules/**', 'e2e/**'],
  },

  build: {
    sourcemap: false,
  },

  server: {
    port: 5173,
    host: true,         // écoute sur 0.0.0.0 (nécessaire dans Docker)
    allowedHosts: true, // accepte host.docker.internal (E2E Playwright)
    hmr: {
      host: 'localhost', // le navigateur se connecte via localhost
      port: 5173,
    },
    watch: {
      usePolling: true,
      interval: 100,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})
