NordLead — Authoritative Plan & Runbook

Last updated: 2025-08-23 · Owner: Andreas · App: https://nordlead-console.vercel.app
 · Repo: https://github.com/AndreasHartov/nordlead-console-nextjs

Purpose: Single source of truth for the business, technical rollout, and day-to-day operations. It’s written so a new chat (or a human) can resume instantly without guessing context.

Table of Contents

Business Overview

Market, Positioning, Segments

Working Protocol (How we execute)

Phased Plan (from zero → live)

Commercials (Retainer, CPLs, Refunds, SLA)

Technical Stack & Repo Layout

Stripe Configuration (live)

Compliance, VAT, and Company Path (DK)

Operations & KPIs

Risk Controls & Feature Flags

Status Checkpoint

Changelog

Business Overview

Two-sided Danish trades lead marketplace powered by a private operator console (NordLead Console, Next.js on Vercel).

Public side (5 niche sites): capture verified, high-intent demand for: VVS, Elektriker, Tag, Vinduer & Døre, Tømrer.

Operator console: run acquisition, vetting, routing, billing, refunds, VAT/compliance, and ops with yes/no decision gates.

Monetization:

Retainer A (priority & rotation lock): DKK 4,500 / month per contractor.

CPL add-ons (per trade).

14-day onboarding sprint (one-time).

Market, Positioning, Segments

Demand: DK homeowners & SMBs needing urgent or planned works (the 5 trades). Seek fast response, verified pros, clear pricing.
Supply: Small DK contractors wanting predictable, verified leads, transparent pricing, no long phone trees.

Positioning: “Denmark’s no-nonsense trades lead engine. Verified leads. 15-minute response (9–17 CET). Clear pricing. Bad-lead auto-refunds.”

Primary trades: VVS, Elektriker, Tag, Vinduer & Døre, Tømrer.

Working Protocol (How we execute)

We work via Execution Cards: each has a goal, clickable links, and a success check.

Docs live in repo (/docs), not in chat. This file is the authoritative plan.

A tiny status file (/docs/status.json) carries the current phase/step so any new chat can resume within one message.

Never mix static /public/index.html with Next.js pages. The app must have app/layout.tsx + app/page.tsx.

Promises gated by feature flags: we don’t publicly promise anything (e.g., 15-min SLA) until the console proves it for ≥7 days.

All money live in Stripe (Payment Links to start; API later).

All support details (name, email, support URL, descriptors) set in Stripe before scaling spend.

SLA window: 09:00–17:00 CET, Mon–Fri.

Phased Plan (from zero → live)
Phase 0 — Continuity & Control (done or repeatable in minutes)

Downloaded DocuPack (plan + prompts + quick links).

Ensure this file exists: /docs/business-plan.md.

Add /docs/status.json with current phase/step (see template below).

{
  "current_phase": "Phase 2.2 — Stripe support/branding/receipts",
  "last_checkpoint": "Webhook 200 verified; payment links redirected",
  "app_url": "https://nordlead-console.vercel.app",
  "updated_at": "2025-08-23T00:00:00Z"
}

Phase 1 — Company & Payments Readiness

Stripe live + payouts (KYC, bank, payouts schedule).

Register sole proprietorship (enkeltmandsvirksomhed) → await CVR.

MitID Erhverv + Digital Post (after CVR).

(Optional) Business bank + NemKonto mapping.

VAT trigger watch: warn before DKK 50,000 turnover → register for moms.

We follow legal path A+: sole prop now → tax-free conversion to ApS once thresholds & checklist are met.

Phase 2 — Monetization & Stripe Wiring

2.1 Products + Payment Links (live) — ✅ done

Retainer A (DKK 4,500/mo) → Payment Link.

14-day Sprint (one-time) → Payment Link.

CPL products per trade → Payment Links.

Set Success redirect on all links to /success?p=...&cs={CHECKOUT_SESSION_ID}.

2.2 Support/Branding/Receipts (live) — in progress

Public details & support URL → https://dashboard.stripe.com/settings/public

Branding (logo/color) → https://dashboard.stripe.com/settings/branding

Email receipts (success + refunds) → https://dashboard.stripe.com/settings/emails

Notifications (payment & webhook failure alerts) → https://dashboard.stripe.com/settings/notifications

Payout cadence verify → https://dashboard.stripe.com/settings/payouts

2.3 Webhook (live) — ✅ done

Destination: https://nordlead-console.vercel.app/api/stripe-webhook

Events (min): checkout.session.completed, charge.refunded

Env vars (Vercel): STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

Phase 3 — Console Deploy & Tabs

3R Clean deploy on Vercel — ✅ done

Minimal routes working: /, /api/health, /success, /cancel — ✅

Tabs (scaffold first, content later):

Dashboard (KPIs: MRR, CPL by trade, refunds, VAT runway)

Site (public pages mgmt preview)

Plan (Gantt + run buttons)

CRM (lead inbox, partner assignments, refund button)

Finance (revenue, CPL spend, payouts, Dinero export)

Compliance (VAT/CVR/ApS checklists, retention timers)

Ops (SLA monitor 9–17 CET, bad-lead queue, media checks)

ChatOps (command stubs; persistence)

Phase 4 — Public Sites v1 (5 niches)

One landing per trade with: validation (phone/email), geo capture, fast form, optional photo/video, trust badges, transparent pricing & refund policy.

