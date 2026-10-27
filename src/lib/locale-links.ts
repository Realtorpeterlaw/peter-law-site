// Build-time language-switcher targets. The site mirrors every page across the three
// locales (/x ↔ /chinese/x ↔ /french/x), so the equivalent page can be derived from the
// current pathname. Pages without a mirror (the 404 page) fall back to the locale homepage.
export type Locale = 'en' | 'zh' | 'fr';

const PREFIX: Record<Locale, string> = { en: '', zh: '/chinese', fr: '/french' };
export const HREFLANG: Record<Locale, string> = { en: 'en-CA', zh: 'zh-CN', fr: 'fr-CA' };
export const LANG_ATTR: Record<Locale, string> = { en: 'en', zh: 'zh-CN', fr: 'fr' };

export function localeOf(pathname: string): Locale {
  if (pathname === '/chinese' || pathname.startsWith('/chinese/')) return 'zh';
  if (pathname === '/french' || pathname.startsWith('/french/')) return 'fr';
  return 'en';
}

/** Path of the same page in another locale ('/' for the homepage). */
export function localeLinks(pathname: string): Record<Locale, string> {
  const current = localeOf(pathname);
  let base = pathname.replace(/\/+$/, '');
  if (current !== 'en') base = base.slice(PREFIX[current].length);
  if (base === '/404' || base === '/404.html') base = '';
  const out = {} as Record<Locale, string>;
  (Object.keys(PREFIX) as Locale[]).forEach((l) => { out[l] = (PREFIX[l] + base) || '/'; });
  return out;
}
