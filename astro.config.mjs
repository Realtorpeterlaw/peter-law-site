import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.realtorpeterlaw.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
