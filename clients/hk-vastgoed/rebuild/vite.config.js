import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Static SPA for the HK Vastgoed MVP. No backend/proxy — this is a
// frontend-only demo intended for Vercel static hosting.
export default defineConfig({
  plugins: [react()],
})
