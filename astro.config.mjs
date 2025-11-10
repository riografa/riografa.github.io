import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';



export default defineConfig({
  site: 'https://riografa.github.io',
  base: '/riografa.github.io/',
  integrations: [tailwind()],
  output: 'static',
  build: { assets: 'assets' },
});