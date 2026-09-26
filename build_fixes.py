import json

fixes = []

def add(file, old, new, why):
    fixes.append({"file": file, "old": old, "new": new, "why": why})

# rhsp.astro
add("src/pages/blog/rhsp.astro",
    "is roughly <strong>$1,000 a month less</strong> than the open market, that's around <strong>$12,000 a year</strong> back in your pocket if you land one.",
    "is roughly <strong>$1,000 a month less</strong> than the open market: that's around <strong>$12,000 a year</strong> back in your pocket if you land one.",
    "comma splice")
add("src/pages/blog/rhsp.astro",
    "So expect new RHSP-supported buildings to first appear as regular market rentals, the affordable slots inside them typically fill through a separate lottery or application process.",
    "So expect new RHSP-supported buildings to first appear as regular market rentals; the affordable slots inside them typically fill through a separate lottery or application process.",
    "comma splice")
add("src/pages/blog/rhsp.astro",
    "No open calls right now, future calls depend on the City's budget.",
    "No open calls right now; future calls depend on the City's budget.",
    "comma splice")
add("src/pages/blog/rhsp.astro",
    "Many working renters, nurses, teachers, hospitality workers, entry-level tech workers, qualify.",
    "Many working renters (nurses, teachers, hospitality workers, entry-level tech workers) qualify.",
    "damaged parenthetical list")

# index.astro
add("src/pages/index.astro",
    "Toronto rental realtor helping tenants get approved and moved in, full-service, search to keys.",
    "Toronto rental realtor helping tenants get approved and moved in: full-service, search to keys.",
    "comma splice")

# past-deals.astro
add("src/pages/past-deals.astro",
    "HomeLife Golconda Realty., Inc Brokerage.",
    "HomeLife Golconda Realty Inc., Brokerage.",
    "typo")

# rent-control.astro
add("src/pages/rent-control.astro",
    "Ontario's <strong>2027 guideline is 1.9%</strong>, that's pre-filled so you can start with a real number.",
    "Ontario's <strong>2027 guideline is 1.9%</strong>; that's pre-filled so you can start with a real number.",
    "comma splice")

# land-transfer-tax.astro
add("src/pages/land-transfer-tax.astro",
    "It's not a separate cheque you write to the government, it's part of the closing costs the lawyer collects from you and remits to the relevant tax authorities.",
    "It's not a separate cheque you write to the government; it's part of the closing costs the lawyer collects from you and remits to the relevant tax authorities.",
    "comma splice")

# closing-costs.astro
add("src/pages/closing-costs.astro",
    "Your lawyer calculates these, you don't have to",
    "Your lawyer calculates these; you don't have to",
    "comma splice")
add("src/pages/closing-costs.astro",
    "Don't drain your down payment to the dollar, keep a closing-cost reserve.",
    "Don't drain your down payment to the dollar; keep a closing-cost reserve.",
    "comma splice")
add("src/pages/closing-costs.astro",
    "Numbers in this guide are typical ranges as of late 2024, fees and rates change.",
    "Numbers in this guide are typical ranges as of late 2024; fees and rates change.",
    "comma splice")

# first-time-buyer-guide-condos.astro
add("src/pages/blog/first-time-buyer-guide-condos.astro",
    "Do your <strong>Pre-Delivery Inspection</strong> carefully, it's your one chance to document defects on the record.",
    "Do your <strong>Pre-Delivery Inspection</strong> carefully: it's your one chance to document defects on the record.",
    "comma splice")
add("src/pages/blog/first-time-buyer-guide-condos.astro",
    "the builder's credited rebate can be clawed back, you may owe a large sum on closing day.",
    "the builder's credited rebate can be clawed back; you may owe a large sum on closing day.",
    "comma splice")
add("src/pages/blog/first-time-buyer-guide-condos.astro",
    "There's a separate rebate for landlords with different rules. Don't guess, ask your accountant.",
    "There's a separate rebate for landlords with different rules. Don't guess; ask your accountant.",
    "comma splice")
add("src/pages/blog/first-time-buyer-guide-condos.astro",
    "There are limited exceptions, international students, work-permit holders meeting specific conditions, refugees, and some diplomats.",
    "There are limited exceptions: international students, work-permit holders meeting specific conditions, refugees, and some diplomats.",
    "comma before list should be colon")

