import Link from 'next/link';
import { sql } from '../../../lib/db';

type RefundRow = {
  id: string;
  provider_refund_id: string | null;
  status: string | null;
  amount_cents: number | null;
  currency: string | null;
  provider_payment_intent_id: string | null;
  provider_charge_id: string | null;
  reason: string | null;
  notes: string | null;
  source: string | null;
  created_at: string;
  updated_at: string | null;
};

type EventRow = {
  type: string;
  payload: any | null;
  created_at: string;
};

function dkk(cents: number | null, currency: string | null) {
  if (cents == null) return '—';
  const amount = (cents / 100).toFixed(2);
  return `${amount} ${currency?.toUpperCase() ?? 'DKK'}`;
}

export default async function RefundDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;

  const refundRows: any[] = await sql`
    select id,
           provider_refund_id,
           status,
           amount_cents,
           currency,
           provider_payment_intent_id,
           provider_charge_id,
           reason,
           notes,
           source,
           created_at,
           updated_at
      from refunds
     where id = ${id}
     limit 1
  `;

  if (!refundRows.length) {
    return (
      <main style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
        <p>Refund not found.</p>
        <p><Link href="/refunds">Back to refunds</Link></p>
      </main>
    );
  }

  const r = refundRows[0] as RefundRow;

  const events: any[] = await sql`
    select type, payload, created_at
      from refund_events
     where refund_id = ${id}
     order by created_at asc
  `;

  return (
    <main style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <p>
        <Link href="/refunds">← Back to refunds</Link>
      </p>

      <h1 style={{ margin: '1rem 0' }}>
        Refund <code>{r.id}</code>
      </h1>

      <p>
        <strong>Status:</strong>{' '}
        <span>{r.status ?? '—'}</span> •{' '}
        <strong>Amount:</strong>{' '}
        <span>{dkk(r.amount_cents, r.currency)}</span>
      </p>

      <section style={{ marginTop: '1rem' }}>
        <h3>Details</h3>
        <pre style={{ background: '#fafafa', padding: '1rem', borderRadius: 6 }}>
{`provider_refund_id: ${r.provider_refund_id ?? '—'}
payment_intent_id: ${r.provider_payment_intent_id ?? '—'}
charge_id: ${r.provider_charge_id ?? '—'}
reason: ${r.reason ?? '—'}
notes: ${r.notes ?? '—'}
source: ${r.source ?? '—'}
created_at: ${r.created_at}
updated_at: ${r.updated_at ?? '—'}`}
        </pre>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Event trail</h3>
        <div style={{ border: '1px solid #eee', borderRadius: 6 }}>
          {events.map((e: EventRow, idx: number) => (
            <div key={idx} style={{ padding: '1rem', borderTop: idx ? '1px solid #eee' : 'none' }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>
                {e.type}{' '}
                <span style={{ color: '#777', fontWeight: 400 }}>
                  {new Date(e.created_at).toISOString()}
                </span>
              </div>
              <pre style={{ margin: 0, background: '#fbfbfb', padding: '0.75rem', borderRadius: 4, overflowX: 'auto' }}>
                {JSON.stringify(e.payload ?? {}, null, 2)}
              </pre>
            </div>
          ))}
          {!events.length && (
            <div style={{ padding: '1rem' }}>No events recorded.</div>
          )}
        </div>
      </section>
    </main>
  );
}