Routing to partners with 15-min SLA inside 9–17 CET window.

Simple calculators/estimators per trade.

Phase 5 — Traffic On

Search campaigns per trade/city (DK), CPL caps tied to approved CPLs.

Retargeting + branded search per niche domain.

B2B partnerships (wholesalers/distributors).

Start small; scale only on cash-positive unit economics.

Phase 6 — Automations & Reporting

Auto-refund rules; proof check workflows; SLA breach alerts.

Weekly dashboards: MRR, CPL by trade, refund %, partner LTV, VAT runway.

Phase 7 — Scale

Add zip codes/kommuner; expand partner base; calculators v2; FAQ/SEO content; new trades if ROI supports.

International (Nordics) once DK playbook is proven.

Commercials (Retainer, CPLs, Refunds, SLA)

Retainer A (priority + rotation): DKK 4,500 / month

Initial launch CPLs (tune with data):

Trade	CPL (DKK)
VVS (Plumber)	250
Elektriker (Electrician)	250
Tømrer (Carpenter)	300
Vinduer & Døre (Windows/Doors)	400
Tag (Roofing)	500

Changing CPLs later creates a new Price ID and usually a new Payment Link in Stripe.

Refund policy (bad-lead auto-refunds):
We refund if any is true: invalid contact, outside area, job doesn’t exist/duplicate, wrong trade category. One-click in CRM with audit trail to Finance.

SLA: 15 minutes response time only within 09:00–17:00 CET, Mon–Fri. SLA monitor drives partner prioritization; breaches trigger deprioritization.

Technical Stack & Repo Layout

Next.js (App Router) on Vercel

Stripe (Payment Links now; Checkout API later)

Optional: Supabase (DB/auth), Plausible (analytics), Postmark/Resend (email), Sentry (errors), Dinero (accounting export)

Repo: https://github.com/AndreasHartov/nordlead-console-nextjs

/app
  layout.tsx
  page.tsx
  /api/health/route.ts
  /success/page.tsx
  /cancel/page.tsx
  /api/stripe-webhook/route.ts
/docs
  business-plan.md  ← authoritative plan (this file)
  status.json       ← checkpoint for resuming
package.json        (includes "stripe")
tsconfig.json
next-env.d.ts

Stripe Configuration (live)

Products & Links: https://dashboard.stripe.com/products
 and https://dashboard.stripe.com/payment-links

Retainer A (DKK 4,500/m), 14-day sprint (one-time), CPLs (one-time per trade).

Success redirect on every link → https://nordlead-console.vercel.app/success?p=...&cs={CHECKOUT_SESSION_ID}

Webhook destination (Live): https://dashboard.stripe.com/webhooks
 → NordLead Console (prod)

Events: checkout.session.completed, charge.refunded (expand later as needed)

Signing secret in Vercel: STRIPE_WEBHOOK_SECRET

Public details & branding:

Public: https://dashboard.stripe.com/settings/public

Branding: https://dashboard.stripe.com/settings/branding

Receipts: https://dashboard.stripe.com/settings/emails

Notifications: https://dashboard.stripe.com/settings/notifications

Payouts: https://dashboard.stripe.com/settings/payouts

Compliance, VAT, and Company Path (DK)

Start: Enkeltmandsvirksomhed (fast, low CAPEX).

VAT watcher: warn well before DKK 50,000 turnover → register for moms.

Conversion: tax-free virksomhedsomdannelse to ApS once criteria are met.

Data & GDPR: lawful basis for validation & optional media; retention timers; privacy notices on all public pages; delete/anonymize scheduled.

Dinero export monthly; choose accrual vs cash and lock in the Compliance tab.

Operations & KPIs

Lead flow: form → validate (address, phone/email, optional media) → score → assign → partner accepts → CPL decrement/charge → refund queue if needed.

Ops alerts: SLA timer start on push; warn at +10m; breach at +15m (within window).

KPIs: MRR, CPL by trade, refund rate, partner LTV, ROAS, VAT runway.

Cadence: daily payouts review; weekly Dinero export; monthly P&L snapshot.

Risk Controls & Feature Flags

Flags:

PROMISE_SLA_15_MIN (off until green ≥7 days)

PROMISE_AUTO_REFUND (on only when 1-click refund works end-to-end)

SHOW_CPL_PUBLIC (on when Stripe amounts finalized & reflected everywhere)

Triggers:

VAT ≥ DKK 50,000 → register moms

Refund rate > 20% / week → tighten validation; QA audit

SLA breaches > 10% / week → partner deprioritization

ROAS below target 7 days → dial back ad spend

Chargebacks > 1% → add friction (confirmations), manual review

Status Checkpoint

Live app: https://nordlead-console.vercel.app

Webhook: destination created; deliveries 200 OK for checkout.session.completed
What’s next: Finish Phase 2.2 (support details, branding, receipts, notifications). Then scaffold console tabs (Phase 3) and build Public Sites v1 (Phase 4).

How to resume in a new chat:
Paste this one-liner as the first message:

Checkpoint: plan at /docs/business-plan.md in https://github.com/AndreasHartov/nordlead-console-nextjs
 — app https://nordlead-console.vercel.app
 — status /docs/status.json — continue from “Phase 2.2”.

Changelog

2025-08-23: Clean Vercel rebuild (App Router). Webhook live (200). Stripe links success redirects set. Retainer fixed at DKK 4,500. SLA window set to 09:00–17:00 CET.
