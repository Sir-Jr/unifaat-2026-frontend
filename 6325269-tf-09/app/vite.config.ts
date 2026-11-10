import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Libera o acesso pelo link público do túnel Cloudflare
    allowedHosts: ['.trycloudflare.com'],
    // "/api/..." é repassado para a API local, assim o navegador
    // de quem acessa de fora não precisa enxergar a porta 8080
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
