import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/museu': 'http://localhost:4000',
      // Adicione outros endpoints se necessário
    },
  },
});
