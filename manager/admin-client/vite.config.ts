import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    base: './',
    server: {
      port: 5174,
      proxy: {
        // Agora o proxy aponta para o servidor local em desenvolvimento
        // para que possas testar as mudanças no backend (inclusive o PDF)
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('[Proxy Error]', err);
            });
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log(`[Proxy] ${req.method} ${req.url}`);
            });
          },
        },
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
