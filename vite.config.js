import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Aires.github.io/', // El nombre exacto de tu repositorio entre barras
})