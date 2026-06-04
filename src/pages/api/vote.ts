import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';
import crypto from 'node:crypto';
import { developers } from '../../data/condo-developers.ts';

export const prerender = false;

const validSlugs = new Set(developers.map((d) => d.slug));
const VOTE_KEY_PREFIX = 'condo_vote:';
const IP_KEY_PREFIX = 'condo_vote_ip:';
const COOKIE_NAME = 'condo_vote';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function backendConfigured() {
  return Boolean(process.env.KV_REST_API_URL || process.env.KV_URL);
}

async function tallyAll(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  await Promise.all(
    developers.map(async (d) => {
      const n = await kv.get<number>(VOTE_KEY_PREFIX + d.slug);
      out[d.slug] = typeof n === 'number' ? n : 0;
    })
  );
  return out;
}

function json(body: unknown, status: number = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export const POST: APIRoute = async ({ request, clientAddress, cookies }) => {
  if (!backendConfigured()) {
    return json({ error: 'Poll backend not yet configured. Set up Vercel KV in your project.' }, 503);
  }

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const slug = String(payload?.slug || '').trim();
  if (!validSlugs.has(slug)) {
    return json({ error: 'Unknown developer.' }, 400);
  }

  // Cookie-based dedup (primary)
  const existingCookieVote = cookies.get(COOKIE_NAME)?.value;
  if (existingCookieVote && validSlugs.has(existingCookieVote)) {
    const results = await tallyAll();
    return json({ ok: true, already_voted: true, your_vote: existingCookieVote, results });
  }

  // IP-hash dedup (secondary — catches cleared cookies from same network)
  const ipHash = crypto
    .createHash('sha256')
    .update((clientAddress || 'unknown') + '|peter-law-condo-poll')
    .digest('hex')
    .slice(0, 16);
  const ipKey = IP_KEY_PREFIX + ipHash;
  const existingIpVote = await kv.get<string>(ipKey);
  if (existingIpVote && validSlugs.has(existingIpVote)) {
    cookies.set(COOKIE_NAME, existingIpVote, {
      path: '/',
      sameSite: 'lax',
      maxAge: ONE_YEAR_SECONDS,
    });
    const results = await tallyAll();
    return json({ ok: true, already_voted: true, your_vote: existingIpVote, results });
  }

  // Record fresh vote
  await Promise.all([
    kv.incr(VOTE_KEY_PREFIX + slug),
    kv.set(ipKey, slug, { ex: ONE_YEAR_SECONDS }),
  ]);

  cookies.set(COOKIE_NAME, slug, {
    path: '/',
    sameSite: 'lax',
    maxAge: ONE_YEAR_SECONDS,
  });

  const results = await tallyAll();
  return json({ ok: true, already_voted: false, your_vote: slug, results });
};

export const GET: APIRoute = async ({ cookies }) => {
  if (!backendConfigured()) {
    return json({ error: 'Poll backend not yet configured.' }, 503);
  }
  const results = await tallyAll();
  const yourVote = cookies.get(COOKIE_NAME)?.value;
  return json({
    ok: true,
    your_vote: yourVote && validSlugs.has(yourVote) ? yourVote : null,
    results,
  }, 200, { 'Cache-Control': 'no-store' });
};
