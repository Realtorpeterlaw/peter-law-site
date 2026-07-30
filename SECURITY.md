# Security Policy

Thank you for helping keep the realtorpeterlaw.com website secure.

## Reporting a Vulnerability

If you discover a security issue with this website or its underlying
code, please report it privately — **do not open a public GitHub issue**.

**Preferred contact:**
- Email: **Admin@RealtorPeterLaw.com**
- Web form: <https://www.realtorpeterlaw.com/contact>

You can also refer to the machine-readable disclosure info at
<https://www.realtorpeterlaw.com/.well-known/security.txt>.

## What to include

- A short description of the issue and its potential impact
- Steps to reproduce (URLs, headers, or a minimal test case)
- Your contact info so we can follow up

## What to expect

- Acknowledgement within a reasonable timeframe
- Fixes prioritized by severity
- Credit in the release notes if you'd like it

## Scope

- The production website at `https://www.realtorpeterlaw.com`
- Source in this repository (`Realtorpeterlaw/peter-law-site`)

Out of scope: any third-party services this site links to (Formspree,
Beehiiv, Cal.com, Vercel), which each have their own disclosure programs.

## Site architecture (for context)

This is a static Astro site deployed to Vercel. There is no server-side
code, no database, no user accounts, and no user-generated content
rendered on any page. Third-party services handle form submissions
(Formspree), newsletter opt-ins (Beehiiv), and booking (Cal.com).

Security headers (HSTS, CSP, X-Frame-Options, Referrer-Policy,
Permissions-Policy, X-Content-Type-Options, Cross-Origin-Opener-Policy)
are configured in `vercel.json` and enforced on every response.
