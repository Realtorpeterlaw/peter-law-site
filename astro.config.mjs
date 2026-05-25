import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https://www.realtorpeterlaw.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});
