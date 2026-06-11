import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 무무월드컵2 Vite 설정
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
})
