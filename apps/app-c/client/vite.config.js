import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3200,
    proxy: {
      '/api': 'http://localhost:3003',
      '/auth': 'http://localhost:3003',
    },
  },
});
