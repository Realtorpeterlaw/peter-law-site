import { calculate, minDownPayment, premiumRate, monthlyPayment, landTransferTax, CONFIG } from '../src/lib/condo-calc.js';
const $ = (n) => '$' + Math.round(n).toLocaleString('en-CA');
let fails = 0; const ok = (cond, label, detail='') => { console.log((cond ? 'PASS ' : 'FAIL ') + label + (detail ? '  -> ' + detail : '')); if (!cond) fails++; };
const base = { ratePct: 4.5, condoFee: 650, amortYears: 25, insideToronto: true };

// 1. $650,000, 5% down -> rejected, minimum $40,000
let r = calculate({ ...base, price: 650000, downPayment: 650000 * 0.05 });
ok(r.errors && r.errors[0].code === 'MIN_DOWN' && r.errors[0].minDown === 40000 && r.errors[0].short === 7500, 'T1 $650k @5% rejected, min $40,000, $7,500 short', JSON.stringify(r.errors && r.errors[0]));

// 2. $650,000, $40,000 down -> accepted, 4.00%, 25 yr
r = calculate({ ...base, price: 650000, downPayment: 40000 });
ok(!r.errors && r.insurance.rate === 0.04 && r.inputs.amort === 25, 'T2 $650k / $40k: premium 4.00%, 25-yr', `premium ${$(r.insurance.premium)} on ${$(r.mortgage.baseLoan)}, PST ${$(r.insurance.pst)}, P&I ${$(r.mortgage.pAndI)}, all-in ${$(r.monthly.total)}/mo, cash to close ${$(r.closing.total)}`);

// 3. + first-time buyer, 30 yr -> 4.20%
r = calculate({ ...base, price: 650000, downPayment: 40000, firstTimeBuyer: true, amortYears: 30 });
ok(!r.errors && Math.abs(r.insurance.rate - 0.042) < 1e-9, 'T3 FTHB 30-yr: premium 4.20%', `premium ${$(r.insurance.premium)}, P&I ${$(r.mortgage.pAndI)}, LTT net ${$(r.closing.ltt.total)} (rebates ${$(r.closing.ltt.rebateOntario)} + ${$(r.closing.ltt.rebateToronto)})`);

// 4. not FTHB, 30 yr insured -> rejected
r = calculate({ ...base, price: 650000, downPayment: 40000, firstTimeBuyer: false, amortYears: 30 });
ok(r.errors && r.errors[0].code === 'AMORT_30_NEEDS_FTHB', 'T4 non-FTHB 30-yr insured rejected', JSON.stringify(r.errors && r.errors[0]));

// 5. $1,500,000, 15% down -> rejected, 20% minimum
r = calculate({ ...base, price: 1500000, downPayment: 225000 });
ok(r.errors && r.errors[0].code === 'MIN_DOWN' && r.errors[0].minDown === 300000 && r.errors[0].rule === 'CAP', 'T5 $1.5M @15% rejected, min $300,000, no insurance (CAP rule)', JSON.stringify(r.errors && r.errors[0]));

// 6. $800,000, 20% down -> no premium, no PST, 30-yr OK
r = calculate({ ...base, price: 800000, downPayment: 160000, amortYears: 30 });
ok(!r.errors && r.insurance.premium === 0 && r.insurance.pst === 0 && r.inputs.amort === 30, 'T6 $800k @20%: no premium, no PST, 30-yr permitted', `P&I ${$(r.mortgage.pAndI)}, stress @${r.mortgage.stressRate}% = ${$(r.mortgage.stressPayment)}`);

// 7. fee includes heat + income -> heat not double counted
const a = calculate({ ...base, price: 650000, downPayment: 130000, grossAnnualIncome: 120000, feeIncludesHeat: true, utilitiesMonthly: 100 });
const b = calculate({ ...base, price: 650000, downPayment: 130000, grossAnnualIncome: 120000, feeIncludesHeat: false, utilitiesMonthly: 100 });
const expectedA = (a.mortgage.pAndI + a.monthly.propertyTax + 0.5 * 650) / 10000 * 100;
ok(Math.abs(a.ratios.gds - expectedA) < 0.01 && b.ratios.gds > a.ratios.gds, 'T7 GDS: heat not added when the fee includes it', `GDS with heat in fee ${a.ratios.gds}% vs heat separate ${b.ratios.gds}% (TDS ${a.ratios.tds}%)`);

// 8. Toronto vs outside, same price
const t = calculate({ ...base, price: 650000, downPayment: 130000, insideToronto: true });
const o = calculate({ ...base, price: 650000, downPayment: 130000, insideToronto: false });
ok(t.closing.ltt.toronto > 0 && o.closing.ltt.toronto === 0 && t.closing.ltt.ontario === o.closing.ltt.ontario, 'T8 Toronto shows both LTT lines; outside provincial only', `Ontario ${$(t.closing.ltt.ontario)}, Toronto ${$(t.closing.ltt.toronto)} vs outside ${$(o.closing.ltt.toronto)}`);

// Extra sanity: known reference values
ok(Math.abs(monthlyPayment(500000, 5, 25) - 2908.02) < 0.5, 'Ref: $500k @5% 25-yr semi-annual = $2,908/mo', monthlyPayment(500000, 5, 25).toFixed(2));
ok(Math.round(landTransferTax(1000000, true, false).ontario) === 16475 && Math.round(landTransferTax(1000000, true, false).toronto) === 16475, 'Ref: $1M LTT = $16,475 each (ontario.ca / toronto.ca example)');
ok(Math.round(landTransferTax(3500000, true, false).toronto) === 83475, 'Ref: $3.5M Toronto MLTT incl. 4.40% tier = $83,475 (hand-checked)', Math.round(landTransferTax(3500000, true, false).toronto));
ok(minDownPayment(1499999) < 1499999 * 0.2 && minDownPayment(1500000) === 300000, 'Ref: cap flips to 20% at exactly $1,500,000');
ok(premiumRate(19.99, 25, 800000) === 0.028 && premiumRate(20, 25, 800000) === 0, 'Ref: premium drops to 0 at exactly 20% down');
ok(!calculate({ price: 'abc', downPayment: '', ratePct: null }).errors, 'Ref: garbage input -> empty state, no NaN');
console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
