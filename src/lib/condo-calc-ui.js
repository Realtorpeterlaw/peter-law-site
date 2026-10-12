/*
 * BUY Condo Calc., UI wiring. Shared by the English, Chinese and French pages.
 * All math lives in ./condo-calc.js. This file only reads inputs, calls calculate(),
 * and writes the results into the page. Strings come from the page (see initCondoCalc(strings)).
 */
import { calculate, minDownPayment, premiumRate, CONFIG } from './condo-calc.js';

export function initCondoCalc(T) {
  const $ = (id) => document.getElementById(id);
  const locale = T.locale || 'en-CA';
  const money = (n, dp = 2) => (Number.isFinite(n) ? n : 0).toLocaleString(locale, { style: 'currency', currency: 'CAD', minimumFractionDigits: dp, maximumFractionDigits: dp });
  const pct = (n, dp = 2) => (Number.isFinite(n) ? n : 0).toLocaleString(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp }) + (locale === 'fr-CA' ? ' %' : '%');
  const num = (el) => { const v = parseFloat(String(el.value).replace(/[^0-9.\-]/g, '')); return Number.isFinite(v) && v > 0 ? v : 0; };

  // ---- elements ----
  const price = $('cc-price'), down = $('cc-down'), slider = $('cc-down-slider'), fee = $('cc-fee'), rate = $('cc-rate');
  const modeBtns = document.querySelectorAll('[data-down-mode]');
  const refine = {
    heat: $('cc-heat'), hydro: $('cc-hydro'), utilities: $('cc-utilities'), tax: $('cc-tax'), insurance: $('cc-insurance'),
    parking: $('cc-parking'), parkingCost: $('cc-parking-cost'), locker: $('cc-locker'), lockerCost: $('cc-locker-cost'),
    fthb: $('cc-fthb'), amort: $('cc-amort'), toronto: $('cc-toronto'), income: $('cc-income'), debts: $('cc-debts'),
    legal: $('cc-legal'), titleEtc: $('cc-title'), adjustments: $('cc-adjust'),
  };
  let downMode = '%';               // '$' or '%'
  let userEditedUtilities = false, userEditedTax = false;
  rate.value = CONFIG.DEFAULT_RATE_PCT.toFixed(2);
  document.querySelectorAll('[data-rate-date]').forEach((el) => { el.textContent = T.formatDate(CONFIG.RATE_LAST_UPDATED); });
  document.querySelectorAll('[data-rate-value]').forEach((el) => { el.textContent = pct(CONFIG.DEFAULT_RATE_PCT); });

  // ---- down payment: $ <-> % toggle and slider ----
  function downDollars() {
    const p = num(price); const v = num(down);
    return downMode === '%' ? p * v / 100 : v;
  }
  function setDownMode(mode) {
    const p = num(price); const current = downDollars();
    downMode = mode;
    modeBtns.forEach((b) => { const on = b.dataset.downMode === mode; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    $('cc-down-wrap').dataset.mode = mode;
    down.step = mode === '%' ? '0.5' : '1000';
    if (p > 0) down.value = mode === '%' ? (current / p * 100).toFixed(1).replace(/\.0$/, '') : Math.round(current);
    recompute();
  }
  modeBtns.forEach((b) => b.addEventListener('click', () => setDownMode(b.dataset.downMode)));
  function syncSliderRange() {
    const p = num(price);
    const minPct = p > 0 ? Math.ceil(minDownPayment(p) / p * 1000) / 10 : 5;
    slider.min = String(minPct); slider.max = '35'; slider.step = '0.5';
    const pctNow = p > 0 ? downDollars() / p * 100 : 0;
    slider.value = String(Math.min(35, Math.max(minPct, pctNow || minPct)));
  }
  slider.addEventListener('input', () => {
    let v = parseFloat(slider.value);
    for (const tier of [5, 10, 15, 20]) if (Math.abs(v - tier) <= 0.75) v = tier;  // snap at the premium tiers
    slider.value = String(v);
    const p = num(price);
    down.value = downMode === '%' ? String(v) : String(Math.round(p * v / 100));
    recompute(true);
  });

  // ---- defaults that follow other inputs until the user edits them ----
  refine.utilities.addEventListener('input', () => { userEditedUtilities = true; });
  refine.tax.addEventListener('input', () => { userEditedTax = true; });
  function suggestedUtilities() {
    if (refine.heat.value === 'no') return CONFIG.UTILITIES_IF_HEAT_NOT_INCLUDED;
    if (refine.hydro.value === 'yes') return CONFIG.UTILITIES_IF_HYDRO_INCLUDED;
    return CONFIG.UTILITIES_DEFAULT;
  }
  function refreshDefaults() {
    if (!userEditedUtilities) refine.utilities.value = suggestedUtilities();
    if (!userEditedTax) { const p = num(price); refine.tax.value = p > 0 ? Math.round(p * CONFIG.PROPERTY_TAX_RATE) : ''; }
    $('cc-parking-cost-wrap').hidden = refine.parking.value !== 'rented';
    $('cc-locker-cost-wrap').hidden = refine.locker.value !== 'rented';
  }

  // ---- error messages (codes come from the module) ----
  function errorText(e) {
    if (e.code === 'MIN_DOWN') return T.errMinDown(money(e.price, 0), money(e.minDown, 0), money(e.short, 0), e.rule);
    if (e.code === 'DOWN_OVER_PRICE') return T.errDownOverPrice;
    if (e.code === 'AMORT_30_NEEDS_FTHB') return T.errAmort30;
    if (e.code === 'AMORT_OVER_30') return T.errAmortOver30;
    if (e.code === 'RATE_ZERO') return T.errRate;
    return '';
  }

  // ---- main ----
  function recompute(fromSlider) {
    refreshDefaults();
    if (!fromSlider) syncSliderRange();
    const p = num(price);
    const r = calculate({
      price: p, downPayment: downDollars(), ratePct: num(rate), amortYears: num(refine.amort),
      firstTimeBuyer: refine.fthb.checked, insideToronto: refine.toronto.value === 'yes', condoFee: num(fee),
      feeIncludesHeat: refine.heat.value !== 'no', utilitiesMonthly: refine.utilities.value, propertyTaxAnnual: refine.tax.value,
      insuranceMonthly: refine.insurance.value, parking: refine.parking.value, parkingMonthly: refine.parkingCost.value,
      locker: refine.locker.value, lockerMonthly: refine.lockerCost.value, grossAnnualIncome: refine.income.value,
      otherDebtsMonthly: refine.debts.value, legal: refine.legal.value, titleEtc: refine.titleEtc.value, adjustments: refine.adjustments.value,
    });

    // insurance pill under the slider
    const pill = $('cc-ins-pill');
    if (p > 0) {
      const dPct = downDollars() / p * 100; const pr = premiumRate(dPct, num(refine.amort), p);
      const minD = minDownPayment(p);
      $('cc-min-note').textContent = T.minNote(money(minD, 0), pct(minD / p * 100, 1));
      if (pr === null || downDollars() < minD - 0.005) { pill.textContent = T.pillNotInsurable; pill.dataset.state = 'bad'; }
      else if (pr === 0) { pill.textContent = T.pillNone; pill.dataset.state = 'good'; }
      else { pill.textContent = T.pillPremium(pct(pr * 100), money((p - downDollars()) * pr, 0)); pill.dataset.state = 'warn'; }
    } else { pill.textContent = ''; pill.dataset.state = ''; $('cc-min-note').textContent = ''; }

    const empty = $('cc-empty'), err = $('cc-errors'), out = $('cc-out');
    if (r.empty) { empty.hidden = false; err.hidden = true; out.hidden = true; return; }
    if (r.errors) {
      empty.hidden = true; out.hidden = true; err.hidden = false;
      err.innerHTML = '<ul>' + r.errors.map((e) => '<li>' + errorText(e) + '</li>').join('') + '</ul>';
      return;
    }
    empty.hidden = true; err.hidden = true; out.hidden = false;

    // headline + monthly breakdown
    $('cc-total').textContent = money(r.monthly.total, 0);
    $('cc-total-cents').textContent = money(r.monthly.total);
    const rows = { 'cc-m-pi': r.monthly.pAndI, 'cc-m-fee': r.monthly.condoFee, 'cc-m-tax': r.monthly.propertyTax, 'cc-m-util': r.monthly.utilities, 'cc-m-ins': r.monthly.insurance, 'cc-m-park': r.monthly.parkingRent + r.monthly.lockerRent, 'cc-m-total': r.monthly.total };
    for (const id in rows) $(id).textContent = money(rows[id]);
    $('cc-m-park-row').hidden = rows['cc-m-park'] <= 0;
    // stacked bar
    const parts = [['pi', r.monthly.pAndI], ['fee', r.monthly.condoFee], ['tax', r.monthly.propertyTax], ['util', r.monthly.utilities], ['ins', r.monthly.insurance], ['park', rows['cc-m-park']]];
    parts.forEach(([k, v]) => { const seg = $('cc-bar-' + k); if (seg) seg.style.width = (r.monthly.total > 0 ? v / r.monthly.total * 100 : 0) + '%'; });

    // closing day
    $('cc-c-down').textContent = money(r.closing.down);
    $('cc-c-pst').textContent = money(r.closing.premiumPST);
    $('cc-c-pst-note').textContent = r.insurance.insured ? T.pstNote(pct(r.insurance.rate * 100), money(r.insurance.premium, 0)) : T.pstNone;
    $('cc-c-ltt-on').textContent = money(r.closing.ltt.ontario);
    $('cc-c-ltt-tor-row').hidden = !r.inputs.toronto;
    $('cc-c-ltt-tor').textContent = money(r.closing.ltt.toronto);
    const rebate = r.closing.ltt.rebateOntario + r.closing.ltt.rebateToronto;
    $('cc-c-rebate-row').hidden = rebate <= 0;
    $('cc-c-rebate').textContent = '−' + money(rebate);
    $('cc-c-total').textContent = money(r.closing.total);

    // details
    $('cc-d-mortgage').textContent = money(r.mortgage.totalMortgage);
    $('cc-d-mortgage-note').textContent = r.insurance.insured ? T.mortgageNote(money(r.mortgage.baseLoan), money(r.insurance.premium)) : T.mortgageNoteNone;
    $('cc-d-interest').textContent = money(r.mortgage.totalInterest);
    $('cc-d-interest-note').textContent = T.interestNote(r.inputs.amort, pct(r.inputs.ratePct));
    $('cc-d-stress').textContent = money(r.mortgage.stressPayment) + T.perMonth;
    $('cc-d-stress-note').textContent = T.stressNote(pct(r.mortgage.stressRate), money(r.mortgage.pAndI));
    const ratioBox = $('cc-d-ratios');
    if (r.ratios) {
      ratioBox.innerHTML = '<p>' + T.gdsText(pct(r.ratios.gds, 0), r.ratios.gdsGuide + '%') + '</p><p>' + T.tdsText(pct(r.ratios.tds, 0), r.ratios.tdsGuide + '%') + '</p><p class="cc-ratio-note">' + T.ratioNote + '</p>';
    } else { ratioBox.innerHTML = '<p class="cc-ratio-note">' + T.ratioEmpty + '</p>'; }

    // lead-capture hidden fields (numbers only, no personal data)
    const summary = T.summary(r, money, pct);
    $('cc-lead-summary').value = summary;
    $('cc-lead-price').value = money(r.inputs.price, 0);
    $('cc-lead-total').value = money(r.monthly.total);
  }

  [price, down, fee, rate].forEach((el) => el.addEventListener('input', () => recompute()));
  Object.values(refine).forEach((el) => el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', () => recompute()));
  down.addEventListener('input', () => { /* keep slider in step with typed values */ const p = num(price); if (p > 0) slider.value = String(Math.min(35, Math.max(parseFloat(slider.min) || 5, downDollars() / p * 100))); });
  const printBtn = $('cc-print'); if (printBtn) printBtn.addEventListener('click', () => window.print());
  setDownMode('%');
}
