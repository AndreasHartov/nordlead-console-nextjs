import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { sql } from '../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * Accepts form posts from /refunds/new or JSON.
 * Fields supported:
 * - pi | payment_intent | payment_intent_id (pi_...)
 * - ch | charge | charge_id (ch_...)
 * - amount (DKK, optional; blank = full refund)
 * - reason (optional; stored in DB and passed to Stripe when possible)
 * - notes  (optional; stored in DB only)
 *
 * On success: redirect to /refunds/:id
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let get = (name: string): string => '';

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const form = await req.formData();
      get = (name) => (form.get(name)?.toString() ?? '').trim();
    } else {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      get = (name) => (body?.[name] ? String(body[name]).trim() : '');
    }

    const pi =
      get('pi') || get('payment_intent') || get('payment_intent_id');
    const ch = get('ch') || get('charge') || get('charge_id');
    const amountStr = get('amount');
    const reason = get('reason') || null;
    const notes = get('notes') || null;

    if (!pi && !ch) {
      return NextResponse.json(
        { error: 'Provide either a PaymentIntent (pi_...) or a Charge (ch_...)' },
        { status: 400 }
      );
    }

    const amount_cents = amountStr ? Math.round(parseFloat(amountStr) * 100) : undefined;
    if (amountStr && (isNaN(Number(amountStr)) || isNaN(amount_cents!))) {
      return NextResponse.json(
        { error: 'Invalid amount. Use a number in DKK (e.g., 10 or 10.50).' },
        { status: 400 }
      );
    }

    // Create refund on Stripe
    const createParams: Stripe.RefundCreateParams = {};
    if (typeof amount_cents === 'number') createParams.amount = amount_cents;
    if (reason) createParams.reason = reason as Stripe.RefundCreateParams.Reason;
    if (pi) createParams.payment_intent = pi;
    if (ch) createParams.charge = ch;

    const created = await stripe.refunds.create(createParams);

    // Persist in DB (reason + notes added; source stays operator)
    const rows: any[] = await sql`
      insert into refunds (
        provider_refund_id, status, amount_cents, currency,
        provider_payment_intent_id, provider_charge_id,
        initiated_by, source, reason, notes
      )
      values (
        ${created.id},
        ${created.status},
        ${created.amount ?? null},
        ${created.currency ?? null},
        ${created.payment_intent ?? null},
        ${created.charge ?? null},
        'operator',
        'operator',
        ${reason},
        ${notes}
      )
      returning id
    `;
    const id = rows[0].id as string;

    // Record an audit event with a structured payload
    const payload = {
      by: 'operator',
      reason,
      notes,
      amount_cents: created.amount ?? null,
      currency: created.currency ?? null,
      stripe_refund_id: created.id,
      payment_intent_id: created.payment_intent ?? null,
      charge_id: created.charge ?? null,
    };

    await sql`
      insert into refund_events (refund_id, type, payload, created_at)
      values (${id}, 'operator_created', ${JSON.stringify(payload)}::jsonb, now())
    `;

    // Redirect to detail page
    return NextResponse.redirect(new URL(`/refunds/${id}`, req.url));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || 'Failed to create refund' },
      { status: 500 }
    );
  }
}
