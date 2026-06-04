import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://www.realtorpeterlaw.com',
  output: 'hybrid',
  adapter: vercel(),
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
