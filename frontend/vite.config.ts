import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
  // GitHub Pages serves projects from /<repository-name>/ rather than the
  // domain root. Locally and on other hosts the default root path is kept.
  base: env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
  }
})
