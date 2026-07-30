#!/usr/bin/env node
// Bundle size report — flags any single asset > threshold, prints top 10 by size.

import { readdir, stat } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';

const ROOT = resolve('dist');
const IMG_LIMIT_KB = 500;
const JS_LIMIT_KB = 100;
const CSS_LIMIT_KB = 150;

const files = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else files.push(p);
  }
}
await walk(ROOT);

const summary = { html: 0, js: 0, css: 0, img: 0, other: 0 };
const overLimit = [];
const top = [];

for (const f of files) {
  const size = (await stat(f)).size;
  const ext = extname(f).toLowerCase();
  if (ext === '.html') summary.html += size;
  else if (ext === '.js') { summary.js += size; if (size > JS_LIMIT_KB*1024) overLimit.push([f, size, `JS > ${JS_LIMIT_KB}KB`]); }
  else if (ext === '.css') { summary.css += size; if (size > CSS_LIMIT_KB*1024) overLimit.push([f, size, `CSS > ${CSS_LIMIT_KB}KB`]); }
  else if (['.jpg','.jpeg','.png','.webp','.avif','.gif'].includes(ext)) {
    summary.img += size; if (size > IMG_LIMIT_KB*1024) overLimit.push([f, size, `image > ${IMG_LIMIT_KB}KB`]);
  } else summary.other += size;
  top.push([f, size]);
}

const kb = n => (n/1024).toFixed(1) + ' KB';
console.log('=== bundle summary ===');
for (const [k,v] of Object.entries(summary)) console.log(`  ${k.padEnd(6)} ${kb(v)}`);

top.sort((a,b) => b[1]-a[1]);
console.log('\n=== top 10 assets ===');
for (const [f,s] of top.slice(0,10)) console.log(`  ${kb(s).padStart(10)}  ${f.replace(ROOT+'/', '')}`);

if (overLimit.length) {
  console.log('\n=== OVER LIMIT ===');
  for (const [f,s,r] of overLimit) console.log(`  ${kb(s).padStart(10)}  ${r} — ${f.replace(ROOT+'/', '')}`);
  process.exit(1);
}
console.log('\n✓ all assets within budgets');