# fhsa.astro
add("src/pages/blog/fhsa.astro",
    "an RRSP makes you pay tax when you pull the money out, a TFSA never gave you a deduction going in.",
    "an RRSP makes you pay tax when you pull the money out; a TFSA never gave you a deduction going in.",
    "comma splice")
add("src/pages/blog/fhsa.astro",
    "The HBP withdrawal does, you have 15 years to repay your RRSP, starting in year 2 after withdrawal.",
    "The HBP withdrawal does; you have 15 years to repay your RRSP, starting in year 2 after withdrawal.",
    "comma splice")
add("src/pages/blog/fhsa.astro",
    "You can do both in the same year, at closing, your lawyer or builder can receive both amounts toward the down payment.",
    "You can do both in the same year; at closing, your lawyer or builder can receive both amounts toward the down payment.",
    "comma splice")
add("src/pages/blog/fhsa.astro",
    "This transfer does NOT use any of your RRSP contribution room, it's a bonus.",
    "This transfer does NOT use any of your RRSP contribution room; it's a bonus.",
    "comma splice")

# heloc.astro
add("src/pages/blog/heloc.astro",
    "When you pay it back, the room becomes available again, that's the \"revolving\" part.",
    "When you pay it back, the room becomes available again: that's the \"revolving\" part.",
    "comma splice")
add("src/pages/blog/heloc.astro",
    "That's why HELOCs can become long-term debt if you're not careful, you can carry the balance forever as long as you pay the interest.",
    "That's why HELOCs can become long-term debt if you're not careful: you can carry the balance forever as long as you pay the interest.",
    "comma splice")
add("src/pages/blog/heloc.astro",
    "You won't always get the maximum, the bank will assess your income to see how much they're comfortable approving.",
    "You won't always get the maximum: the bank will assess your income to see how much they're comfortable approving.",
    "comma splice")
add("src/pages/blog/heloc.astro",
    "HELOC rates are <strong>variable</strong>, they move with the Bank of Canada's prime rate.",
    "HELOC rates are <strong>variable</strong>: they move with the Bank of Canada's prime rate.",
    "comma splice")
add("src/pages/blog/heloc.astro",
    "A HELOC is a \"demand\" loan, most banks don't actually call it, but they have the legal right to ask for the full balance back if your financial situation deteriorates badly.",
    "A HELOC is a \"demand\" loan; most banks don't actually call it, but they have the legal right to ask for the full balance back if your financial situation deteriorates badly.",
    "comma splice")

# time-of-use-tou.astro
add("src/pages/blog/time-of-use-tou.astro",
    "Actual rates change every May 1 and November 1, check the OEB or your provider's website for the current period.",
    "Actual rates change every May 1 and November 1; check the OEB or your provider's website for the current period.",
    "comma splice")
add("src/pages/blog/time-of-use-tou.astro",
    "Hydro bills, condo fees, heating, they add up.",
    "Hydro bills, condo fees, heating: they add up.",
    "comma splice")

# bill-60-ontario.astro
add("src/pages/blog/bill-60-ontario.astro",
    "The government's word for it is \"omnibus\", that just means one law that changes many other laws.",
    "The government's word for it is \"omnibus\": that just means one law that changes many other laws.",
    "comma splice")

# vacant-home-tax.astro
add("src/pages/blog/vacant-home-tax.astro",
    "Anyone who owns a house, condo, or freehold in Toronto, homeowners, landlords, snowbirds, people caring for a sick family member, or anyone who inherited property.",
    "Anyone who owns a house, condo, or freehold in Toronto: homeowners, landlords, snowbirds, people caring for a sick family member, or anyone who inherited property.",
    "comma before list should be colon")
add("src/pages/blog/vacant-home-tax.astro",
    "declare it as \"principal residence\", you're not vacant.",
    "declare it as \"principal residence\": you're not vacant.",
    "comma splice")
