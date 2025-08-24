# NordLead — Authoritative Plan & Runbook

**Last updated:** 2025-08-24  
**Owner:** Andreas  
**App:** https://nord-lead.dk  
**Repo:** https://github.com/AndreasHartov/nordlead-console-nextjs

**Purpose:** Single source of truth for the business, technical rollout, and day-to-day operations. It’s written so a new chat (or a human) can resume instantly without guessing context.

---

## Table of Contents
- Business Overview
- Market, Positioning, Segments
- Working Protocol (How we execute)
- Phased Plan (from zero → live)
- Commercials (Retainer, CPLs, Refunds, SLA)
- Technical Stack & Repo Layout
- Stripe Configuration (live)
- Compliance, VAT, and Company Path (DK)
- Operations & KPIs
- Risk Controls & Feature Flags
- Status Checkpoint
- Changelog
- How to Resume (one-liner)

---

## Business Overview
Two-sided Danish trades lead marketplace powered by a private operator console (NordLead Console, Next.js on Vercel).

**Public side (5 niche sites):** capture verified, high-intent demand for: VVS, Elektriker, Tag, Vinduer & Døre, Tømrer.  
**Operator console:** run acquisition, vetting, routing, billing, refunds, VAT/compliance, and ops with yes/no decision gates.

**Monetization**
- Retainer A (priority & rotation lock): **DKK 4,500 / month** per contractor.
- CPL add-ons (per trade).
- 14-day onboarding sprint (one-time).

---

## Market, Positioning, Segments
- **Demand:** DK homeowners & SMBs needing urgent or planned works (the 5 trades). Seek fast response, verified pros, clear pricing.
- **Supply:** Small DK contractors wanting predictable, verified leads, transparent pricing, no long phone trees.
- **Positioning:** “Denmark’s no-nonsense trades lead engine. Verified leads. 15-minute response (9–17 CET). Clear pricing. Bad-lead auto-refunds.”
- **Primary trades:** VVS, Elektriker, Tag, Vinduer & Døre, Tømrer.

---

## Working Protocol (How we execute)
- We work via **Execution Cards**: each has a goal, clickable links, and a success check.
- Docs live in repo (`/docs`), not in chat. **This file** is the authoritative plan.
- A tiny status file (`/docs/status.json`) carries the current phase/step so any new chat can resume within one message.
- Never mix static `/public/index.html` with Next.js pages. The app must have `app/layout.tsx` + `app/page.tsx`.
- Promises gated by **feature flags**: we don’t publicly promise anything (e.g., 15-min SLA) until the console proves it for ≥7 days.
- All money live in Stripe (Payment Links to start; API later).
- All support details (name, email, support URL, descriptors) set in Stripe before scaling spend.
- SLA window: **09:00–17:00 CET, Mon–Fri**.

---

## Phased Plan (from zero → live)

### Phase 0 — Continuity & Control (done or repeatable in minutes)
- Downloaded DocuPack (plan + prompts + quick links).
- Ensure this file exists: `/docs/business-plan.md`.
- Add `/docs/status.json` with current phase/step (template below).

### Phase 1 — Company & Payments Readiness
- Stripe live + payouts (KYC, bank, payouts schedule).
- Register **enkeltmandsvirksomhed** → await CVR.
- MitID Erhverv + Digital Post (after CVR).
- (Optional) Business bank + NemKonto mapping.
- VAT trigger watch: warn before DKK 50,000 turnover → register for moms.
- Legal path A+: sole prop now → tax-free conversion to ApS once thresholds & checklist are met.

### Phase 2 — Monetization & Stripe Wiring
**2.1 Products + Payment Links (live) — ✅ done**
- Retainer A (DKK 4,500/m) → Payment Link.
- 14-day Sprint (one-time) → Payment Link.
- CPL products per trade → Payment Links.
- Set Success redirect on all links to `/success?p=...&cs={CHECKOUT_SESSION_ID}`.

**2.2 Support/Branding/Receipts (live) — ✅ done**
- Public details & support URL: `dashboard.stripe.com/settings/public`
- Branding (logo/color): `dashboard.stripe.com/settings/branding`
- Email receipts (success + refunds): `dashboard.stripe.com/settings/emails`
- Notifications (payment & webhook failure alerts): `dashboard.stripe.com/settings/notifications`
- Payout cadence verify: `dashboard.stripe.com/settings/payouts`

**2.3 Webhook (live) — ✅ done**
- Destination: `https://nordlead-console.vercel.app/api/stripe-webhook`
- Events (min): `checkout.session.completed`, `charge.refunded`
- Env vars (Vercel): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### Phase 3 — Console Deploy & Tabs
**Domain & Deploy — ✅ done**
- **Domain:** `nord-lead.dk` (note the hyphen). **www** → apex 308 verified.
- Nameservers: **Vercel**; DNS propagation confirmed.
- Support email stays **trade4@hartov.dk** for now (defer **support@nord-lead.dk** until workspace/mailbox creation).

**Tabs (scaffold) — ✅**
- **Dashboard v1** (KPIs: MRR, CPL by trade, refunds placeholder, VAT runway) — live.
- **Site** (public pages mgmt preview) — live (placeholder).
- **Plan v0** (Gantt + run buttons) — live.
- **CRM v0.1** (inbox + refund queue export, now includes basic Refund form placeholder) — live.
- **Finance v0.1** (payouts view + `/api/finance/payouts`) — live.
- **Compliance v0** (VAT/CVR/ApS checklists) — live.
- **Ops v0** (SLA monitor placeholders; 09–17 CET) — live.
- **ChatOps v0** (commands: `/help`, `/ping`, `/health`, `/payouts`) — live.

**Next execution card (paused at checkpoint):**  
**Phase 3 — Refunds v1 (API + CRM form + ChatOps)**

---

## Commercials (Retainer, CPLs, Refunds, SLA)
- **Retainer A** (priority + rotation): **DKK 4,500 / month**
- **Initial launch CPLs** (tune with data):

| Trade | CPL (DKK) |
| --- | ---: |
| VVS (Plumber) | 250 |
| Elektriker (Electrician) | 250 |
| Tømrer (Carpenter) | 300 |
| Vinduer & Døre (Windows/Doors) | 400 |
| Tag (Roofing) | 500 |

Changing CPLs later creates a new Price ID and usually a new Payment Link in Stripe.

**Refund policy (bad-lead auto-refunds):**  
Refund if any is true: invalid contact, outside area, job doesn’t exist/duplicate, wrong trade category. One-click in CRM with audit trail to Finance.

**SLA:** 15 minutes response time only within **09:00–17:00 CET, Mon–Fri**. SLA monitor drives partner prioritization; breaches trigger deprioritization.

---

## Technical Stack & Repo Layout
- **Next.js (App Router)** on Vercel
- **Stripe** (Payment Links now; Checkout API later)
- Optional: **Supabase** (DB/auth), **Plausible** (analytics), **Postmark/Resend** (email), **Sentry** (errors), **Dinero** (accounting export)

**Repo:** https://github.com/AndreasHartov/nordlead-console-nextjs
