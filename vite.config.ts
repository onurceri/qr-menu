import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Modern browsers için daha hızlı build
    minify: 'esbuild', // Daha hızlı minification
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'firebase/app',
            'firebase/auth',
            'i18next',
            'react-i18next'
          ]
        }
      }
    },
    // Paralel build için
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true
  },
  // Daha hızlı resolve için
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Daha hızlı HMR için
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'i18next',
      'react-i18next'
    ]
  }
});
