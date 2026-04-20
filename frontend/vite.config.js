import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,          // expose on all network interfaces
    allowedHosts: true,  // allow ALL external hosts (Cloudflare tunnel etc.)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: '',
      },
    },
  },
})
