import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  test: {
    globals: true, // So you can write `expect()` without import
    environment: 'jsdom', // simulate the browser DOM
    setupFiles: './src/setupTests.js'
  }
})
