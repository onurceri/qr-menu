import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [react(), visualizer({
    filename: 'dist/stats.html',
    gzipSize: true,
    brotliSize: true,
    open: false
  })],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5001',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React - Split into smaller chunks
            if (id.includes('react/') || id.includes('react-dom/client')) {
              return 'core-react-base';
            }
            if (id.includes('react-dom') && !id.includes('react-dom/client')) {
              return 'core-react-dom';
            }
            if (id.includes('scheduler') || id.includes('use-sync-external-store')) {
              return 'core-react-utils';
            }

            // Router - Keep small and focused
            if (id.includes('react-router')) {
              return 'router';
            }

            // Firebase - Split into smaller functional chunks
            if (id.includes('@firebase/app')) {
              return 'firebase-core';
            }
            if (id.includes('@firebase/auth')) {
              return 'firebase-auth';
            }
            if (id.includes('@firebase/firestore')) {
              return 'firebase-db';
            }
            if (id.includes('@firebase/storage')) {
              return 'firebase-storage';
            }
            if (id.includes('@firebase/')) {
              return 'firebase-utils';
            }

            // Maps - Split into core and plugins
            if (id.includes('leaflet/dist/leaflet')) {
              return 'maps-core';
            }
            if (id.includes('leaflet')) {
              return 'maps-plugins';
            }

            // UI Components - Split by framework
            if (id.includes('@mui/material')) {
              return 'ui-material';
            }
            if (id.includes('@mui/icons')) {
              return 'ui-icons';
            }
            if (id.includes('@emotion/styled')) {
              return 'ui-styled';
            }
            if (id.includes('@emotion')) {
              return 'ui-emotion';
            }

            // Utilities - Group small utilities together
            if (id.includes('i18next')) {
              return 'i18n';
            }
            if (id.includes('@hello-pangea')) {
              return 'dnd';
            }
            if (id.includes('uuid') || 
                id.includes('tiny-invariant') || 
                id.includes('tslib') ||
                id.includes('lodash') ||
                id.includes('date-fns')) {
              return 'utils';
            }

            return 'vendors';
          }

          // Application code - More granular splitting
          if (id.includes('/features/')) {
            const feature = id.split('/features/')[1].split('/')[0];
            return `feature-${feature}`;
          }

          if (id.includes('/pages/')) {
            const page = id.split('/pages/')[1].split('/')[0];
            // Split RestaurantEdit into smaller chunks
            if (page === 'RestaurantEdit') {
              if (id.includes('form')) return 'page-restaurant-edit-form';
              if (id.includes('menu')) return 'page-restaurant-edit-menu';
              if (id.includes('settings')) return 'page-restaurant-edit-settings';
              return 'page-restaurant-edit-core';
            }
            return `page-${page}`;
          }

          if (id.includes('/components/')) {
            if (id.includes('/layout/')) return 'layout';
            if (id.includes('/shared/')) return 'shared';
            if (id.includes('/forms/')) return 'forms';
            const componentType = id.split('/components/')[1].split('/')[0];
            return `ui-${componentType}`;
          }

          if (id.includes('/utils/')) {
            if (id.includes('/api/')) return 'api-utils';
            if (id.includes('/hooks/')) return 'hooks';
            return 'utils';
          }

          // Styles and assets
          if (id.endsWith('.css')) return 'styles';
          if (id.match(/\.(png|jpe?g|gif|svg|woff2?)$/)) return 'assets';
        },
        chunkFileNames: (chunkInfo) => {
          const prefix = chunkInfo.name.includes('feature-') ? 'features' :
                        chunkInfo.name.includes('page-') ? 'pages' :
                        chunkInfo.name.includes('ui-') ? 'components' :
                        'chunks';
          return `assets/${prefix}/[name]-[hash].js`;
        },
        assetFileNames: 'assets/[ext]/[name]-[hash][extname]',
        entryFileNames: 'assets/[name]-[hash].js',
      },
      plugins: [
        {
          name: 'drop-console-debugger',
          transform(code, id) {
            if (id.includes('node_modules')) {
              return null;
            }
            return {
              code: code
                .replace(/console\.(log|debug|info|warn|error|trace)\([^)]*\);?/g, '')
                .replace(/debugger;/g, ''),
              map: { mappings: '' }
            };
          }
        }
      ]
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
  }
});
