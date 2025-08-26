// app/api/refunds/route.ts
// FULL FILE — do not trim.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
// from app/api/refunds/ → root → lib
import { sql } from "../../../lib/db";
import { authGuard } from "../../../lib/auth";

export const dynamic = "force-dynamic";

// stripe@14 types align with this version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const user = await authGuard();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    payment_intent_id,
    charge_id,
    amount_cents,
    reason,
    notes,
  }: {
    payment_intent_id?: string;
    charge_id?: string;
    amount_cents?: number;
    reason?: string;
    notes?: string;
  } = body ?? {};

  if (!payment_intent_id && !charge_id) {
    return NextResponse.json(
      { error: "Provide payment_intent_id or charge_id" },
      { status: 400 }
    );
  }

  try {
    const params: Stripe.RefundCreateParams = {};
    if (payment_intent_id) params.payment_intent = payment_intent_id;
    if (charge_id) params.charge = charge_id;
    if (amount_cents) params.amount = amount_cents;
    if (reason) params.reason = reason as any;

    const refund = await stripe.refunds.create(params);

    const rows = await sql`
      insert into refunds (
        provider, provider_refund_id, provider_payment_intent_id, provider_charge_id,
        status, amount_cents, currency, reason, initiated_by, source, notes
      ) values (
        'stripe', ${refund.id},
        ${refund.payment_intent ?? null},
        ${refund.charge ?? null},
        ${refund.status ?? 'pending'},
        ${refund.amount ?? amount_cents ?? 0},
        ${String(refund.currency ?? 'dkk').toLowerCase()},
        ${refund.reason ?? reason ?? null},
        ${user.id},
        'console',
        ${notes ?? null}
      )
      returning *
    `;
    const inserted = rows[0];

    await sql`
      insert into refund_events (refund_id, type, payload)
      values (${inserted.id}, 'created', ${JSON.stringify(refund)})
    `;

    return NextResponse.json({ refund: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Refund creation failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await authGuard();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 200)
    : 50;

  const rows = await sql`
    select * from refunds
    order by created_at desc
    limit ${limit}
  `;

  return NextResponse.json({ refunds: rows });
}
