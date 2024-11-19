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
