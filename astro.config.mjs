import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://riografa.github.io',
  base: '/',
  integrations: [tailwind()],
  output: 'static',
  build: {
    assets: 'assets',  // ← Cambiar de _astro a assets para evitar problemas con Jekyll
  },
  vite: {
    build: {
      rollupOptions: {
        external: [],
      },
    },
  },
});