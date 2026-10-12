/*
 * BUY Condo Calculator, calculation module (no UI, no dependencies).
 * Toronto resale condo: all-in monthly cost + cash needed on closing day.
 *
 * Every rule below is commented so a non-developer can follow it.
 * Money in: dollars (numbers). Rates in: percent (5 means 5%).
 *
 * RULES VERIFIED: 2026-10-12
 *   Ontario LTT brackets + $4,000 first-time refund  — ontario.ca, "Calculating Land Transfer Tax" and
 *     "Land Transfer Tax Refunds for First-Time Homebuyers"
 *   Toronto MLTT brackets incl. April 1, 2026 luxury tiers — toronto.ca, "MLTT Rates & Fees" (page dated April 7, 2026)
 *   Toronto first-time rebate max $4,475 — toronto.ca (unchanged since 2016; confirmed in 2024 City briefing note)
 *   Minimum down payment + $1.5M insured cap — canada.ca (FCAC) and federal Dec 15, 2024 rule change
 *   Default-insurance premium tiers 4.00 / 3.10 / 2.80 + 0.20 for 30-yr insured — CMHC standard schedule
 *     (CMHC page unreachable from the build sandbox on 2026-10-12; tiers match the site's existing BUY Calculator
 *     and every current industry table; re-check at cmhc-nchc.ca when the rate constant is next updated)
 */

