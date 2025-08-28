// app/refunds/new/page.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NewRefundPage() {
  return (
    <div style={{ maxWidth: 760, margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Create refund</h1>
        <Link href="/refunds" style={{ marginLeft: "auto" }}>
          ← Back to refunds
        </Link>
      </div>

      <p style={{ color: "#444", lineHeight: 1.5 }}>
        Provide <strong>either</strong> a PaymentIntent (<code>pi_…</code>) or a Charge (<code>ch_…</code>).
        Amount is optional; leave blank to refund the full amount.
      </p>

      <form method="post" action="/api/refunds" style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", fontWeight: 600, marginTop: "1rem" }}>
          PaymentIntent ID (pi_…)
        </label>
        <input
          name="payment_intent"
          placeholder="pi_3R..."
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: "1rem" }}>
          Charge ID (ch_…)
        </label>
        <input
          name="charge_id"
          placeholder="ch_3R..."
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: "1rem" }}>
          Amount (DKK)
        </label>
        <input
          name="amount"
          placeholder="Leave blank for full refund (e.g. 10.00)"
          inputMode="numeric"
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
        />

        <label style={{ display: "block", fontWeight: 600, marginTop: "1rem" }}>
          Reason
        </label>
        <select
          name="reason"
          defaultValue="requested_by_customer"
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
        >
          <option value="requested_by_customer">requested_by_customer</option>
          <option value="duplicate">duplicate</option>
          <option value="fraudulent">fraudulent</option>
          <option value="expired_uncaptured_charge">expired_uncaptured_charge</option>
          <option value="failed_invoice">failed_invoice</option>
          <option value="order_change">order_change</option>
          <option value="product_unacceptable">product_unacceptable</option>
          <option value="product_not_received">product_not_received</option>
          <option value="general">general</option>
        </select>

        <label style={{ display: "block", fontWeight: 600, marginTop: "1rem" }}>
          Notes (optional, internal)
        </label>
        <textarea
          name="notes"
          placeholder="Why did we refund? Any operator notes."
          rows={4}
          style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: 6 }}
        />

        <div style={{ display: "flex", gap: 12, marginTop: "1.25rem" }}>
          <button
            type="submit"
            style={{
              background: "black",
              color: "white",
              border: 0,
              padding: "10px 16px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Create refund
          </button>
          <Link href="/refunds">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
