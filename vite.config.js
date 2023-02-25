import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import { resolve } from 'path';
import manifest from './manifest.json';



export default defineConfig({

  build: {
    rollupOptions: {
      input: {
        block: resolve(__dirname, './src/pages/blocked-screen/blocked-screen.html'),
      },
    },
    watch: {
      // https://rollupjs.org/guide/en/#watch-options
    },
  },
  plugins: [
    react(),
    crx({ manifest }),
  ],
})
