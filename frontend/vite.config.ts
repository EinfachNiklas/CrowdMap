import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      svgLoader(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        // Alle Requests, die mit /api beginnen, an dein Backend weiterleiten
        '/api': {
          target: env.VITE_BACKEND_ORIGIN || 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, '')
        }
      }
    },
    preview: {
      port: 4173,
      strictPort: true
    }
  };
});
