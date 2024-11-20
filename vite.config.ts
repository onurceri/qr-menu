import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Ensure development environment for Vite
process.env.NODE_ENV = 'development';

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'html-transform',
            transformIndexHtml(html) {
                return html.replace(
                    /%VITE_GOOGLE_PLACES_API_KEY%/g,
                    process.env.VITE_GOOGLE_PLACES_API_KEY || ''
                );
            },
        },
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, './shared')
        }
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react') ||
                        id.includes('node_modules/react-dom') ||
                        id.includes('node_modules/react-router-dom') ||
                        id.includes('node_modules/@tanstack/react-query') ||
                        id.includes('node_modules/@tanstack/react-router') ||
                        id.includes('node_modules/i18next') ||
                        id.includes('node_modules/react-i18next') ||
                        id.includes('node_modules/i18next-browser-languagedetector') ||
                        id.includes('node_modules/@react-leaflet') ||
                        id.includes('node_modules/react-hot-toast') ||
                        id.includes('node_modules/sonner') ||
                        id.includes('node_modules/lucide-react') ||
                        id.includes('node_modules/@radix-ui')) {
                        return '\0vendor-react';
                    }
                    if (id.includes('node_modules/firebase')) {
                        return 'vendor-firebase';
                    }
                    if (id.includes('node_modules/leaflet')) {
                        return 'vendor-map';
                    }
                    if (id.includes('node_modules/react-leaflet')) {
                        return '\0vendor-react';
                    }
                },
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                inlineDynamicImports: false
            }
        },
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            '@tanstack/react-router',
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
            'leaflet',
            '@react-leaflet/core',
            'react-leaflet',
            'react-hot-toast',
            'sonner',
            'lucide-react',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage'
        ]
    },
    server: {
        port: 5173,
        host: true
    }
});
