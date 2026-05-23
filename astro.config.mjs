import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://www.realtorpeterlaw.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  output: 'hybrid',
  adapter: vercel(),
});
