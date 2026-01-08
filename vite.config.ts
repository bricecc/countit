import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ensure the app works when deployed to a subdirectory (GitHub Pages usually)
  base: './',
  define: {
    // Polyfill process.env for compatibility with existing code
    'process.env': {}
  }
});