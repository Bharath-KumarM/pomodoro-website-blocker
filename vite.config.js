import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import manifest from './manifest.json';
import { resolve } from 'path';
import { crx } from '@crxjs/vite-plugin'




export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/guide/en/#watch-options
    },
    rollupOptions: {
      input: {
        restrict: resolve(__dirname, "src/pages/restricted-screen/restricted-screen.html"),
        timeLimit: resolve(__dirname, "src/pages/time-limit-screen/time-limit-screen.html"),
        blockedScreen: resolve(__dirname, "src/pages/blocked-screen/blocked-screen.html"),
      },
    },
  },
  plugins: [
    react(),
    crx({ manifest }),
  ],
})


