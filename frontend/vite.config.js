import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
     allowedHosts: ['https://aistudylab.onrender.com','https://a-istudy-lab-of1b.vercel.app/api/auth/register','https://aistudylab-1.onrender.com'],
  },
})
