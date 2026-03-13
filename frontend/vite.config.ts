import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api/backend': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/backend/, '/api'),
      },
      '/api/twitter': {
        target: 'https://api.twitter.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/twitter/, ''),
      },
    },
  },
})
