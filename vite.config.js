import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    exclude: ['server/**', 'node_modules/**', 'e2e/**'],
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/'))
              return 'vendor';
            if (id.includes('i18next') || id.includes('zustand') || id.includes('sonner'))
              return 'vendor';
            if (id.includes('better-auth'))
              return 'auth';
          }
        },
      },
    },
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