// ======================================================================
// CONFIG, the only place a market number lives. Change these, nothing else.
// ======================================================================
export const CONFIG = {
  DEFAULT_RATE_PCT: 4.50,          // illustrative 5-year fixed, insured. Shown on screen with the date below.
  RATE_LAST_UPDATED: '2026-10-12', // printed next to the rate as "illustrative as of ..."
  RULES_VERIFIED: '2026-10-12',    // date the tax/insurance rules above were checked

  // Defaults for the "Refine this estimate" fields
  PROPERTY_TAX_RATE: 0.007,        // 0.7% of price per year (Toronto residential is ~0.72%; user can override)
  UTILITIES_DEFAULT: 100,          // $/month not covered by the condo fee (heat+water in, hydro out)
  UTILITIES_IF_HYDRO_INCLUDED: 40, // $/month when the fee also covers hydro (internet/other only)
  UTILITIES_IF_HEAT_NOT_INCLUDED: 160, // $/month when heat is not in the fee
  INSURANCE_DEFAULT: 40,           // condo unit insurance, $/month
  PARKING_RENT_DEFAULT: 200,       // $/month if parking is rented
  LOCKER_RENT_DEFAULT: 50,         // $/month if a locker is rented
  LEGAL_DEFAULT: 2000,             // closing: lawyer
  TITLE_INSPECTION_STATUS_DEFAULT: 1000, // closing: title insurance + inspection + status certificate
  ADJUSTMENTS_DEFAULT: 500,        // closing: prepaid tax/fee adjustments

  // Rules (change only when the law changes)
  INSURED_PRICE_CAP: 1500000,      // no default insurance at or above this price
  PST_ON_PREMIUM: 0.08,            // Ontario 8% PST on the insurance premium, cash at closing
  STRESS_TEST_FLOOR: 5.25,         // qualifying rate = max(rate + 2, 5.25)
  STRESS_TEST_BUFFER: 2.00,
  GDS_GUIDE: 39,                   // shown as "lenders typically look for 39% or less"
  TDS_GUIDE: 44,
  FTHB_ONT_REBATE_MAX: 4000,
  FTHB_TOR_REBATE_MAX: 4475,
};

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
/** Turn any input into a safe number (blank, "abc", NaN, negative -> 0). */
export function num(v) {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
const round2 = (n) => Math.round(n * 100) / 100;

// ======================================================================
// RULE 2, minimum down payment (federal)
//   up to $500,000: 5%
//   $500,000.01 to $1,499,999.99: 5% of the first $500,000 + 10% of the rest
//   $1,500,000 and up: 20%
// ======================================================================
export function minDownPayment(price) {
  if (price <= 0) return 0;
  if (price >= CONFIG.INSURED_PRICE_CAP) return price * 0.20;
  if (price <= 500000) return price * 0.05;
  return 500000 * 0.05 + (price - 500000) * 0.10;
}

// ======================================================================
// RULE 3, default-insurance premium (CMHC / Sagen / Canada Guaranty)
//   premium is a % of the MORTGAGE amount, by down-payment band:
//     5% to 9.99% down: 4.00%   10% to 14.99%: 3.10%   15% to 19.99%: 2.80%   20%+: none
//   +0.20% when an insured mortgage is amortized over 30 years
//   not available at all when price >= $1,500,000
// Returns the premium RATE as a decimal (0.04 = 4%), 0 when uninsured.
// ======================================================================
export function premiumRate(downPct, amortYears, price) {
  if (downPct >= 20) return 0;                       // conventional mortgage, no insurance
  if (price >= CONFIG.INSURED_PRICE_CAP) return null; // not insurable, caller must reject
  let rate = downPct >= 15 ? 0.028 : downPct >= 10 ? 0.031 : 0.040;
  if (amortYears > 25) rate += 0.002;                 // 30-year surcharge
  return rate;
}

// ======================================================================
// RULE 5, amortization limits
//   insured (under 20% down): 25 years max, 30 only for first-time buyers
//   uninsured (20%+ down): 30 years max
// Returns null when fine, or an error code the page turns into a plain-language message.
// ======================================================================
export function amortizationProblem(downPct, amortYears, firstTimeBuyer) {
  if (amortYears > 30) return { code: 'AMORT_OVER_30' };
  if (downPct < 20 && amortYears > 25 && !firstTimeBuyer) return { code: 'AMORT_30_NEEDS_FTHB' };
  return null;
}

// ======================================================================
// RULE 1, Canadian mortgage payment, SEMI-ANNUAL compounding
//   i = (1 + annualRate/2)^(1/6) - 1      (monthly rate equivalent)
//   payment = P * i / (1 - (1 + i)^-n)    n = months
// ======================================================================
export function monthlyPayment(principal, annualRatePct, amortYears) {
  if (principal <= 0 || amortYears <= 0) return 0;
  const n = amortYears * 12;
  const i = Math.pow(1 + annualRatePct / 200, 1 / 6) - 1;
  if (i === 0) return principal / n;
  return principal * i / (1 - Math.pow(1 + i, -n));
}

// RULE 6, stress test: qualify at the greater of (rate + 2%) and 5.25%
export function stressTestRate(annualRatePct) {
  return Math.max(annualRatePct + CONFIG.STRESS_TEST_BUFFER, CONFIG.STRESS_TEST_FLOOR);
}

// ======================================================================
// RULE 8, Ontario Land Transfer Tax (1 or 2 single-family residences, incl. condos)
//   0.5% to $55,000 | 1.0% to $250,000 | 1.5% to $400,000 | 2.0% to $2,000,000 | 2.5% above
// ======================================================================
const ONT_BRACKETS = [[55000, 0.005], [250000, 0.010], [400000, 0.015], [2000000, 0.020], [Infinity, 0.025]];
// Toronto MLTT, same first four brackets, then the luxury tiers in force since April 1, 2026
const TOR_BRACKETS = [[55000, 0.005], [250000, 0.010], [400000, 0.015], [2000000, 0.020], [3000000, 0.025],
                      [4000000, 0.044], [5000000, 0.0545], [10000000, 0.065], [20000000, 0.0755], [Infinity, 0.086]];
function bracketTax(price, brackets) {
  let tax = 0, lower = 0;
  for (const [upper, rate] of brackets) {
    if (price <= lower) break;
    tax += (Math.min(price, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}
export const ontarioLTT = (price) => bracketTax(price, ONT_BRACKETS);
export const torontoMLTT = (price) => bracketTax(price, TOR_BRACKETS);

/** Land transfer tax block: provincial + Toronto (if inside the city), less first-time rebates. */
export function landTransferTax(price, insideToronto, firstTimeBuyer) {
  const ontario = ontarioLTT(price);
  const toronto = insideToronto ? torontoMLTT(price) : 0;
  const rebateOntario = firstTimeBuyer ? Math.min(ontario, CONFIG.FTHB_ONT_REBATE_MAX) : 0;
  const rebateToronto = firstTimeBuyer && insideToronto ? Math.min(toronto, CONFIG.FTHB_TOR_REBATE_MAX) : 0;
  return { ontario, toronto, rebateOntario, rebateToronto, total: ontario + toronto - rebateOntario - rebateToronto };
}

// ======================================================================
// RULE 7, GDS / TDS (only when income is entered). Ratios only, never a verdict.
//   GDS = (P&I + property tax + heat + 50% of condo fee) / gross monthly income
//   TDS = GDS numerator + other monthly debts, over the same income
//   If the fee includes heat, heat is already inside the 50% fee share: do not add it again.
// ======================================================================
export function ratios({ pAndI, propertyTaxMonthly, condoFee, feeIncludesHeat, heatMonthly, otherDebtsMonthly, grossAnnualIncome }) {
  if (!(grossAnnualIncome > 0)) return null;
  const income = grossAnnualIncome / 12;
  const heat = feeIncludesHeat ? 0 : heatMonthly;
  const housing = pAndI + propertyTaxMonthly + heat + 0.5 * condoFee;
  return { gds: housing / income * 100, tds: (housing + otherDebtsMonthly) / income * 100 };
}

// ======================================================================
// MAIN, everything together. Returns { errors: [...] } when the inputs are not allowed,
// otherwise a full result object. Never throws, never returns NaN.
// ======================================================================
export function calculate(raw) {
  const price = num(raw.price);
  const down = num(raw.downPayment);                 // dollars (UI converts % to $ before calling)
  const ratePct = num(raw.ratePct);
  const amort = num(raw.amortYears) || 25;
  const fthb = !!raw.firstTimeBuyer;
  const toronto = raw.insideToronto !== false;       // default yes
  const condoFee = num(raw.condoFee);

  if (price <= 0) return { empty: true };
  const errors = [];

  // Rule 2: minimum down payment
  // Errors are returned as language-neutral codes; the page turns them into EN / ZH / FR sentences.
  const minDown = minDownPayment(price);
  if (down < minDown - 0.005) {
    const rule = price >= CONFIG.INSURED_PRICE_CAP ? 'CAP' : price <= 500000 ? 'FIVE' : 'SPLIT';
    errors.push({ code: 'MIN_DOWN', price, minDown, short: minDown - down, rule });
  }
  if (down > price) errors.push({ code: 'DOWN_OVER_PRICE' });
  const downPct = price > 0 ? down / price * 100 : 0;

  // Rule 5: amortization
  const amortErr = amortizationProblem(downPct, amort, fthb);
  if (amortErr) errors.push(amortErr);
  if (ratePct <= 0) errors.push({ code: 'RATE_ZERO' });
  if (errors.length) return { errors, minDown, downPct };

  // Rule 3: insurance premium (added to the mortgage) and Rule 4: PST on it (cash at closing)
  const baseLoan = price - down;
  const pRate = premiumRate(downPct, amort, price) || 0;
  const premium = baseLoan * pRate;
  const premiumPST = premium * CONFIG.PST_ON_PREMIUM;
  const totalMortgage = baseLoan + premium;

  // Rule 1: payment, Rule 6: stress test
  const pAndI = monthlyPayment(totalMortgage, ratePct, amort);
  const stressRate = stressTestRate(ratePct);
  const stressPayment = monthlyPayment(totalMortgage, stressRate, amort);
  const totalInterest = pAndI * amort * 12 - totalMortgage;

  // Monthly carrying costs
  const propertyTaxAnnual = raw.propertyTaxAnnual != null && raw.propertyTaxAnnual !== '' ? num(raw.propertyTaxAnnual) : price * CONFIG.PROPERTY_TAX_RATE;
  const propertyTaxMonthly = propertyTaxAnnual / 12;
  const utilities = raw.utilitiesMonthly != null && raw.utilitiesMonthly !== '' ? num(raw.utilitiesMonthly) : CONFIG.UTILITIES_DEFAULT;
  const insurance = raw.insuranceMonthly != null && raw.insuranceMonthly !== '' ? num(raw.insuranceMonthly) : CONFIG.INSURANCE_DEFAULT;
  const parkingRent = raw.parking === 'rented' ? num(raw.parkingMonthly ?? CONFIG.PARKING_RENT_DEFAULT) : 0;
  const lockerRent = raw.locker === 'rented' ? num(raw.lockerMonthly ?? CONFIG.LOCKER_RENT_DEFAULT) : 0;
  const monthlyTotal = pAndI + condoFee + propertyTaxMonthly + utilities + insurance + parkingRent + lockerRent;

  // One-time cash on closing day
  const ltt = landTransferTax(price, toronto, fthb);
  const legal = raw.legal != null && raw.legal !== '' ? num(raw.legal) : CONFIG.LEGAL_DEFAULT;
  const titleEtc = raw.titleEtc != null && raw.titleEtc !== '' ? num(raw.titleEtc) : CONFIG.TITLE_INSPECTION_STATUS_DEFAULT;
  const adjustments = raw.adjustments != null && raw.adjustments !== '' ? num(raw.adjustments) : CONFIG.ADJUSTMENTS_DEFAULT;
  const closingTotal = down + premiumPST + ltt.total + legal + titleEtc + adjustments;

  // Rule 7: ratios, only with income
  const feeIncludesHeat = raw.feeIncludesHeat !== false; // default yes
  const r = ratios({ pAndI, propertyTaxMonthly, condoFee, feeIncludesHeat, heatMonthly: utilities, otherDebtsMonthly: num(raw.otherDebtsMonthly), grossAnnualIncome: num(raw.grossAnnualIncome) });

  return {
    inputs: { price, down, downPct: round2(downPct), ratePct, amort, fthb, toronto, condoFee },
    insurance: { rate: pRate, premium: round2(premium), pst: round2(premiumPST), insured: pRate > 0 },
    mortgage: { baseLoan, totalMortgage: round2(totalMortgage), pAndI: round2(pAndI), stressRate, stressPayment: round2(stressPayment), totalInterest: round2(totalInterest) },
    monthly: { pAndI: round2(pAndI), condoFee, propertyTax: round2(propertyTaxMonthly), utilities, insurance, parkingRent, lockerRent, total: round2(monthlyTotal) },
    closing: { down, premiumPST: round2(premiumPST), ltt, legal, titleEtc, adjustments, total: round2(closingTotal) },
    ratios: r ? { gds: round2(r.gds), tds: round2(r.tds), gdsGuide: CONFIG.GDS_GUIDE, tdsGuide: CONFIG.TDS_GUIDE } : null,
  };
}

