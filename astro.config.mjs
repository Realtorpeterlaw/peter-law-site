import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.realtorpeterlaw.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-CA',
          chinese: 'zh-CN',
          russian: 'ru',
          farsi: 'fa',
          hindi: 'hi',
          korean: 'ko',
          japanese: 'ja',
          spanish: 'es',
        },
      },
    }),
  ],
});
