import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://riografa.github.io',
  base: process.env.NODE_ENV === 'production' ? '/luisagiraldoportfolio/' : '/', 
  integrations: [tailwind()],
  output: 'static',
});
