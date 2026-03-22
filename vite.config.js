import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// @vitest/globals → pas besoin d'importer describe/it/expect dans chaque test

// Headers requis pour SharedArrayBuffer (nécessaire pour OPFS / PGlite)
const crossOriginHeaders = {
  'Cross-Origin-Opener-Policy':   'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

export default defineConfig({
  plugins: [react()],

  test: {
    environment: 'jsdom',
    globals: true,
  },

  // PGlite contient du WASM et des workers — exclure du pre-bundling Vite
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },

  // Les workers doivent aussi utiliser le format ES (requis par PGlite)
  worker: {
    format: 'es',
  },

  server: {
    port: 5173,
    host: true,         // écoute sur 0.0.0.0 (nécessaire dans Docker)
    headers: crossOriginHeaders,
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

  preview: {
    headers: crossOriginHeaders,
  },
})
