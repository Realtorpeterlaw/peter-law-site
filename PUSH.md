# Push to GitHub + deploy to Vercel

> **The honest reality:** I (Claude) can't push to your GitHub from this session because that would require your authentication credentials, and pasting tokens in chat is the security mistake we already discussed. So you'll do the push — it's a one-time, 5-minute thing. After this, edits flow through me + a Git workflow that doesn't require you to touch the terminal again.

Pick the path that fits your comfort level. **#1 is recommended.**

---

## Option 1 — Web upload (easiest, no terminal) ⭐ RECOMMENDED FIRST TIME

**Step 1 — Create the repo**
1. Go to https://github.com/new
2. Name: `peter-law-site`
3. Set **Private**
4. Do *not* tick "Initialize with README"
5. Click **Create repository**

**Step 2 — Upload the files**
1. On the new empty repo page, click the link **"uploading an existing file"**
2. Drag-and-drop the **contents** of the `peter-law-site/` folder (not the folder itself — open it and drag everything inside)
3. Scroll down, click **Commit changes**

**Step 3 — Connect Vercel**
1. Go to https://vercel.com/new
2. Find `peter-law-site` in your repo list, click **Import**
3. Framework: auto-detected as Astro. Leave everything default.
4. Click **Deploy**
5. Wait ~60 seconds. You get a URL like `peter-law-site-xxxx.vercel.app`

**Send me that URL.** I'll verify everything renders, then we plan Phase 5 (DNS cutover).

---

## Option 2 — Terminal (if you already have git installed)

```bash
cd ~/Downloads/peter-law-site         # or wherever you extracted the zip
git init -b main
git add .
git commit -m "Initial site"
gh repo create peter-law-site --private --source=. --remote=origin --push
```

That last line uses GitHub CLI (`brew install gh && gh auth login` first). If you don't want GitHub CLI:

```bash
# Manual remote:
# 1) Create empty private repo at github.com/new first
git remote add origin https://github.com/Realtorpeterlaw/peter-law-site.git
git branch -M main
git push -u origin main
```

Then connect Vercel as in Option 1, Step 3.

---

## Option 3 — Skip Git, deploy straight to Vercel (fastest preview, weakest workflow)

If you want a preview URL in 3 minutes and we set up Git later:

```bash
npm install -g vercel
cd ~/Downloads/peter-law-site
vercel
```

Follow the prompts. You'll get a preview URL immediately. We connect Git afterward.

**Tradeoff:** future edits won't have the auto-preview-on-push workflow until we wire up GitHub. Fine for testing, not great for ongoing work.

---

## After deploy — what I need from you

1. **The Vercel preview URL** (looks like `https://peter-law-site-xxxx.vercel.app`)
2. **Anything visibly broken** — typos, layout breaks, missing images

I'll fix anything that needs fixing, and we move on to Phase 5 (DNS cutover plan).

---

## How edits work going forward (no more uploading)

Once the GitHub repo exists and Vercel is connected:

1. You tell me what to change ("update the For Renters FAQ", "add a new blog post")
2. I write the change and produce the exact files
3. We get the changes into GitHub via one of:
   - You run `git pull && git push` (one-line, simple)
   - You install [GitHub Desktop](https://desktop.github.com/) — visual, no terminal — and click sync
   - We set up a fine-grained PAT scoped only to this repo, and I push for you (this is the most agent-friendly long-term answer; we'll do it after the first deploy when the dust has settled)
4. Vercel auto-builds a preview URL for the branch
5. You click the preview, look it over, merge if good

The point: **the first push is the only friction.** After that, edit-review-deploy is smooth.
