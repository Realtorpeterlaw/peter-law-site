#!/usr/bin/env node
/**
 * Per-page CSS code-splitting via PurgeCSS post-build.
 * Walks dist/**\/*.html, extracts each page's inline <style> block, removes
 * selectors that don't appear in that page's markup, writes it back inline.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PurgeCSS } from 'purgecss';

const ROOT = resolve('dist');
const STYLE_TAG = /<style[^>]*>([\s\S]*?)<\/style>/g;

const SAFELIST_STANDARD = [
  'active', 'is-active', 'open', 'mobile-menu-open',
  'tier-red', 'tier-yellow',
  'rc-verdict-neutral', 'rc-verdict-green', 'rc-verdict-yellow', 'rc-verdict-red',
  'ac-verdict-neutral', 'ac-verdict-green', 'ac-verdict-yellow', 'ac-verdict-red',
  'ac-fee-row', 'ac-tax-row',
  'blog-no-results',
];
const SAFELIST_DEEP = [
  /^is-/, /^has-/, /^rc-verdict-/, /^ac-verdict-/, /^tier-/,
  /^deal-card/, /^deals-dot/, /^mc-collapsible/, /^means-collapse/, /^blog-card/,
];
const SAFELIST_GREEDY = [
  /^\[aria-/, /^\[data-/, /^:focus-visible/, /^:hover/, /:where\(/, /:is\(/,
];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function stripInline(html) {
  // Strip <style>, <script>, and <!-- --> comments so selectors don't self-match
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

async function purgeOne(htmlPath) {
  const html = await readFile(htmlPath, 'utf8');
  const stripped = stripInline(html);

  let totalBefore = 0, totalAfter = 0;
  const parts = [];
  let lastIndex = 0;
  let m;
  STYLE_TAG.lastIndex = 0;

  while ((m = STYLE_TAG.exec(html)) !== null) {
    parts.push(html.slice(lastIndex, m.index));
    const raw = m[1];
    totalBefore += raw.length;

    // Skip tiny <style> blocks — nothing to gain, higher risk
    if (raw.length < 3000) {
      parts.push(m[0]);
      totalAfter += raw.length;
    } else {
      const result = await new PurgeCSS().purge({
        content: [{ raw: stripped, extension: 'html' }],
        css: [{ raw }],
        safelist: {
          standard: SAFELIST_STANDARD,
          deep: SAFELIST_DEEP,
          greedy: SAFELIST_GREEDY,
        },
        keyframes: false,
        fontFace: false,
        variables: false,
      });
      const purged = result[0]?.css ?? raw;
      totalAfter += purged.length;
      const openTag = m[0].match(/^<style[^>]*>/)?.[0] ?? '<style>';
      parts.push(openTag + purged + '</style>');
    }
    lastIndex = m.index + m[0].length;
  }
  parts.push(html.slice(lastIndex));

  const saved = totalBefore - totalAfter;
  if (saved > 100) {
    await writeFile(htmlPath, parts.join(''), 'utf8');
  }
  return { before: totalBefore, after: totalAfter };
}

const files = await walk(ROOT);
console.log(`Purging inline CSS across ${files.length} HTML files…`);
let totalBefore = 0, totalAfter = 0;
for (const f of files) {
  const r = await purgeOne(f);
  totalBefore += r.before;
  totalAfter += r.after;
}
const pct = totalBefore > 0 ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;
console.log(`Inline CSS total: ${(totalBefore/1024).toFixed(1)}KB → ${(totalAfter/1024).toFixed(1)}KB  (${pct}% smaller)`);
