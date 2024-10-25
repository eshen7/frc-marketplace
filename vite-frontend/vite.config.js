import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  /*base: '/static/',
  build: {
    outDir: '../myproject/static',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: './src/main.jsx' 
    }
  }*/
})
