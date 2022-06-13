import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const rendererDir = path.resolve(dirname, 'renderer')

// https://vitejs.dev/config/
export default defineConfig({
  root: rendererDir,
  plugins: [react()],
  base: './',
  build: {
    emptyOutDir: true,
    sourcemap: true,
    target: 'chrome100'
  }
})
