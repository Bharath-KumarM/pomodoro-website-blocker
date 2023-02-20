import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import { defineConfig } from 'vite'

const root = resolve(__dirname, 'src');
const pagesDir = resolve(root, 'pages');
const assetsDir = resolve(root, 'assets');
const outDir = resolve(__dirname, 'dist');
const publicDir = resolve(__dirname, 'public');


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: { 
      '@src': root,
      '@assets': assetsDir,
      '@pages': pagesDir,
    },
  },
  publicDir,
  build: {
    outDir,
    rollupOptions: {
      input: {
        content: resolve(pagesDir, 'content', 'content.js'),
        background: resolve(pagesDir, 'background', 'background.js'),
        popup: resolve(pagesDir, 'popup', 'popup.html'),
        public: resolve(publicDir, 'manifest.json'),
      },
      output: {
        entryFileNames: ({name}) => {
          // if (name === 'public') return 'manifest.json'
          return `src/pages/${name}/${name}.js`
        },
      },
    },
    watch: {
      // https://rollupjs.org/guide/en/#watch-options
    },
  },
  plugins: [
    react(),
  ],
  // base: '/public/',

})
