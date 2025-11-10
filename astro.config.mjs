import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://riografa.github.io',
  base: isProd ? '/riografa.github.io/' : '/',
  integrations: [tailwind()],
  output: 'static',
  build: { assets: 'assets' },
});