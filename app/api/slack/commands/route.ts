// app/api/slack/commands/route.ts
// FULL FILE — Slack slash command handler for /refunds
// Verifies Slack signature and returns an ephemeral text result.
// Supports queries by Stripe refund id (re_*), PaymentIntent id (pi_*), or our internal UUID.
//
// Env:
//   - SLACK_SIGNING_SECRET
//   - DATABASE_URL (Neon via Vercel integration)
//   - APP_BASE_URL (e.g., https://nord-lead.dk)

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RefundRow = {
  id: string;
  provider_refund_id: string | null;
  provider_payment_intent_id: string | null;
  provider_charge_id: string | null;
  status: string;
  amount_cents: number;
  currency: string;
  created_at: string;
};

function bad(status: number, msg: string) {
  return NextResponse.json({ error: msg }, { status });
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function verifySlackSignature(req: NextRequest, raw: string): Promise<boolean> {
  const ts = req.headers.get("x-slack-request-timestamp");
  const sig = req.headers.get("x-slack-signature");
  if (!ts || !sig) return false;

  // Replay protection (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  const drift = Math.abs(now - Number(ts));
  if (!Number.isFinite(drift) || drift > 60 * 5) return false;

  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return false;

  const base = `v0:${ts}:${raw}`;
  const hmac = crypto.createHmac("sha256", secret).update(base, "utf8").digest("hex");
  const expected = `v0=${hmac}`;

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

function fmtAmount(cents: number | null | undefined, currency: string | null | undefined) {
  const cur = (currency ?? "dkk").toUpperCase();
  const val = (Number(cents ?? 0) / 100).toFixed(2);
  return `${val} ${cur}`;
}

function link(base: string, id: string) {
  return `${base}/refunds/${id}`;
}

async function searchRefund(q: string): Promise<RefundRow | null> {
  if (q.startsWith("re_")) {
    const rows = await sql<RefundRow>`
      select id, provider_refund_id, provider_payment_intent_id, provider_charge_id,
             status, amount_cents, currency, created_at
      from refunds
      where provider = 'stripe' and provider_refund_id = ${q}
      order by created_at desc
      limit 1
    `;
    return rows[0] ?? null;
  }
  if (q.startsWith("pi_")) {
    const rows = await sql<RefundRow>`
      select id, provider_refund_id, provider_payment_intent_id, provider_charge_id,
             status, amount_cents, currency, created_at
      from refunds
      where provider = 'stripe' and provider_payment_intent_id = ${q}
      order by created_at desc
      limit 1
    `;
    return rows[0] ?? null;
  }
  if (isUuid(q)) {
    const rows = await sql<RefundRow>`
      select id, provider_refund_id, provider_payment_intent_id, provider_charge_id,
             status, amount_cents, currency, created_at
      from refunds
      where id = ${q}
      limit 1
    `;
    return rows[0] ?? null;
  }
  const rows = await sql<RefundRow>`
    select id, provider_refund_id, provider_payment_intent_id, provider_charge_id,
           status, amount_cents, currency, created_at
    from refunds
    where provider = 'stripe' and (
      provider_refund_id like ${q + "%"} or
      provider_payment_intent_id like ${q + "%"}
    )
    order by created_at desc
    limit 1
  `;
  return rows[0] ?? null;
}

function slackText(msg: string) {
  return NextResponse.json({ response_type: "ephemeral", text: msg });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  const ok = await verifySlackSignature(req, raw);
  if (!ok) return bad(401, "Invalid Slack signature");

  const form = new URLSearchParams(raw);
  const text = (form.get("text") ?? "").trim();

  if (!text) {
    return slackText(
      "Usage: `/refunds re_…` or `/refunds pi_…` or `/refunds <uuid>`\n" +
      "Examples:\n" +
      "• /refunds re_123…  (Stripe refund id)\n" +
      "• /refunds pi_123…  (Stripe PaymentIntent id)\n" +
      "• /refunds 2f1c…    (NordLead refund UUID)"
    );
  }

  try {
    const row = await searchRefund(text);
    if (!row) return slackText(`No refund found for: \`${text}\``);

    const base = process.env.APP_BASE_URL ?? "https://nord-lead.dk";
    const url = link(base, row.id);
    const amount = fmtAmount(row.amount_cents, row.currency);

    const lines = [
      `*Refund* ${row.id}`,
      `• Status: *${row.status}*`,
      `• Amount: *${amount}*`,
      row.provider_refund_id ? `• Stripe refund: \`${row.provider_refund_id}\`` : "",
      row.provider_payment_intent_id ? `• PaymentIntent: \`${row.provider_payment_intent_id}\`` : "",
      row.provider_charge_id ? `• Charge: \`${row.provider_charge_id}\`` : "",
      `• Link: ${url}`
    ].filter(Boolean);

    return slackText(lines.join("\n"));
  } catch (err: any) {
    return slackText(`Error: ${err?.message ?? "unknown"}`);
  }
}
