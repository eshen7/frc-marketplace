import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { createHtmlPlugin } from "vite-plugin-html";



// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  createHtmlPlugin({
    inject: {
      data: {
        googleApiKey: process.env.GOOGLE_API_KEY,
      },
    },
  }),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './vite-frontend')
    },
    },
    optimizeDeps: {
      include: ['@mui/x-date-pickers', 'date-fns']
    }





  /*base: '/static/',
  build: {
    outDir: '../myproject/static',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: './src/main.jsx' 
    }
  }*/
});