add("src/pages/blog/vacant-home-tax.astro",
    "Buyers</strong> should do proper due diligence, confirm the declaration was filed, confirm no VHT is outstanding, before signing.",
    "Buyers</strong> should do proper due diligence: confirm the declaration was filed, confirm no VHT is outstanding, before signing.",
    "comma before list should be colon")
add("src/pages/blog/vacant-home-tax.astro",
    "\"I live in my home full-time, I don't need to file.\"",
    "\"I live in my home full-time; I don't need to file.\"",
    "comma splice")
add("src/pages/blog/vacant-home-tax.astro",
    "\"My tenant lived there, surely that's obvious.\"",
    "\"My tenant lived there; surely that's obvious.\"",
    "comma splice")
add("src/pages/blog/vacant-home-tax.astro",
    "\"I was travelling for 8 months, that means it's vacant.\"",
    "\"I was travelling for 8 months; that means it's vacant.\"",
    "comma splice")
add("src/pages/blog/vacant-home-tax.astro",
    "\"The seller filed, that's their problem.\"",
    "\"The seller filed; that's their problem.\"",
    "comma splice")
add("src/pages/blog/vacant-home-tax.astro",
    "\"I own multiple condos, one declaration covers them all.\"",
    "\"I own multiple condos; one declaration covers them all.\"",
    "comma splice")

# hcra-illegal-building.astro
add("src/pages/blog/hcra-illegal-building.astro",
    "\"It's just a small renovation, HCRA doesn't apply.\"",
    "\"It's just a small renovation; HCRA doesn't apply.\"",
    "comma splice")
add("src/pages/blog/hcra-illegal-building.astro",
    "My builder said 'Tarion is expensive, we skipped it'.",
    "My builder said 'Tarion is expensive; we skipped it'.",
    "comma splice")

# oesp.astro
add("src/pages/blog/oesp.astro",
    "\"I won't qualify, I make too much.\"",
    "\"I won't qualify; I make too much.\"",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "\"I'm a renter, I can't apply.\"",
    "\"I'm a renter; I can't apply.\"",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "Eligible households get a direct monthly credit between $35 and $113 right on their electricity bill, for many small or energy-intensive Toronto households on a tight budget, that's close to half the electricity charge.",
    "Eligible households get a direct monthly credit between $35 and $113 right on their electricity bill; for many small or energy-intensive Toronto households on a tight budget, that's close to half the electricity charge.",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "the credit can be <strong>$68–$113 per month</strong>, on a $150 monthly electricity bill, that's around half.",
    "the credit can be <strong>$68–$113 per month</strong>; on a $150 monthly electricity bill, that's around half.",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "the credit jumps to $113/month, that's <strong>$1,356 saved per year</strong>.",
    "the credit jumps to $113/month; that's <strong>$1,356 saved per year</strong>.",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "gets <strong>$68/month</strong> instead of $45/month, that's $276 more per year.",
    "gets <strong>$68/month</strong> instead of $45/month; that's $276 more per year.",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "Check your bill, you should already see \"Ontario Electricity Rebate\" as a negative line item.",
    "Check your bill: you should already see \"Ontario Electricity Rebate\" as a negative line item.",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "Apply via the Save on Energy website. Stack with OESP, they don't conflict.",
    "Apply via the Save on Energy website. Stack with OESP; they don't conflict.",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "Don't ignore it, if you let it lapse, the credit stops and you have to re-apply from scratch.",
    "Don't ignore it: if you let it lapse, the credit stops and you have to re-apply from scratch.",
    "comma splice")
add("src/pages/blog/oesp.astro",
    "If your circumstances change mid-period, household member moves in or out, income drops significantly, you can update the OESP application proactively",
    "If your circumstances change mid-period (household member moves in or out, income drops significantly), you can update the OESP application proactively",
    "damaged parenthetical")
add("src/pages/blog/oesp.astro",
    "Yes you can, as long as the bill is in your name, you're fully eligible.",
    "Yes you can: as long as the bill is in your name, you're fully eligible.",
    "comma splice")

# rent-vs-buy.astro
add("src/pages/blog/rent-vs-buy.astro",
    "Every mortgage payment includes a bit of principal, that's you paying yourself.",
    "Every mortgage payment includes a bit of principal: that's you paying yourself.",
    "comma splice")
