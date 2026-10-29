// Single source of truth for the illustrative default mortgage rate shown by every calculator
// (Mortgage, BUY, BUY Condo Calc., Refinance, Rent vs Buy) and for the date printed next to it.
// To refresh: change DEFAULT_RATE_PCT and AS_OF together, rebuild. Nothing else to touch.
export const SITE_RATES = {
  DEFAULT_RATE_PCT: 4.50, // illustrative 5-year fixed, insured; published lender rates were ~4.1–4.4% in Sep–Oct 2026 and drifting up
  AS_OF: {
    iso: '2026-10-27',
    en: 'October 27, 2026',
    zh: '2026 年 10 月 27 日',
    fr: '27 octobre 2026',
  },
  HINT: {
    en: 'Illustrative 5-year fixed, as of October 27, 2026. Your lender sets your actual rate.',
    zh: '示例 5 年固定利率，截至 2026 年 10 月 27 日；实际利率以您的贷款机构为准。',
    fr: 'Taux fixe 5 ans indicatif, en date du 27 octobre 2026; votre prêteur fixe votre taux réel.',
  },
};
// Kept for the calculator disclaimers that already print the date.
export const RATE_DEFAULTS_AS_OF = SITE_RATES.AS_OF;
