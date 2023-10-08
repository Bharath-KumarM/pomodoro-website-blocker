import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import manifest from './manifest.json';
import { resolve } from 'path';
import { crx } from '@crxjs/vite-plugin'

const isBuildTest = process.env.NODE_ENV === 'build-test ' // 'dev ' || 'build-prod ' || 'build-test ' 
let testBuild = {}
let configResolve = {}

if (isBuildTest){
  // 
  testBuild = {
    watch: true,
    minify: false,
  }

  // React dev tool profiling
  configResolve = {
    alias: {
      "react-dom/client": "react-dom/profiling"
    }
  }

  // To execute React dev tool remote code 
  manifest["content_security_policy"] = {
    // "extension_pages": "script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules' http://localhost:* http://127.0.0.1:*"
    // "extension_pages": "script-src 'self'; object-src 'self'; script-src-elem 'self' 'unsafe-inline' http://localhost:8097;"
    "extension_pages": "script-src 'self'; object-src 'self'; script-src-elem 'self' 'unsafe-inline' http://localhost:8097;"
  }

}


export default defineConfig({
  resolve: configResolve,
  build: {
    rollupOptions: {
      input: {
        restrict: resolve(__dirname, "src/pages/restricted-screen/restricted-screen.html"),
        timeLimit: resolve(__dirname, "src/pages/time-limit-screen/time-limit-screen.html"),
        blockedScreen: resolve(__dirname, "src/pages/blocked-screen/blocked-screen.html"),
        welcomeScreen: resolve(__dirname, "src/pages/welcome-screen/welcome-screen.html"),
        helpScreen: resolve(__dirname, "src/pages/help-screen/help-screen.html"),
      },
    },
    ...testBuild,
    watch: {}
  },
  plugins: [
    react(),
    crx({ manifest }),
  ],
})


