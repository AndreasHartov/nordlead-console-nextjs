NordLead — Authoritative Plan & Runbook

Last updated: 2025-08-23 · Owner: Andreas · App: https://nordlead-console.vercel.app · Repo: https://github.com/AndreasHartov/nordlead-console-nextjs

Purpose: Single source of truth for the business, technical rollout, and day-to-day operations. It’s written so a new chat (or a human) can resume instantly without guessing context.
(Checkpoint links in this file are canonical; if we jointly adopt an improved plan later, the newer decision takes precedence.)

Table of Contents

Business Overview
Market, Positioning, Segments
Working Protocol (How we execute)
Phased Plan (from zero → live)
Commercials (Retainer, CPLs, Refunds, SLA)
Technical Stack & Repo Layout
Stripe Configuration (live)
Deferred: Domain & Support Email (non-blocking)
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
  "current_phase": "Phase 3 — Console Deploy & Tabs (next session)",
  "last_checkpoint": "2.2C/D/E complete; domain nord-lead.dk delegated to Vercel; mailbox deferred; Stripe support email remains trade4@hartov.dk",
  "app_url": "https://nordlead-console.vercel.app",
  "updated_at": "2025-08-23T23:59:59Z"
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
14-day Sprint (one-time
