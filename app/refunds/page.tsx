// app/refunds/page.tsx
// FULL FILE — Refunds list with "Create refund" link.
// Renders latest refunds from Neon and links to detail view.

import Link from "next/link";
import { sql } from "../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RefundRow = {
  id: string;
  provider_refund_id: string | null;
  provider_payment_intent_id: string | null;
  provider_charge_id: string | null;
  status: string | null;
  amount_cents: number | null;
  currency: string | null;
  created_at: string;
};

function amountFmt(cents: number | null | undefined, currency: string | null | undefined) {
  const val = ((cents ?? 0) / 100).toFixed(2);
  return `${val} ${(currency ?? "dkk").toUpperCase()}`;
}

function formatCopenhagen(iso: string) {
  // Display in Europe/Copenhagen for operator sanity
  try {
    return new Intl.DateTimeFormat("da-DK", {
      timeZone: "Europe/Copenhagen",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(iso));
  } catch {
    // Fallback if ICU is limited
    return new Date(iso).toISOString().replace("T", " ").replace("Z", " UTC");
  }
}

export default async function RefundsPage() {
  const rows = await sql<RefundRow>`
    select
      id,
      provider_refund_id,
      provider_payment_intent_id,
      provider_charge_id,
      status,
      amount_cents,
      currency,
      created_at
    from refunds
    order by created_at desc
    limit 200
  `;

  return (
    <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Refunds</h1>
        <Link
          href="/refunds/new"
          style={{
            background: "black",
            color: "white",
            padding: "0.6rem 0.9rem",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + Create refund
        </Link>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th style={th}>Created</th>
              <th style={th}>Status</th>
              <th style={th}>Amount</th>
              <th style={th}>Stripe Refund</th>
              <th style={th}>PI</th>
              <th style={th}>Charge</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const created = formatCopenhagen(r.created_at);
              const amt = amountFmt(r.amount_cents, r.currency);
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={td}>
                    <Link href={`/refunds/${r.id}`} style={{ color: "#0366d6", textDecoration: "none" }}>
                      {created}
                    </Link>
                  </td>
                  <td style={td}>{r.status ?? "-"}</td>
                  <td style={td}>{amt}</td>
                  <td style={td} title={r.provider_refund_id ?? ""}>
                    <code style={co
