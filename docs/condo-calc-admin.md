# BUY Condo Calc. — admin note

Page: https://www.realtorpeterlaw.com/buy-condo-calc (also /chinese/buy-condo-calc and /french/buy-condo-calc)

## Where the rate lives (all calculators)

File: `src/lib/site-rates.js`. One number and one date feed every calculator on the site:
BUY Condo Calc., Mortgage Calculator, BUY Calculator, Refinance Calculator (scenarios A/B/C are the
default, +0.25 and +0.50) and Rent vs Buy, in English, Chinese and French.

```js
DEFAULT_RATE_PCT: 4.50,   // illustrative 5-year fixed, insured
AS_OF: { iso: '2026-10-27', en: 'October 27, 2026', zh: '2026 年 10 月 27 日', fr: '27 octobre 2026' },
HINT:  { en: '...', zh: '...', fr: '...' },   // the sentence shown under each rate field; update the date inside it too
```

Change the rate, the four `AS_OF` strings and the three `HINT` dates together. The rate fields, the
"as of" hints and the calculator disclaimers all read from this file. Nothing else contains a rate.
Commit and push; Vercel rebuilds in about a minute.

## How often to check

Monthly, and after every Bank of Canada announcement date (next: October 28, 2026, then December 9, 2026).
Fixed rates follow bond yields rather than the policy rate, so check an insured 5-year fixed rate table
(e.g. Ratehub or nesto) and round to the nearest 0.05%.

## Other defaults in the same CONFIG block

Property-tax estimate (0.7% of price), utilities ($100 / $40 / $160 depending on what the fee covers),
condo insurance ($40), parking rent ($200), locker rent ($50), legal ($2,000), title + inspection + status
certificate ($1,000), adjustments ($500). Visitors can override every one of them on the page.

## Legal constants (change only when the law changes)

Minimum down payment rules, the $1.5M insured cap, premium tiers (4.00 / 3.10 / 2.80 + 0.20 for 30-year insured),
8% PST on the premium, stress-test floor 5.25%, Ontario LTT brackets and $4,000 refund, Toronto MLTT brackets
(April 1, 2026 luxury tiers) and $4,475 rebate. `RULES_VERIFIED` records the date they were last checked
against ontario.ca, toronto.ca and CMHC. Re-verify once a year or when the news mentions a change.

## Tests

`node scripts/test-condo-calc.mjs` runs the eight scenarios from the build brief plus reference checks.
Run it after touching anything in `src/lib/condo-calc.js`.
