import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { contentSecurityPolicy } from './shared/config/security';

export default defineConfig({
    plugins: [react()],
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
                    // React ve ilgili paketler
                    if (id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router-dom/') ||
                        id.includes('node_modules/@tanstack/react-query/') ||
                        id.includes('node_modules/@tanstack/react-router/')) {
                        return 'vendor-react';
                    }

                    // UI bileşenleri
                    if (id.includes('node_modules/react-hot-toast/') ||
                        id.includes('node_modules/sonner/') ||
                        id.includes('node_modules/lucide-react/') ||
                        id.includes('node_modules/@radix-ui/')) {
                        return 'vendor-ui';
                    }

                    // Firebase
                    if (id.includes('node_modules/firebase/')) {
                        return 'vendor-firebase';
                    }

                    // Harita
                    if (id.includes('node_modules/leaflet/') ||
                        id.includes('node_modules/react-leaflet/')) {
                        return 'vendor-map';
                    }

                    // i18n
                    if (id.includes('node_modules/i18next/') ||
                        id.includes('node_modules/react-i18next/') ||
                        id.includes('node_modules/i18next-browser-languagedetector/')) {
                        return 'vendor-i18n';
                    }
                },
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js'
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
    server: {
        port: 5173,
        host: true,
        headers: {
            'Content-Security-Policy': Object.entries(contentSecurityPolicy.directives)
                .map(([key, values]) => `${key} ${values.join(' ')}`)
                .join('; ')
        }
    }
});
