// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://evolve-nova-back.vercel.app/', // Your backend URL
        changeOrigin: true,
      },
    },
  },
})
