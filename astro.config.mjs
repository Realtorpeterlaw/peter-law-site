import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.realtorpeterlaw.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
