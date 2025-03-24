import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Thay đổi port này theo port của backend
        changeOrigin: true
      }
    }
  }
})
