import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['img-neumaticos/logo.png'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,webp,svg,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  base: '/Aires.github.io/',
})
