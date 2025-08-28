// app/api/refunds/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

type Body = {
  payment_intent?: string | null;
  charge?: string | null;
  charge_id?: string | null;
  amount?: string | number | null; // DKK decimal from form, or cents if JSON
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | string | null;
  notes?: string | null;
};

function toMaybeString(v: FormDataEntryValue | null): string | null {
  return typeof v === 'string' ? v.trim() : null;
}

function parseAmountToCents(v: string | number | null | undefined): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  // Accept numbers or strings; strings may be "10.00" or "10,00"
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return undefined;
  // Convert DKK to øre
  return Math.round(n * 100);
}

async function readFormOrJson(req: Request): Promise<Body> {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const j = (await req.json()) as any;
    return {
      payment_intent: j.payment_intent ?? j.pi ?? null,
      charge: j.charge ?? j.ch ?? null,
      charge_id: j.charge_id ?? null,
      amount: j.amount ?? null,
      reason: j.reason ?? null,
      notes: j.notes ?? null,
    };
  }
  const fd = await req.formData();
  return {
    payment_intent: toMaybeString(fd.get('payment_intent')),
    charge: toMaybeString(fd.get('charge')),
    charge_id: toMaybeString(fd.get('charge_id')), // our form uses charge_id
    amount: toMaybeString(fd.get('amount')),
    reason: toMaybeString(fd.get('reason')),
    notes: toMaybeString(fd.get('notes')),
  };
}

export async function POST(req: Request) {
  try {
    const body = await readFormOrJson(req);
    const payment_intent = body.payment_intent || null;
    const charge = body.charge || body.charge_id || null;
    const amount_cents = parseAmountToCents(body.amount);
    const reason = body.reason || null;
    const notes = body.notes || null;

    if (!payment_intent && !charge) {
      return NextResponse.json(
        { error: 'Provide either payment_intent (pi_…) or charge (ch_…).' },
        { status: 400 }
      );
    }

    const params: Stripe.RefundCreateParams = {
      ...(payment_intent ? { payment_intent } : { charge: charge! }),
      ...(typeof amount_cents === 'number' ? { amount: amount_cents } : {}),
      ...(reason ? { reason: reason as Stripe.RefundCreateParams.Reason } : {}),
      metadata: { source: 'operator', notes: notes ?? '' },
    };

    const refund = await stripe.refunds.create(params);

    const inserted = await sql<{ id: number }>`
      insert into refunds
        (provider_refund_id, status, amount_cents, currency,
         provider_payment_intent_id, provider_charge_id,
         initiated_by, source, created_at)
      values
        (${refund.id},
         ${refund.status ?? 'succeeded'},
         ${refund.amount ?? null},
         ${refund.currency ?? 'dkk'},
         ${payment_intent},
         ${charge},
         'operator',
         'operator',
         now())
      returning id
    `;
    const refundId = inserted[0]?.id;

    await sql`
      insert into refund_events (refund_id, type, created_at)
      values (${refundId}, 'operator_created', now())
    `;

    return NextResponse.redirect(new URL(`/refunds/${refundId}`, req.url), 303);
  } catch (err: any) {
    const message = err?.message || 'Refund creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