add("src/pages/blog/rent-vs-buy.astro",
    "Homeowners can't move that fast, selling is slow and expensive.",
    "Homeowners can't move that fast; selling is slow and expensive.",
    "comma splice")

# fthb-rebate.astro
add("src/pages/blog/fthb-rebate.astro",
    "new construction here often pushes right up against the $1M, $1.5M tier where the math gets interesting.",
    "new construction here often pushes right up against the $1M to $1.5M tier where the math gets interesting.",
    "numeric range comma damage")
add("src/pages/blog/fthb-rebate.astro",
    "<div class=\"heloc-formula-number\">$1M, $1.5M</div>",
    "<div class=\"heloc-formula-number\">$1M to $1.5M</div>",
    "numeric range comma damage")
add("src/pages/blog/fthb-rebate.astro",
    "Don't budget down to the last dollar, leave a small buffer.",
    "Don't budget down to the last dollar; leave a small buffer.",
    "comma splice")
add("src/pages/blog/fthb-rebate.astro",
    "Purchases for investment or rental purposes don't qualify, the rebate is for primary residences only.",
    "Purchases for investment or rental purposes don't qualify: the rebate is for primary residences only.",
    "comma splice")
add("src/pages/blog/fthb-rebate.astro",
    "In Ontario, there's also a separate <strong>Ontario New Housing Rebate</strong> for the provincial 8% portion of HST, that one is unrelated to the FTHB rebate and is available regardless of first-time-buyer status.",
    "In Ontario, there's also a separate <strong>Ontario New Housing Rebate</strong> for the provincial 8% portion of HST. That one is unrelated to the FTHB rebate and is available regardless of first-time-buyer status.",
    "comma splice")
add("src/pages/blog/fthb-rebate.astro",
    "<strong>Path 1, The builder credits the rebate to you at closing.</strong>",
    "<strong>Path 1: The builder credits the rebate to you at closing.</strong>",
    "typo, comma should be colon")
add("src/pages/blog/fthb-rebate.astro",
    "<strong>Path 2, You pay full tax and file for the rebate yourself.</strong>",
    "<strong>Path 2: You pay full tax and file for the rebate yourself.</strong>",
    "typo, comma should be colon")

# first-time-buyer-guide-houses.astro
add("src/pages/blog/first-time-buyer-guide-houses.astro",
    "<strong>Horizontal cracks are serious</strong>, they can mean bowing walls.",
    "<strong>Horizontal cracks are serious</strong>: they can mean bowing walls.",
    "comma splice")
add("src/pages/blog/first-time-buyer-guide-houses.astro",
    "The four below stack, you can use all of them.",
    "The four below stack: you can use all of them.",
    "comma splice")
add("src/pages/blog/first-time-buyer-guide-houses.astro",
    "you can't get it back just because you changed your mind, releasing it requires both sides to agree in writing, or a court order.",
    "you can't get it back just because you changed your mind; releasing it requires both sides to agree in writing, or a court order.",
    "comma splice")

# foreign-buyer-ban.astro
add("src/pages/blog/foreign-buyer-ban.astro",
    "\"My work permit has 4 months left, I'll close before it expires.\"",
    "\"My work permit has 4 months left; I'll close before it expires.\"",
    "comma splice")
add("src/pages/blog/foreign-buyer-ban.astro",
    "\"It's worth the risk, the worst they can do is fine me $10,000.\"",
    "\"It's worth the risk; the worst they can do is fine me $10,000.\"",
    "comma splice")
add("src/pages/blog/foreign-buyer-ban.astro",
    "The financial logic is straightforward, there is no upside to taking the chance.",
    "The financial logic is straightforward: there is no upside to taking the chance.",
    "comma splice")
add("src/pages/blog/foreign-buyer-ban.astro",
    "The earlier 2023 version of this rule required tax filings in 3 of the previous 4 years and meaningful Canadian employment history, those conditions were removed by the March 27, 2023 amendments.",
    "The earlier 2023 version of this rule required tax filings in 3 of the previous 4 years and meaningful Canadian employment history; those conditions were removed by the March 27, 2023 amendments.",
    "comma splice")
