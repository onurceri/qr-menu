import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      template: 'treemap',
      open: false,
      gzipSize: true,
    }),
  ],
  build: {
    target: 'esnext', // Modern browsers için daha hızlı build
    minify: 'esbuild', // Daha hızlı minification
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          ui: ['@hello-pangea/dnd', 'lucide-react'],
        },
      },
    },
    // Paralel build için
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true
      }
    }
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
