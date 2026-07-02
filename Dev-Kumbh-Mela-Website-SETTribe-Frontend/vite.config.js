import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    cors: true,
    proxy: {
      '/chatbot-api': {
        target: 'https://chatbot-khubh-mela.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatbot-api/, ''),
      },
    },
  },
  build: {
    outDir: 'build',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - smallest, loads first
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-state': ['zustand', 'axios'],
          // i18n
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // Animations - large library, load separately
          'vendor-motion': ['framer-motion'],
          // WebSocket
          'vendor-ws': ['@stomp/stompjs', 'sockjs-client'],
          // Forms
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // UI utilities
          'vendor-ui': ['sweetalert2', 'lucide-react'],
        }
      }
    }
  },
});
