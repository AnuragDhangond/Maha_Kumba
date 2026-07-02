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
  },
});
