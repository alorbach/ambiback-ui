import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'AmbiBack Controller',
        short_name: 'AmbiBack',
        start_url: '/ambiback-ui/',
        display: 'standalone',
        background_color: '#0b0b0b',
        theme_color: '#0b0b0b',
      },
    }),
  ],
})
