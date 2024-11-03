import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Use vite-html plugin to create API key injection
    createHtmlPlugin({
      inject: {
        data: {
          googleApiKey: process.env.GOOGLE_API_KEY,
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
