#!/usr/bin/env node
// Internal broken-link check against dist/. Ignores mailto:, tel:, external http(s).
// Exits non-zero if any internal href does not resolve to a real file in dist/.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = resolve('dist');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) await walk(p);
    else if (entry.name.endsWith('.html')) files.push(p);
  }
}
await walk(ROOT);
console.log(`scanning ${files.length} HTML files under dist/`);

let broken = 0;
let checked = 0;
const cache = new Set();

async function exists(p) {
  if (cache.has(p)) return true;
  try { await stat(p); cache.add(p); return true; } catch { return false; }
}

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const hrefs = [...html.matchAll(/href="([^"#?]+)/g)].map(m => m[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/')) continue;               // external / anchor / mailto
    if (href.startsWith('//')) continue;               // protocol-relative external
    checked++;
    // Route resolution: /foo/ → dist/foo/index.html or dist/foo
    const clean = href.replace(/\/$/, '');
    const candidates = [
      join(ROOT, clean, 'index.html'),
      join(ROOT, clean),
      join(ROOT, clean + '.html'),
    ];
    let hit = false;
    for (const c of candidates) { if (await exists(c)) { hit = true; break; } }
    if (!hit) {
      console.error(`  BROKEN: ${href}   (in ${file.replace(ROOT, '')})`);
      broken++;
    }
  }
}
console.log(`checked ${checked} internal hrefs, broken: ${broken}`);
if (broken > 0) process.exit(1);
