import { test, expect } from '@playwright/test';

// ─── HOMEPAGE ──────────────────────────────────────────────
test('homepage loads with expected content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Toronto Rental Realtor/i);
  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.locator('a[href="/contact"]').first()).toBeVisible();
});

test('language switcher offers EN / 中文 / FR', async ({ page }) => {
  await page.goto('/');
  const bar = page.locator('.topbar-right').first();
  await expect(bar.getByRole('link', { name: '中文' })).toBeVisible();
  await expect(bar.getByRole('link', { name: 'FR' })).toBeVisible();
});

// ─── LANGUAGES ─────────────────────────────────────────────
test('French homepage loads and shows French copy', async ({ page }) => {
  await page.goto('/french');
  await expect(page.locator('h1').first()).toBeVisible();
  await expect(page.locator('body')).toContainText(/(Toronto|Location|Immobilier)/i);
});

test('Chinese homepage loads', async ({ page }) => {
  await page.goto('/chinese');
  await expect(page.locator('h1').first()).toBeVisible();
});

// ─── CALCULATORS ───────────────────────────────────────────
test('Rental Calculator computes a verdict', async ({ page }) => {
  await page.goto('/rental-calculator');
  await page.locator('#rc-income').fill('3000');
  await page.locator('#rc-rent').fill('2200');
  // trigger recompute — most inputs listen to input event, but explicitly tab out
  await page.locator('#rc-rent').blur();
  await expect(page.locator('#rc-verdict-title')).not.toContainText('Type your numbers above.');
  await expect(page.locator('#rc-meter-pct')).not.toHaveText('0%');
});

test('Rental Calculator 80%+ verdict shows the "too high" message', async ({ page }) => {
  await page.goto('/rental-calculator');
  await page.locator('#rc-income').fill('1000');
  await page.locator('#rc-rent').fill('2000');
  await page.locator('#rc-rent').blur();
  await expect(page.locator('#rc-verdict-title')).toContainText(/too high|won't suffice/i);
});

test('Payment Calculator page loads (Mortgage)', async ({ page }) => {
  await page.goto('/payment-calculator');
  await expect(page.locator('h1')).toContainText(/Mortgage|Calculator/i);
});

test('BUY Calculator (all-calculator) page loads', async ({ page }) => {
  await page.goto('/all-calculator');
  await expect(page.locator('h1').first()).toBeVisible();
});

// ─── NAV / PAGES ───────────────────────────────────────────
test('For Renters page loads and CTA works', async ({ page }) => {
  await page.goto('/for-renters');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('a[href="/contact"]').first()).toBeVisible();
});

test('Buyer Guide loads', async ({ page }) => {
  await page.goto('/buyer-guide');
  await expect(page.locator('h1')).toBeVisible();
});

test('About page loads with credentials', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('body')).toContainText(/RECO/i);
});

test('Contact page has the form', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
});

// ─── BLOG ──────────────────────────────────────────────────
test('Blog index lists posts', async ({ page }) => {
  await page.goto('/blog');
  const cards = page.locator('.blog-card');
  await expect(cards).not.toHaveCount(0);
});

test('New Ontario Property Taxes post renders charts + collapsible', async ({ page }) => {
  await page.goto('/blog/ontario-property-taxes-rising');
  await expect(page.locator('h1')).toContainText(/Property Taxes/i);
  await expect(page.locator('.bar-chart').first()).toBeVisible();
  await expect(page.locator('#means summary')).toBeVisible();
});

// ─── 404 ───────────────────────────────────────────────────
test('404 page renders on unknown route', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist-abc123', { waitUntil: 'load' });
  // Static hosts serve 200 for the 404.html fallback; we check the content
  await expect(page.locator('h1')).toContainText(/moved on|404|not found/i);
});

// ─── SEO / METADATA ────────────────────────────────────────
test('homepage has canonical + og tags', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /https:\/\/www\.realtorpeterlaw\.com/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /peter-cn-tower\.jpg/);
});
