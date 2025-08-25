# NordLead Console — Business Plan

## CHANGELOG
- **2025-08-25** — Checkpoint while in **Phase 3 — Refunds v1**: Step 2 completed (Neon DB linked and schema created). Next session resumes at Step 3 (deps + lib) using full-file replacements.
- **2025-08-25** — Phase 3 execution card active (API + CRM + ChatOps). Links and steps are in the working chat; files here track progress and the resume checklist.

---

## Current Phase
**Phase 3 — Refunds v1 (API + CRM + ChatOps)**  
Goal: internal operators can create and track Stripe refunds from Console (and later Slack), with webhooks keeping state in sync.

### Scope (v1)
- DB tables: `refunds`, `refund_events`
- API routes: create/list/detail refunds
- Stripe webhook: `refund.updated`, `charge.refunded`, `charge.refund.updated`
- CRM UI: simple list + detail
- ChatOps: `/refund` skeleton after API/webhook
- Auth: operator header (`x-operator-key`) for protected routes

### Out of Scope (v1)
- Multi-PSP abstraction, multi-currency FX, complex subscription proration beyond Stripe defaults

---

## Status — 2025-08-25
- ✅ **DB created & linked (Neon via Vercel)** — `DATABASE_URL` injected
- ✅ **Schema created** — `refunds`, `refund_events`
- ✅ **App reachable** — https://nord-lead.dk
- ⏭️ **Next up (Step 3)** — full-file replacements:
  1. `package.json` — add `@neondatabase/serverless` and `stripe`
  2. `lib/db.ts` — Neon SQL client
  3. `lib/auth.ts` — operator guard

---

## Resume Checklist (next session)
We will start by taking your **exact `package.json`** and producing a **full-file replacement** with only the required dependency additions.

**How to get `package.json` (clickable paths):**
- View the file: https://github.com/AndreasHartov/nordlead-console-nextjs/blob/main/package.json  
- Edit view (if you want to copy quickly): https://github.com/AndreasHartov/nordlead-console-nextjs/edit/main/package.json  
- Raw (clean copy): https://raw.githubusercontent.com/AndreasHartov/nordlead-console-nextjs/main/package.json  
- Optional ZIP of the repo (if needed): https://github.com/AndreasHartov/nordlead-console-nextjs/archive/refs/heads/main.zip

**What you’ll do:** open one of the links above, copy the **entire file content**, and paste it into the chat.  
**What we’ll do:** return a **full-file `package.json`** that preserves your scripts and adds only:
- `"@neondatabase/serverless"` (Neon driver)
- `"stripe"`

Then we proceed with full-file adds for:
- `lib/db.ts` and `lib/auth.ts`
- `app/api/refunds/route.ts`
- `app/api/refunds/[id]/route.ts`
- `app/api/stripe/webhook/route.ts`

---

## Links (for operators)
- App: https://nord-lead.dk  
- Vercel project dashboard: https://vercel.com/dashboard (select **nordlead-console** → Settings → Environment Variables)  
- Vercel deployments: https://vercel.com/dashboard/deployments  
- Vercel Storage (DB list): https://vercel.com/dashboard/storage (open **nordlead-console** DB → **Open in Neon**)  
- Stripe (Test mode):  
  - API keys: https://dashboard.stripe.com/test/apikeys  
  - Webhooks: https://dashboard.stripe.com/test/webhooks  
  - Payments: https://dashboard.stripe.com/test/payments

---

## Acceptance Criteria (v1)
- Create full and partial refunds against Stripe test payments via API
- Webhooks update refund status to `succeeded`/`failed`
- Refund visible in CRM list/detail with event trail
- ChatOps skeleton responds and can trigger a refund (after API/webhook are live)
