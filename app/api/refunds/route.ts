// app/api/refunds/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
// Use a relative import to avoid alias resolution issues in Vercel
import { sql, first } from '../../../lib/db';

type RefundRow = { id: string };

function parseAmountToCents(v?: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v.toString().replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n * 100);
}

async function readPayload(req: Request) {
  // Support HTML form posts and JSON
  try {
    const fd = await req.formData();
    return {
      payment_intent:
        (fd.get('payment_intent') || fd.get('pi') || fd.get('pi_id'))?.toString(),
      charge: (fd.get('charge') || fd.get('ch'))?.toString(),
      amount: fd.get('amount')?.toString(),
      reason: fd.get('reason')?.toString(),
      notes: fd.get('notes')?.toString(),
    };
  } catch {
    try {
      const j = await req.json();
      return {
        payment_intent: j.payment_intent || j.pi || j.pi_id,
        charge: j.charge || j.ch,
        amount: j.amount,
        reason: j.reason,
        notes: j.notes,
      };
    } catch {
      return {};
    }
  }
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
  }

  const { payment_intent, charge, amount, reason, notes } = await readPayload(req);

  if (!payment_intent && !charge) {
    return NextResponse.json(
      { error: 'Provide either payment_intent (pi_…) or charge (ch_…).' },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const params: Stripe.RefundCreateParams = {};
  if (payment_intent) params.payment_intent = payment_intent;
  if (charge) params.charge = charge;

  const amountCents = parseAmountToCents(amount);
  if (amountCents) params.amount = amountCents;
  if (reason) params.reason = reason as Stripe.RefundCreateParams.Reason;

  let refund: Stripe.Response<Stripe.Refund>;
  try {
    refund = await stripe.refunds.create(params);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Stripe refund failed' },
      { status: 400 }
    );
  }

  // Normalize IDs from the Stripe object
  const piId =
    typeof refund.payment_intent === 'string'
      ? refund.payment_intent
      : refund.payment_intent?.id ?? null;

  const chId =
    typeof refund.charge === 'string'
      ? refund.charge
      : (refund.charge as any) ?? null;

  // Insert the refund row with initiated_by = 'operator'
  let row: RefundRow;
  try {
    row = await first<RefundRow>(sql`
      insert into refunds (
        provider_refund_id,
        status,
        amount_cents,
        currency,
        provider_payment_intent_id,
        provider_charge_id,
        reason,
        notes,
        initiated_by,
        created_at
      )
      values (
        ${refund.id},
        ${refund.status},
        ${refund.amount},
        ${refund.currency},
        ${piId},
        ${chId},
        ${reason ?? null},
        ${notes ?? null},
        'operator',
        now()
      )
      returning id
    `);

    await sql`
      insert into refund_events (refund_id, type, created_at)
      values (${row.id}, 'operator_created', now())
    `;
  } catch (err: any) {
    return NextResponse.json(
      {
        error:
          err?.message ||
          'Database insert failed (refunds / refund_events). Check schema.',
        stripe_refund_id: refund.id,
      },
      { status: 500 }
    );
  }

  // Redirect to the refund detail page
  const url = new URL(`/refunds/${row.id}`, req.url);
  return NextResponse.redirect(url, { status: 303 });
}
