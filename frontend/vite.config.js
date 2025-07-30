import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'


const cfilename = fileURLToPath(import.meta.url)
const cdirname = path.dirname(cfilename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(cdirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8747',
    },
  },
  define: {
    global: 'window', // 👈 This fixes the "global is not defined" issue
  },
})