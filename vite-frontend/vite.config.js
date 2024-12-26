import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { createHtmlPlugin } from "vite-plugin-html";
import dotenv from "dotenv";

dotenv.config();
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          googleApiKey: process.env.VITE_GOOGLE_API_KEY,
        },
      },
    }),
  ],
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
