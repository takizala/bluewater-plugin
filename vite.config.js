import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change the port here
    allowedHosts: "https://2fc8-196-12-131-142.ngrok-free.app"

  },
})
