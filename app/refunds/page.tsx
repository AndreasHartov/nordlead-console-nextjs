// app/refunds/page.tsx
// FULL FILE — minimal server-rendered list of refunds with local time display.

import Link from "next/link";
import LocalTime from "../../components/LocalTime";

export const dynamic = "force-dynamic";

type Refund = {
  id: string;
  provider_refund_id: string | null;
  status: string;
  amount_cents: number;
  currency: string;
  provider_payment_intent_id: string | null;
  provider_charge_id: string | null;
  created_at: string;
};

async function fetchRefunds(): Promise<Refund[]> {
  const base = process.env.APP_BASE_URL!;
  const key = process.env.OPERATOR_API_KEY!;
  const res = await fetch(`${base}/api/refunds?limit=50`, {
    headers: { "x-operator-key": key },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch refunds: ${res.status}`);
  }
  const data = (await res.json()) as { refunds: Refund[] };
  return data.refunds ?? [];
}

export default async function RefundsPage() {
  const refunds = await fetchRefunds();

  return (
    <main style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Refunds</h1>

      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead style={{ background: "#fafafa", textAlign: "left" }}>
            <tr>
              <th style={{ padding: "12px 10px" }}>Created</th>
              <th style={{ padding: "12px 10px" }}>Status</th>
              <th style={{ padding: "12px 10px" }}>Amount</th>
              <th style={{ padding: "12px 10px" }}>Stripe Refund</th>
              <th style={{ padding: "12px 10px" }}>PI</th>
              <th style={{ padding: "12px 10px" }}>Charge</th>
            </tr>
          </thead>
          <tbody>
            {refunds.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>
                  <Link href={`/refunds/${r.id}`} style={{ textDecoration: "underline" }}>
                    <LocalTime iso={r.created_at} />
                  </Link>
                </td>
                <td style={{ padding: "10px", textTransform: "capitalize" }}>{r.status}</td>
                <td style={{ padding: "10px" }}>
                  {(r.amount_cents / 100).toFixed(2)} {r.currency?.toUpperCase()}
                </td>
                <td style={{ padding: "10px", fontFamily: "monospace" }}>
                  {r.provider_refund_id ?? "—"}
                </td>
                <td style={{ padding: "10px", fontFamily: "monospace" }}>
                  {r.provider_payment_intent_id ?? "—"}
                </td>
                <td style={{ padding: "10px", fontFamily: "monospace" }}>
                  {r.provider_charge_id ?? "—"}
                </td>
              </tr>
            ))}
            {refunds.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 16, color: "#666" }}>
                  No refunds yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
