import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // GitHub Pages (npm run build:pages) serves the site from edcarlosramos.github.io/portfolio/.
  base: mode === 'pages' ? '/portfolio/' : '/',
}));
