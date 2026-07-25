import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    define: {
      'process.env.VITE_WORDPRESS_URL': JSON.stringify(process.env.VITE_WORDPRESS_URL || ''),
      'process.env.VITE_MERCHANT_WHATSAPP': JSON.stringify(process.env.VITE_MERCHANT_WHATSAPP || ''),
      'process.env.VITE_MERCHANT_EMAIL': JSON.stringify(process.env.VITE_MERCHANT_EMAIL || ''),
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
      'process.env.VITE_ZR_TENANT_ID': JSON.stringify(process.env.VITE_ZR_TENANT_ID || 'd1dc440e-39ab-4ae7-beb9-783750e06d83'),
      'process.env.VITE_ZR_SECRET_KEY': JSON.stringify(process.env.VITE_ZR_SECRET_KEY || 'xjek4BaaVQUyIW50JabZu6ukjtDD8ElLhdSOD6bTy1OT6D9WDuo6oNyFSQw7wpCG'),
    },
    plugins: [react(), tailwindcss()],
    base: './',
    build: {
      assetsInlineLimit: 100000000,
      rollupOptions: {
        output: {
          // Enforces fixed production file names
          entryFileNames: 'assets/index-8W-u9U11.js',
          assetFileNames: 'assets/[name]-Bh2GJ_IC.[ext]'
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