add("src/pages/blog/foreign-buyer-ban.astro",
    "Study permit holders are <strong>not</strong> generally covered by this carve-out as of the March 2023 amendments, they were removed from the exempt class.",
    "Study permit holders are <strong>not</strong> generally covered by this carve-out as of the March 2023 amendments; they were removed from the exempt class.",
    "comma splice")

# reverse-mortgage.astro
add("src/pages/blog/reverse-mortgage.astro",
    "If you're under 55, this isn't available to you, see a HELOC or refinance instead.",
    "If you're under 55, this isn't available to you: see a HELOC or refinance instead.",
    "comma splice")
add("src/pages/blog/reverse-mortgage.astro",
    "CHIP and Flex have slightly different eligibility, your realtor or mortgage broker can check.",
    "CHIP and Flex have slightly different eligibility; your realtor or mortgage broker can check.",
    "comma splice")
add("src/pages/blog/reverse-mortgage.astro",
    "This is the big appeal for retirees on fixed income, your pension doesn't have to \"qualify\" you.",
    "This is the big appeal for retirees on fixed income: your pension doesn't have to \"qualify\" you.",
    "comma splice")
add("src/pages/blog/reverse-mortgage.astro",
    "Sometimes the most overlooked option. Releases all the equity, no interest accrues.",
    "Sometimes the most overlooked option. Releases all the equity: no interest accrues.",
    "comma splice")

# for-renters.astro
add("src/pages/for-renters.astro",
    "It's the one whose package leaves no question unanswered, the Landlord reads it once and decides \"yes.\"",
    "It's the one whose package leaves no question unanswered: the Landlord reads it once and decides \"yes.\"",
    "comma splice")
add("src/pages/for-renters.astro",
    "I receive <strong>no commission or referral fee</strong> from any of them, this is a general reference list, not an endorsement.",
    "I receive <strong>no commission or referral fee</strong> from any of them: this is a general reference list, not an endorsement.",
    "comma splice")

# for-landlords.astro
add("src/pages/for-landlords.astro",
    "I add the custom clauses, pets, smoking, subletting, utility cost-sharing, that prevent disputes.",
    "I add the custom clauses (pets, smoking, subletting, utility cost-sharing) that prevent disputes.",
    "damaged parenthetical")

# buyer-guide.astro
add("src/pages/buyer-guide.astro",
    "(not pre-qualification, there's a difference)",
    "(not pre-qualification: there's a difference)",
    "comma splice")

# payment-calculator.astro
add("src/pages/payment-calculator.astro",
    "so the second lender is at higher risk, that is why second mortgages usually charge <strong>higher interest</strong>.",
    "so the second lender is at higher risk; that is why second mortgages usually charge <strong>higher interest</strong>.",
    "comma splice")

# terms.astro
add("src/pages/terms.astro",
    "harvester, or scraper, that is not a general-purpose search-engine indexer",
    "harvester, or scraper that is not a general-purpose search-engine indexer",
    "extraneous comma before restrictive clause")
add("src/pages/terms.astro",
    "those are service <em>targets</em> that Peter works hard to meet, they are not guarantees.",
    "those are service <em>targets</em> that Peter works hard to meet; they are not guarantees.",
    "comma splice")

# ontario-property-taxes-rising.astro
add("src/pages/blog/ontario-property-taxes-rising.astro",
    "The wording and analysis in this post are Peter Law's own summary written for a general reader, they are not a direct quote and should not be treated as one.",
    "The wording and analysis in this post are Peter Law's own summary written for a general reader; they are not a direct quote and should not be treated as one.",
    "comma splice")

# all-calculator.astro
add("src/pages/all-calculator.astro",
    "and heat is $150/mo, the bank uses similar rough numbers for the GDS ratio.",
    "and heat is $150/mo; the bank uses similar rough numbers for the GDS ratio.",
    "comma splice")

# rent-vs-buy-calculator.astro
add("src/pages/rent-vs-buy-calculator.astro",
    "Enter your numbers above, the calculator updates live.",
    "Enter your numbers above: the calculator updates live.",
    "comma splice")

with open('/tmp/fixes_en.json', 'w', encoding='utf-8') as f:
    json.dump(fixes, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(fixes)} fixes")
