# NordLead Console — Business Plan (Single Source of Truth)

**Last updated:** 2025-08-28  
**Owner:** Andreas Hartov  
**Source of truth:** This file and `/docs/status.json`. Newer, jointly-approved decisions supersede older ones.

---

## Quick Links
- **Live app:** https://nord-lead.dk
- **Repo (root):** https://github.com/AndreasHartov/nordlead-console-nextjs
- **This plan (md):** https://github.com/AndreasHartov/nordlead-console-nextjs/blob/main/docs/business-plan.md
- **Execution status (json):** https://github.com/AndreasHartov/nordlead-console-nextjs/blob/main/docs/status.json

---

## Current Status (Today)
- **Phase:** 3 — Refunds v1
- **Step:** 9 — CRM wiring (Finance/CRM refunds table + linkouts)
- **Delivered — Refunds v1 shipped end-to-end:**
  - Operator refund form with **reason + notes**, **source**, **timestamps** (created/updated)
  - Stripe webhook **`charge.refunded` → 200 OK** (idempotent)
  - **Audit trail** persisted across `refunds` + `refund_events`
  - **UI polish:** reason/notes visible; source labeled (operator/webhook/system); timestamps
  - **Neon Postgres:** `refunds` and `refund_events` with sensible defaults (**`initiated_by`**, **`source`**)
  - Changelog and Status updated in repo
- **Ops foundation (Phase 1.5 — Corporate Ops):**
  - **CVR** now live → **MitID Erhverv**, **Digital Post**, **NemKonto**, **business bank** opened/linked

---

## One-liner
Two-sided Danish trades lead marketplace with a private **operator console** (Next.js/Vercel) and niche public sites per trade. Monetization = **DKK 7,500/mo retainers** + **CPL add-ons**. Goal: AI-assisted, near-zero-overhead operations.

---

## Vision & Strategy
- **Operate lean:** Solo-operator leverage via automation + tight CRM/Finance loop.
- **Trust flywheel:** Transparent refunds with evidence (events) → higher retention → compounding LTV.
- **Verticalize:** One trade at a time; reuse playbooks and components; keep infra minimal.

---

## Problem & ICP
- **Problem:** Trades SMBs waste spend on poor leads and slow follow-up. Refunds are opaque and adversarial.
- **ICP:** DK/Nordics SMB trades (plumbers, electricians, roofers, etc.), 3–50 FTE, recurring local demand, owner-led.
- **Pain:** Lead quality variance, attribution mess, refund disputes, multi-tool sprawl, no ground-truth audit.

---

## Value Proposition
- **Higher lead quality** via screening + routing.
- **Refund clarity** with verifiable audit trail and SLA alignment.
- **Single pane of glass** for Finance/CRM + ChatOps.
- **Hands-off ops:** AI assists + automation keep overhead tiny.

---

## Product Surfaces
- **Public sites (per trade):** localized LPs, intake forms, dynamic copy/pricing tests.
- **Operator Console (private):** Finance, CRM, Routing, Refunds, Audit trail, ChatOps utilities.
- **Finance/CRM:** charges, refunds, customers, events; filters + exports; audit timelines.
- **ChatOps (planned):** Slack commands for lookups and actions.

---

## Monetization & Refunds
- **Retainer:** DKK 7,500/month per trade (tiers as clients scale).
- **CPL add-ons:** Metered per *qualified* lead; volume discounts.
- **Refunds:** Operator-initiated or SLA-driven automation. Every state change emits an event; outcomes are consistent and visible.

---

## Tech Stack
- **Frontend:** Next.js (App Router) on **Vercel**
- **DB:** **Neon Postgres**
- **Payments:** **Stripe** (charges, refunds, webhooks)
- **Auth/Ops:** Admin-only console; Slack ChatOps (planned)
- **Infra:** GitHub → Vercel CI/CD; env-vars only; no heavy DevOps

---

## Data Model (Refunds v1)
- **`refunds`**
  - `id` (uuid), `charge_id`, `stripe_refund_id` (nullable until webhook), `amount`, `currency`
  - `status` (`initiated|pending|succeeded|failed|canceled`)
  - `reason` (enum/text), `notes` (text)
  - `source` (`operator|webhook|system`, **default**), `initiated_by` (operator id/email, **default** when known)
  - `created_at`, `updated_at`
- **`refund_events`**
  - `id` (uuid), `refund_id` (fk)
  - `type` (`initiated|webhook|note|status_change|error`)
  - `payload` (jsonb), `actor` (nullable), `source` (defaulted)
  - `created_at`
- **Invariants:** Every user-visible change emits an event. Webhook updates deduped via `stripe_refund_id`/`charge_id` + idempotency key.

---

## API (indicative)
- `POST /api/refunds` — initiate; validate amount; write `refunds` + event; call Stripe.
- `GET /api/refunds?filters…` — list with filters/pagination.
- `GET /api/refunds/:id` — details + joined events (timeline).
- `POST /api/webhooks/stripe` — handle `charge.refunded` → **200 OK**, upsert state, emit event.

