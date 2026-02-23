import { defineConfig } from 'astro/config';
import tailwindv4 from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://riografa.github.io',
  base: '/',
  vite: {
    plugins: [tailwindv4()],
    resolve: {
      alias: {
        '@scripts': '/src/scripts'
      }
    }
  }
});
