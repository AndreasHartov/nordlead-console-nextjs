---

## Phase 3 — Refunds v1 (API + CRM + ChatOps) — Checkpoint ✅

**Scope done**
- [x] **Step 3 — Deps + Neon lib**
  - Added `@neondatabase/serverless`
  - `lib/db.ts` minimal Neon client
  - `lib/auth.ts` operator-only guard via `OPERATOR_API_KEY`
- [x] **Step 4 — Refunds API**
  - `POST /api/refunds` (create Stripe refund and persist)
  - `GET /api/refunds` (list), `GET /api/refunds/[id]` (detail)
- [x] **Step 5 — Webhooks**
  - `POST /api/stripe/webhook` handles `refund.updated`, `charge.refunded`, `charge.refund.updated`
  - Persists/updates `refunds` + logs `refund_events (webhook_update)`
- [x] **Step 6 — CRM UI**
  - `/refunds` list and `/refunds/[id]` detail (server-rendered)
  - Local timezone rendering via `components/LocalTime.tsx`

**Operational links**
- App UI (list): <https://nord-lead.dk/refunds>  
- API (list): <https://nord-lead.dk/api/refunds>  
- API (detail): `https://nord-lead.dk/api/refunds/{id}`  
- Webhook endpoint: <https://nord-lead.dk/api/stripe/webhook>  
- Repo root: <https://github.com/AndreasHartov/nordlead-console-nextjs>  
- Vercel envs: <https://vercel.com/dashboard>  
- Stripe Webhooks (test): <https://dashboard.stripe.com/test/webhooks>

**Environment variables (must exist in Preview + Production)**
- `DATABASE_URL` (Neon via Vercel integration)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPERATOR_API_KEY`
- `APP_BASE_URL` (`https://nord-lead.dk`)

**Data model (Neon)**
- `refunds` — core record (provider, ids, status, amount_cents, currency, reason, initiated_by, source, notes, timestamps)
- `refund_events` — append-only event log (refund_id, type, payload, created_at)

**Next up**
- **Step 7 — ChatOps (Slack slash command)**
  - Slack App (test workspace), Slash Command `/refunds`
  - Request URL: `https://nord-lead.dk/api/slack/commands`
  - Env: `SLACK_SIGNING_SECRET`
  - Endpoint file to add: `app/api/slack/commands/route.ts` (responds with search results)

**Acceptance for Phase 3**
- Create refund from API and see it in Stripe + DB ✅
- Webhook updates DB on subsequent Stripe events ✅
- Operator can browse latest refunds and open detail view ✅
- Slack command returns a result for `re_*` or `pi_*` (pending Step 7)

**Notes / Risks**
- Webhook returns 200 even on internal error by design — rely on `refund_events` for diagnostics.
- Make sure envs are present after any environment/region changes; redeploy to pick up.
