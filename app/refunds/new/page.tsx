import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

function parseAmountToOere(input: string | null): number | undefined {
  if (!input) return undefined;
  const n = Number(String(input).replace(',', '.'));
  if (Number.isNaN(n) || n < 0) return undefined;
  return Math.round(n * 100);
}

function q(s: unknown) {
  return typeof s === 'string' && s.trim().length ? s.trim() : undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const err = searchParams?.error;

  async function createRefund(formData: FormData) {
    'use server';

    const payment_intent = q(formData.get('payment_intent') as string);
    const charge = q(formData.get('charge') as string);
    const amountCents = parseAmountToOere(q(formData.get('amount') as string) || null);
    const reason = q(formData.get('reason') as string) || 'requested_by_customer';
    const notes = q(formData.get('notes') as string);

    if (!payment_intent && !charge) {
      redirect('/refunds/new?error=' + encodeURIComponent('Provide either a PaymentIntent (pi_…) or a Charge (ch_…); one is required.'));
    }

    try {
      const secret = process.env.STRIPE_SECRET_KEY;
      if (!secret) {
        redirect('/refunds/new?error=' + encodeURIComponent('Missing STRIPE_SECRET_KEY in Vercel env.'));
      }

      const stripe = new Stripe(secret!);

      const params: Stripe.RefundCreateParams = {
        payment_intent: payment_intent,
        charge: charge,
        amount: amountCents,
        reason: reason as Stripe.RefundCreateParams.Reason,
      };

      const refund = await stripe.refunds.create(params);

      // Persist refund row
      const insert = await sql<{ id: string }>`
        insert into refunds (
          provider_refund_id,
          provider_payment_intent_id,
          provider_charge_id,
          status,
          amount_cents,
          currency,
          notes
        ) values (
          ${refund.id},
          ${refund.payment_intent ?? null},
          ${refund.charge ?? null},
          ${refund.status},
          ${refund.amount ?? null},
          ${refund.currency},
          ${notes ?? null}
        )
        returning id;
      `;
      const refundId = insert.rows[0]?.id;

      // Log operator event (non-fatal if it fails)
      try {
        if (refundId) {
          await sql`
            insert into refund_events (refund_id, type)
            values (${refundId}, 'operator_created');
          `;
        }
      } catch (e) {
        console.error('refund_events insert failed', e);
      }

      if (!refundId) {
        // If row did not come back, fall back to list with a soft warning
        redirect('/refunds?error=' + encodeURIComponent('Refund created in Stripe, but DB row missing. Check Neon and webhook updates.'));
      }

      redirect(`/refunds/${refundId}`);
    } catch (e: any) {
      console.error('operator refund create failed', e);
      const message =
        (e?.raw?.message as string) ||
        (e?.message as string) ||
        'Refund failed. See logs.';
      redirect('/refunds/new?error=' + encodeURIComponent(message));
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '2rem', margin: 0 }}>Create refund</h1>
      <p style={{ color: '#666' }}>
        Provide <strong>either</strong> a PaymentIntent (<code>pi_…</code>) or a Charge (<code>ch_…</code>).
        Amount is optional; blank = full refund.
      </p>

      {err ? (
        <div
          style={{
            background: '#fdecea',
            color: '#611a15',
            border: '1px solid #f5c6cb',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            marginBottom: '1rem',
          }}
        >
          {decodeURIComponent(err)}
        </div>
      ) : null}

      <form action={createRefund}>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span>PaymentIntent ID (pi_…)</span>
            <input
              name="payment_intent"
              placeholder="pi_3…"
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4 }}>
            <span>Charge ID (ch_…)</span>
            <input
              name="charge"
              placeholder="ch_3…"
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4 }}>
            <span>Amount (DKK)</span>
            <input
              name="amount"
              inputMode="decimal"
              placeholder="Leave blank for full refund (e.g. 10.00)"
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4 }}>
            <span>Reason</span>
            <select
              name="reason"
              defaultValue="requested_by_customer"
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
            >
              <option value="requested_by_customer">requested_by_customer</option>
              <option value="duplicate">duplicate</option>
              <option value="fraudulent">fraudulent</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: 4 }}>
            <span>Notes (optional, internal)</span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Why did we refund? Any operator notes."
              style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
            />
          </label>

          <div style={{ display: 'flex', gap: 12, marginTop: '0.5rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 8,
                border: '1px solid #111',
                background: '#111',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Create refund
            </button>
            <a href="/refunds" style={{ alignSelf: 'center' }}>
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
