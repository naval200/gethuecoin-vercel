import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Needed for Firebase popup auth to close cleanly in dev.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
