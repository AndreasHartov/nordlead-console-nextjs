// app/api/refunds/route.ts
// FULL FILE — do not trim.

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
// from app/api/refunds/ → root → lib
import { sql } from "../../../lib/db";
import { authGuard } from "../../../lib/auth";

export const dynamic = "force-dynamic";

// stripe@14 type defs expect "2023-10-16"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

type RefundRow = {
  id: string;
  provider: string;
  provider_refund_id: string | null;
  provider_payment_intent_id: string | null;
  provider_charge_id: string | null;
  status: string;
  amount_cents: number;
  currency: string;
  reason: string | null;
  initiated_by: string;
  customer_id: string | null;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function POST(req: NextRequest) {
  const user = await authGuard("operator");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const inserted = (
      await sql<RefundRow>`
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
      `
    )[0];

    await sql`
      insert into refund_events (refund_id, type, payload)
      values (${inserted.id}, 'created', ${JSON.stringify(refund)})
    `;

    return NextResponse.json({ refund: inserted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Refund creation failed" },
      { status:
