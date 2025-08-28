# NordLead — Authoritative Plan & Runbook

**Last updated:** 2025-08-28  
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

### Phase 0 — Continuity & Control (repeatable fast)
- Downloaded DocuPack (plan + prompts + quick links).
- Ensure this file exists: `/docs/business-plan.md`.
- Add `/docs/status.json` with current phase/step (template below).

### Phase 1 — Company & Payments Readiness
**Status:** CVR (CBR) **published/approved** ✅

1. **Stripe live + payouts** (KYC, bank, payouts schedule) — ✅
2. **Post-CVR ops (unblocked now)** — _Recommended order_:
   - **MitID Erhverv** + enroll **Digital Post**.
   - **NemKonto mapping** (business bank); open **business bank** account if not already.
   - **Payouts cadence** recheck in Stripe (monthly/weekly).
   - **VAT posture:** watch to DKK 50k threshold; if earlier registration brings benefits, **register VAT now**.
3. Legal path A+: sole prop now → tax-free conversion to ApS once thresholds & checklist are met.

> **Note:** With CVR live, Phase 1 tasks can run **in parallel** with Phase 3 development. No blocking items remain.

### Phase 2 — Monetization & Stripe Wiring
**2.1 Products + Payment Links (live) — ✅**  
Retainer A (DKK 4,500/m), 14-day Sprint (one-time), CPL products per trade — with success redirect to `/success?p=...&cs={CHECKOUT_SESSION_ID}`.

**2.2 Support/Branding/Receipts (live) — ✅**  
Public details, branding, email receipts, alerts, payouts cadence verified.

**2.3 Webhook (live) — ✅**  
Destination: `https://nordlead-console.vercel.app/api/stripe-webhook` (prod).  
Events (min): `checkout.session.completed`, `charge.refunded`.  
Env vars (Vercel): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### Phase 3 — Console Deploy, Domain, Tabs
**Domain & Deploy — ✅**  
- **Domain:** `nord-lead.dk` (hyphen). **www → 308 → apex** verified.
- Nameservers: **Vercel**; DNS propagation confirmed.
- Support email remains **trade4@hartov.dk** for now. **support@nordlead.dk** queued for workspace cutover.

**Tabs (live)**
- **Dashboard v1** (MRR placeholder, CPL by trade, refunds placeholder, VAT runway) — live.
- **Site** (public pages mgmt preview) — live (placeholder).
- **Plan v0** (Gantt + run buttons) — live.
- **CRM v0.1** (inbox + partner assignment + refund queue CSV) — live.
- **Finance v0.2** (payouts + `/api/finance/payouts`, balance & schedule cards; refunds surfacing in progress) — live.
- **Compliance v0** (VAT watcher, payout schedule, checklist) — live.
- **Ops v0** (SLA monitor placeholders; 09–17 CET) — live.
- **ChatOps v1** — Slack slash command **live** (tested 200s).

**Refunds v1 — Shipped ✅**  
- Operator form: `/refunds/new` (supports `pi_` or `ch_`, optional partial amount, reason, notes).  
- API: `/api/refunds` with Stripe create & Neon persistence.  
- DB: `refunds` (`source`, `reason`, `notes`, `initiated_by` non-null default `'operator'`); `refund_events` (`operator_created`, `webhook_update` w/ payload).  
- Webhook: `charge.refunded` → event trail `webhook_update`.  
- UI: Refund list & detail pages render event trail; JSON payload captured for webhook updates.  
- Small polish: payload/notes persistence & detail page formatting.

**Next execution card (when resuming):**  
**Phase 3 — CRM wiring** (Finance/CRM integration for refunds)
- Link refunds into **Finance** and **CRM** tabs (list + detail link-out).
- Add **“Refund this charge”** quick action in CRM (prefill PI/Charge, carry reason/notes).
- Surface refund status badges, partial/full indicator, and operator vs webhook source.

---

## Commercials (Retainer, CPLs, Refunds, SLA)
- **Retainer A** (priority + rotation): **DKK 4,500 / month**
- **Initial CPLs** (adjust with data):

| Trade | CPL (DKK) |
| --- | ---: |
| VVS (Plumber) | 250 |
| Elektriker (Electrician) | 250 |
| Tømrer (Carpenter) | 300 |
| Vinduer & Døre (Windows/Doors) | 400 |
| Tag (Roofing) | 500 |

**Refund policy (bad-lead auto-refunds):**  
Refund if any is true: invalid contact, outside area, job doesn’t exist/duplicate, wrong trade category. One-click in CRM with audit trail to Finance.

**SLA:** 15 minutes response time only within **09:00–17:00 CET, Mon–Fri**.

---

## Technical Stack & Repo Layout
- **Next.js (App Router)** on Vercel  
- **Stripe** (Payment Links now; API live for refunds)  
- Optional: **Supabase**, **Plausible**, **Postmark/Resend**, **Sentry**, **Dinero**

**Repo:** https://github.com/AndreasHartov/nordlead-console-nextjs

