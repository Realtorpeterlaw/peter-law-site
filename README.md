# realtorpeterlaw.com

Astro + Vercel. Content as components, deploys per Git push, preview URL per branch.

## What's here

```
peter-law-site/
├── public/                  # static assets (favicon, robots.txt, eventually photos)
├── src/
│   ├── components/          # Header, Footer, TopBar, Logo, CTASection
│   ├── layouts/             # BaseLayout (HTML head, fonts, analytics)
│   ├── pages/               # one .astro per route — / /for-renters /for-landlords /about /zh
│   └── styles/global.css    # design system
├── astro.config.mjs
└── package.json
```

## Local development (optional)

If you want to run it on your own laptop:

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # builds to ./dist
```

## Deploy — first time

This is the one-time setup. After this, every `git push` auto-deploys.

### 1. Create the GitHub repo

1. Go to https://github.com/new
2. Repository name: `peter-law-site` (or whatever you prefer)
3. **Private** repo
4. Don't initialize with README/license — we already have files
5. Click Create

### 2. Push this folder to the repo

Open Terminal in this folder (`peter-law-site/`) and:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/Realtorpeterlaw/peter-law-site.git
git push -u origin main
```

GitHub will ask for credentials. If it complains about HTTPS auth, the easiest path is to install [GitHub CLI](https://cli.github.com/) and run `gh auth login` once.

### 3. Connect Vercel

1. Go to https://vercel.com/new
2. Click "Import" next to the `peter-law-site` repo
3. Framework Preset: should auto-detect as **Astro**
4. Leave defaults; click **Deploy**
5. Wait ~60 seconds. You'll get a URL like `https://peter-law-site-xxxx.vercel.app` — that's your preview

### 4. Add the Plausible env var (for analytics)

Once you sign up for Plausible:

1. Vercel project → Settings → Environment Variables
2. Add: `PUBLIC_PLAUSIBLE_DOMAIN` = `realtorpeterlaw.com`
3. Vercel project → Deployments → click latest → "Redeploy"

If you don't add it, the site works fine — no analytics gets recorded.

### 5. (Later) Custom domain

After we've reviewed the preview and you're ready to go live, the cutover steps are in `PHASE-5-CUTOVER.md` (Claude will create that when we're ready).

---

## How content edits work going forward

You don't edit any of this. You tell Claude what to change. Claude:

1. Edits the relevant `.astro` file
2. Pushes to a branch like `claude/update-rental-info`
3. Vercel auto-builds a preview URL for that branch
4. You click the preview, look it over
5. Merge if good, ask for changes if not

The point: every change is visible before it touches production.

---

## Things to verify after first deploy

- [ ] All five pages render: `/`, `/for-renters`, `/for-landlords`, `/about`, `/zh`
- [ ] Mobile layout is readable (resize the window)
- [ ] Cal.com button on home page links to your booking page
- [ ] No broken images / 404s in browser console
- [ ] Lighthouse score > 90 on Performance, Accessibility, SEO

If any of these fail, send Claude the deployment URL and the error.

---

## What's still placeholder

- Hero photo (gradient placeholder) — drop a real photo at `public/peter.jpg` and Claude will wire it up
- `/journal` page — not yet built; nav links to it but you'll 404 until we build it
- `/privacy` and `/terms` pages — footer links to them; they 404 today

These are intentional — we'll address each in subsequent iterations.
