import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@geejay/use-feature-flags': fileURLToPath(new URL('./src/lib/use-feature-flags.js', import.meta.url))
    }
  }
})
