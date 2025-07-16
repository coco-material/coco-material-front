import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  envPrefix: 'VUE_APP_',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
           @use "@/css/_colors";
        `
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
