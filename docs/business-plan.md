# NordLead — Authoritative Plan & Runbook

**Last updated:** 2025-08-25  
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

### Phase 3 — Console Deploy, Domain, Tabs
**Domain & Deploy — ✅ done**
- **Domain:** `nord-lead.dk` (note hyphen). **www → 308 → apex** verified.
- Nameservers: **Vercel**; DNS propagation confirmed.
- Support email remains **trade4@hartov.dk** for now. **support@nordlead.dk** + workspace/mailbox is deferred (non-blocking) and scheduled when we launch the public site + switch Stripe support email.

**Tabs (live)**
- **Dashboard v1** (MRR placeholder, CPL by trade, refunds placeholder, VAT runway) — live.
- **Site** (public pages mgmt preview) — live (placeholder).
- **Plan v0** (Gantt + run buttons) — live.
- **CRM v0.1** (inbox + partner assignment + refund queue CSV) — live.
- **Finance v0.1** (payouts + `/api/finance/payouts`, balance & schedule cards) — live.
- **Compliance v0** (VAT watcher, payout schedule, checklist) — live.
- **Ops v0** (SLA monitor placeholders; 09–17 CET) — live.
- **ChatOps v0** (deterministic commands: `/help`, `/health`, `/payouts`) — live.

**Next execution card (paused):**  
**Phase 3 — Refunds v1** (API + CRM form + ChatOps) — *not started (parked at checkpoint)*.

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
- **Stripe** (Payment Links now; API later)  
- Optional: **Supabase**, **Plausible**, **Postmark/Resend**, **Sentry**, **Dinero**

**Repo:** https://github.com/AndreasHartov/nordlead-console-nextjs

    /app
      layout.tsx
      page.tsx
      /api/health/route.ts
      /success/page.tsx
      /cancel/page.tsx
      /api/stripe-webhook/route.ts
      /api/finance/payouts/route.ts
      (next: /api/finance/refunds/route.ts)
      /crm/page.tsx
      /finance/page.tsx
      /compliance/page.tsx
      /ops/page.tsx
      /chatops/page.tsx
      /api/chatops/route.ts
    /components
      FinanceBalance.tsx
      FinancePayoutSchedule.tsx
      FinancePayouts.tsx
      VATWatcher.tsx
      ComplianceChecklist.tsx
      CRMInbox.tsx
      CRMPartners.tsx
      CRMAssigned.tsx
      ChatOpsConsole.tsx
    /docs
      business-plan.md
      status.json

---

## Stripe Configuration (live)
- Products & Links: `dashboard.stripe.com/products`, `dashboard.stripe.com/payment-links`
- Success redirect on every link → `https://nord-lead.dk/success?p=...&cs={CHECKOUT_SESSION_ID}`
- Webhook destination (Live): `dashboard.stripe.com/webhooks` → NordLead Console (prod)
- Events: `checkout.session.completed`, `charge.refunded` (expand later)
- Signing secret in Vercel: `STRIPE_WEBHOOK_SECRET`
- Public details & branding:
  - Public: `dashboard.stripe.com/settings/public`
  - Branding: `dashboard.stripe.com/settings/branding`
  - Receipts: `dashboard.stripe.com/settings/emails`
  - Notifications: `dashboard.stripe.com/settings/notifications`
  - Payouts: `dashboard.stripe.com/settings/payouts`

---

## Compliance, VAT, and Company Path (DK)
- Start: **Enkeltmandsvirksomhed** (fast, low CAPEX).
- VAT watcher: warn well before DKK 50,000 turnover → register for moms.
- Conversion: tax-free **virksomhedsomdannelse** to ApS when criteria met.
- GDPR: lawful basis for validation & optional media; retention timers; privacy notices; delete/anonymize schedule.
- Dinero export monthly.

---

## Operations & KPIs
- Lead flow: form → validate → score → assign → partner accepts → CPL decrement/charge → refund queue if needed.
- Ops alerts: SLA timer start on push; warn at +10m; breach at +15m (within window).
- KPIs: MRR, CPL by trade, refund rate, partner LTV, ROAS, VAT runway.
- Cadence: daily payouts review; weekly Dinero export; monthly P&L snapshot.

---

## Risk Controls & Feature Flags
**Flags**
- `PROMISE_SLA_15_MIN` (off until green ≥7 days)
- `PROMISE_AUTO_REFUND` (on only when end-to-end works)
- `SHOW_CPL_PUBLIC` (on when Stripe amounts finalized)

**Triggers**
- VAT ≥ 50,000 DKK → register moms
- Refund rate > 20% / week → tighten validation; QA
- SLA breaches > 10% / week → partner deprioritization
- ROAS < target 7 days → dial back ad spend
- Chargebacks > 1% → add friction; manual review

---

## Status Checkpoint
**Live app:** https://nord-lead.dk  
**Domains:** apex valid; **www → 308 → apex**.  
**Webhook:** deliveries 200 OK for `checkout.session.completed`.  
**What’s next:** **Phase 3 — Refunds v1** (API + CRM form + ChatOps).  
- Add `POST /api/finance/refunds`  
- Wire CRM Refund form  
- Add ChatOps command `/refund ch_… [amount_ø]` (amount optional)

---

## How to resume in a new chat
Paste this one-liner as the **first message**:
    Checkpoint: plan at /docs/business-plan.md in https://github.com/AndreasHartov/nordlead-console-nextjs — app https://nord-lead.dk — status /docs/status.json — continue from “Phase 3 — Refunds v1 (API + CRM + ChatOps)”.
