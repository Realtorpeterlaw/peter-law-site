import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.realtorpeterlaw.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  redirects: {
    '/zh': '/chinese',
  },
});
