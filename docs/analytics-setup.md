# Analytics setup for realtorpeterlaw.com

Everything below is cookieless and stores no personal data: no typed numbers, names, emails or phone numbers are ever sent. Only which action happened, on which page, in which language.

## 1. Turn on the two Vercel dashboards (one-time, 2 minutes)

1. vercel.com, open the project **peter-law-site**.
2. **Analytics** tab: if it shows an Enable button, click it. Page views and all the custom events below start recording from that moment.
3. **Speed Insights** tab: click Enable. Real-visitor loading speed (Core Web Vitals) per page, device and country.

Both have a free tier on the Hobby plan. The Hobby tier keeps about one month of history and a monthly event allowance; if you outgrow it, Web Analytics Plus (paid add-on on Pro) extends retention and lets you break events down by their properties.

## 2. What the site now records

| Event | Fires when | Properties |
|---|---|---|
| `cta_book_call` | Any "Book a viewing call" link | page, button label |
| `cta_whatsapp` | WhatsApp link | page |
| `cta_phone_tap` | tel: link | page |
| `cta_email_tap` | mailto: link | page |
| `cta_primary_click` | Any other primary button | page, label, destination |
| `form_submit_formspree` | Rental questionnaire, apply, home evaluation forms | form id, page |
| `form_submit_newsletter` | Newsletter signup | page |
| `lang_switch` | Visitor switches EN / 中文 / FR from the top bar or menu | from, to, page |
| `theme_toggle` | Dark / light toggle | to, page |
| `calculator_used` | First keystroke in any calculator | calculator, language |
| `calculator_result` | Visitor stops typing for 2.5 s (once per visit) | calculator, verdict colour (green / yellow / red / buy / rent / neutral), language |
| `blog_search` | Search box on the blog index, after typing pauses | search term (40 chars), number of results, language |
| `blog_filter` | Sales / Rent / All chip | filter, language |
| `article_read_end` | Bottom of a blog post reached | post slug, seconds on page, language |
| `file_download` | Any PDF link (N forms, lease) | file name, page |
| `outbound_click` | Any link leaving the site (realtor.ca, social profiles, government sources) | host, page, label |
| `page_not_found` | 404 page shown | requested path, referring site |

Where to look: Analytics tab, **Events** section. Click an event name to break it down by page, country, device, referrer or UTM tag.

## 3. Google Search Console (search phrases, impressions, click rate)

Vercel cannot see what people type into Google. Search Console can, and it is free.

1. Go to search.google.com/search-console and add a **Domain** property: `realtorpeterlaw.com`.
2. Google shows a TXT record. Add it at your DNS provider (where the domain is registered). This verifies all subdomains and both http/https at once. Preferred.
3. Alternative if you cannot edit DNS: choose **URL prefix** `https://www.realtorpeterlaw.com/`, pick the HTML tag method, copy only the code inside `content="..."`, then in Vercel: Settings > Environment Variables > add `PUBLIC_GSC_VERIFICATION` = that code (Production) > Redeploy. The site emits the verification tag automatically.
4. After verification, submit the sitemap: `https://www.realtorpeterlaw.com/sitemap-index.xml`.

Data appears after 2 to 3 days. The **Performance** report shows queries, impressions, clicks and average position per page; the **Pages** report shows anything Google could not index.

## 4. Tagged links for anything you share

Use these instead of the plain URL. Vercel's Analytics tab then shows exactly which channel sent each visitor (Referrers and UTM panels). Change the path after `.com` to point at any page; keep the `?utm_...` part.

| Where you share it | Link to use |
|---|---|
| Instagram bio | `https://www.realtorpeterlaw.com/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Instagram story / post about a calculator | `https://www.realtorpeterlaw.com/all-calculator/?utm_source=instagram&utm_medium=social&utm_campaign=buy-calculator` |
| TikTok bio | `https://www.realtorpeterlaw.com/?utm_source=tiktok&utm_medium=social&utm_campaign=bio` |
| TikTok video about renting | `https://www.realtorpeterlaw.com/for-renters/?utm_source=tiktok&utm_medium=social&utm_campaign=renters` |
| LinkedIn profile | `https://www.realtorpeterlaw.com/about/?utm_source=linkedin&utm_medium=social&utm_campaign=profile` |
| Facebook page | `https://www.realtorpeterlaw.com/?utm_source=facebook&utm_medium=social&utm_campaign=page` |
| WhatsApp broadcast (new listing) | `https://www.realtorpeterlaw.com/past-deals/?utm_source=whatsapp&utm_medium=message&utm_campaign=broadcast` |
| WhatsApp reply to a lead (calculator) | `https://www.realtorpeterlaw.com/rental-calculator/?utm_source=whatsapp&utm_medium=message&utm_campaign=lead-reply` |
| Business card QR code | `https://www.realtorpeterlaw.com/?utm_source=business-card&utm_medium=print&utm_campaign=qr` |
| Open-house sign / flyer QR | `https://www.realtorpeterlaw.com/free-home-evaluation/?utm_source=flyer&utm_medium=print&utm_campaign=open-house` |
| Email signature | `https://www.realtorpeterlaw.com/?utm_source=email-signature&utm_medium=email&utm_campaign=signature` |
| Newsletter (beehiiv) link to a blog post | `https://www.realtorpeterlaw.com/blog/?utm_source=newsletter&utm_medium=email&utm_campaign=monthly` |
| Google Business Profile website link | `https://www.realtorpeterlaw.com/?utm_source=google-business&utm_medium=organic&utm_campaign=gbp` |
| Chinese community groups (WeChat, RedNote) | `https://www.realtorpeterlaw.com/chinese/?utm_source=wechat&utm_medium=social&utm_campaign=chinese` |
| French community groups | `https://www.realtorpeterlaw.com/french/?utm_source=facebook&utm_medium=social&utm_campaign=french` |

Rules of thumb: `utm_source` = the platform, `utm_medium` = social / message / print / email, `utm_campaign` = the specific post or placement. Lowercase, no spaces. Never put UTM tags on links inside the website itself.

## 5. Already available with no setup

- **Vercel > Observability** tab: every request, status code and path. Filter status = 404 to see broken links people hit, and where from.
- **Formspree dashboard**: every questionnaire submission with timestamps.
- **beehiiv**: newsletter subscribers, opens, clicks.
- **cal.com**: bookings and no-shows.
