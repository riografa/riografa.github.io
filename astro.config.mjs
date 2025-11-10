import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://riografa.github.io/luisagiraldoportfolio',
  base: '/luisagiraldoportfolio/',
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@scripts': '/src/scripts'
      }
    }
  }
});
