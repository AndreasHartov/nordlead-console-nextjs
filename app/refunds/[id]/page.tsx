// app/refunds/[id]/page.tsx
// FULL FILE — minimal server-rendered refund detail + events.

import Link from "next/link";

export const dynamic = "force-dynamic";

type Refund = {
  id: string;
  provider: string;
  provider_refund_id: string | null;
  provider_payment_intent_id: string | null;
  provider_charge_id: string | null;
  status: string;
  amount_cents: number;
  currency: string;
  reason: string | null;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
};

type EventRow = {
  type: string;
  payload: unknown;
  created_at: string;
};

async function fetchRefund(id: string): Promise<{ refund: Refund; events: EventRow[] }> {
  const base = process.env.APP_BASE_URL!;
  const key = process.env.OPERATOR_API_KEY!;
  const res = await fetch(`${base}/api/refunds/${id}`, {
    headers: { "x-operator-key": key },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch refund ${id}: ${res.status}`);
  }
  return (await res.json()) as { refund: Refund; events: EventRow[] };
}

export default async function RefundDetailPage({ params }: { params: { id: string } }) {
  const { refund, events } = await fetchRefund(params.id);

  return (
    <main style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/refunds" style={{ textDecoration: "underline" }}>
          ← Back to refunds
        </Link>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Refund {refund.id}
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Status <b>{refund.status}</b> • {(refund.amount_cents / 100).toFixed(2)}{" "}
        {refund.currency?.toUpperCase()}
      </p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Details</h2>
        <div style={{ fontFamily: "monospace", fontSize: 14, lineHeight: 1.6 }}>
          <div>provider_refund_id: {refund.provider_refund_id ?? "—"}</div>
          <div>payment_intent_id: {refund.provider_payment_intent_id ?? "—"}</div>
          <div>charge_id: {refund.provider_charge_id ?? "—"}</div>
          <div>reason: {refund.reason ?? "—"}</div>
          <div>notes: {refund.notes ?? "—"}</div>
          <div>source: {refund.source}</div>
          <div>created_at: {new Date(refund.created_at).toLocaleString()}</div>
          <div>updated_at: {new Date(refund.updated_at).toLocaleString()}</div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Event trail</h2>
        <div style={{ border: "1px solid #eee", borderRadius: 8, overflow: "hidden" }}>
          {events.length === 0 ? (
            <div style={{ padding: 16, color: "#666" }}>No events yet.</div>
          ) : (
            events.map((e, i) => (
              <div key={i} style={{ padding: 12, borderTop: i ? "1px solid #eee" : "none" }}>
                <div style={{ fontWeight: 600 }}>{e.type}</div>
                <div style={{ color: "#666", fontSize: 12 }}>
                  {new Date(e.created_at).toLocaleString()}
                </div>
                <pre
                  style={{
                    marginTop: 8,
                    background: "#fafafa",
                    padding: 12,
                    borderRadius: 6,
                    overflowX: "auto",
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(e.payload, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
