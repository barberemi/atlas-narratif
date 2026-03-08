import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,         // écoute sur 0.0.0.0 (nécessaire dans Docker)
    hmr: {
      host: 'localhost', // le navigateur se connecte via localhost
      port: 5173,
    },
    watch: {
      usePolling: true,
      interval: 50,      // plus réactif (était 100ms)
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})