---

## UI/UX (Refunds v1 shipped)
- **Form:** amount (optional for partial), required **reason**, optional **notes**; shows **source** + **timestamps**.
- **Timeline:** events in reverse chronological order with badges.
- **Guardrails:** duplicate-submission prevention; show latest Stripe state.

---

## Step 9 Scope — CRM Wiring (Now)
- **Finance/CRM → Refunds table**
  - Columns: `created_at`, `amount`, `status`, `source`, `initiated_by`, `reason` (truncated), **Details** → `/refunds/[id]`
  - **Filters:** status, time range, source, operator, amount range
  - **Linkouts:** Stripe **Payment/Charge**, **Refund**, **Customer**
- **Details page `/refunds/[id]`:** full audit timeline from `refund_events`, inline notes, quick Stripe links.
- **Optional ChatOps:** `/refunds lookup <charge_id|email>` returns summary + deep links.

---

## Operations (Phase 1.5 — Corporate Ops) — **Done**
- **CVR** live (company registered)
- **MitID Erhverv** enrolled (admin access)
- **Digital Post** configured (official comms)
- **NemKonto** linked (state payouts compatibility)
- **Business bank** opened (production payouts & ops)

---

## Security & Compliance
- **PII/finance:** restrict fields; encryption at rest; least-privilege DB roles.
- **Webhooks:** Stripe signature verification; replay protection; idempotency.
- **Auditability:** immutable event log; operator identity on writes.
- **Backups:** Neon PITR + scheduled snapshots.
- **Access:** admin-only console; per-action logging.

---

## Analytics & KPIs
- **North Star:** Net qualified leads delivered.
- **Finance ops:** refund rate %, time-to-resolution, % auto vs operator-initiated.
- **Quality:** dispute rate, SLA compliance, CSat.
- **Growth:** CAC, LTV, payback, ROAS per vertical.

---

## Go-to-Market
- **Wedge:** One trade vertical; lighthouse clients; publish refund transparency.
- **Proof:** Evented refunds + SLAs; case studies → referrals → tiered pricing.
- **Loops:** Content + performance → intake → ops data → public proof → expansion.

---

## Risks & Mitigations
- **Low data quality:** strict intake validation; operator checklists.
- **Refund abuse:** caps, thresholds, anomaly alerts, evidence requirements.
- **Vendor risk:** Stripe/Neon monitoring; exports; fallback procedures.

---

## Roadmap

### Phase 0 — Foundation
- Repo, CI/CD, domains, baseline docs

### Phase 1 — Core Marketplace
- Intake, qualification, routing, billing hooks

### **Phase 1.5 — Corporate Ops (Inserted)**
- CVR live → MitID Erhverv, Digital Post, NemKonto, business bank **(done)**

### Phase 2 — Billing & Branding
- Stripe integration, receipts, brand polish

### Phase 3 — Refunds v1 (Current)
- **Steps 1–8:** form, Stripe, webhook **200 OK**, Neon tables, audit trail, UI polish **(done)**
- **Step 9 (now):** CRM wiring (table, filters, linkouts, details, optional ChatOps)
- Steps 10+: SLA rules, auto-refund heuristics, reporting/exports

### Phase 4 — Growth Systems
- Multi-vertical rollout, performance marketing, sales playbooks

---

## Repo Layout & Links (keep current)

### Current top-level (indicative)
/
├─ app/
├─ docs/
├─ README.md
├─ package.json
└─ tsconfig.json

### Docs
- `/docs/business-plan.md` (this)
- `/docs/status.json` (execution status)

### App routes (Step 9 adds)
app/
├─ finance/
│ └─ refunds/page.tsx # Table + filters + linkouts
└─ refunds/
└─ [id]/page.tsx # Details + timeline

- **Repo root:** https://github.com/AndreasHartov/nordlead-console-nextjs  
- **Business plan:** https://github.com/AndreasHartov/nordlead-console-nextjs/blob/main/docs/business-plan.md  
- **Status:** https://github.com/AndreasHartov/nordlead-console-nextjs/blob/main/docs/status.json  
- **Live app:** https://nord-lead.dk

---

## Operational Playbooks
- **Refund initiation:** Operator checks charge → fills form → submits → event emitted → Stripe API call.
- **Webhook receipt:** Verify signature → idempotent upsert → update `refunds` → emit `refund_events` → **200 OK**.
- **Dispute handling:** Use timeline + notes to justify outcomes; CSV export when needed.

---

## Changelog
- **2025-08-28** — Refunds v1 shipped; webhook `charge.refunded` returns **200 OK**; Neon `refunds` + `refund_events` with defaults; UI reason/notes/source/timestamps; audit trail; **Phase 1.5** Ops added (CVR live → MitID Erhverv, Digital Post, NemKonto, business bank); status advanced to Phase 3 Step 9; links verified.
