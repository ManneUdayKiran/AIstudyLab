import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://a-istudy-lab.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
}
