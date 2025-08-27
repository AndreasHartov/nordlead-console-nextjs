// app/refunds/new/page.tsx
// FULL FILE — Operator form to create a Stripe refund and persist to Neon.
// Uses a server action (no secrets in the browser). Redirects to the refund detail on success.

import Stripe from "stripe";
import { sql } from "../../../lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function field(v: FormDataEntryValue | null): string {
  return (typeof v === "string" ? v : "").trim();
}

export default function NewRefundPage() {
  async function createRefund(formData: FormData) {
    "use server";

    const pi = field(formData.get("payment_intent_id")); // pi_...
    const ch = field(formData.get("charge_id")); // ch_...
    const amountDkkStr = field(formData.get("amount_dkk")); // e.g. 10.00
    const reason = field(formData.get("reason")) || "requested_by_customer"; // Stripe reasons
    const notes = field(formData.get("notes"));

    if (!pi && !ch) {
      throw new Error("Provide either a PaymentIntent ID (pi_...) or a Charge ID (ch_...).");
    }

    let amount_cents: number | undefined = undefined;
    if (amountDkkStr) {
      const parsed = Number(amountDkkStr.replace(",", "."));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("Amount must be a positive number (DKK).");
      }
      amount_cents = Math.round(parsed * 100);
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // lock API version to avoid type drift
      apiVersion: "2024-06-20" as any,
    });

    // Build Stripe params
    const params: Stripe.RefundCreateParams = {
      reason: (reason as any) || undefined,
      amount: amount_cents,
    };
    if (pi) (params as any).payment_intent = pi;
    if (ch) (params as any).charge = ch;

    const refund = await stripe.refunds.create(params);

    // Persist to Neon
    const inserted = await sql<{ id: string }>`
      insert into refunds (
        provider,
        provider_refund_id,
        provider_payment_intent_id,
        provider_charge_id,
        status,
        amount_cents,
        currency
      )
      values (
        'stripe',
        ${refund.id},
        ${refund.payment_intent ?? null},
        ${refund.charge ?? null},
        ${refund.status ?? "created"},
        ${refund.amount ?? null},
        ${refund.currency ?? "dkk"}
      )
      returning id
    `;
    const refundId = inserted[0].id;

    await sql`
      insert into refund_events (refund_id, type)
      values (${refundId}, 'operator_created')
    `;

    // Optionally store notes as a separate event
    if (notes) {
      await sql`
        insert into refund_events (refund_id, type)
        values (${refundId}, ${"note:" + notes})
      `;
    }

    redirect(`/refunds/${refundId}`);
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Create Refund</h1>

      <form action={createRefund} style={{ display: "grid", gap: "1rem" }}>
        <div>
          <label htmlFor="payment_intent_id" style={{ fontWeight: 600 }}>
            PaymentIntent ID (pi_…)
          </label>
          <input
            id="payment_intent_id"
            name="payment_intent_id"
            placeholder="pi_123..."
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <div style={{ color: "#666", fontSize: 12 }}>
            Provide <b>either</b> a PaymentIntent <b>or</b> a Charge.
          </div>
        </div>

        <div>
          <label htmlFor="charge_id" style={{ fontWeight: 600 }}>
            Charge ID (ch_…)
          </label>
          <input
            id="charge_id"
            name="charge_id"
            placeholder="ch_123..."
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label htmlFor="amount_dkk" style={{ fontWeight: 600 }}>
            Amount (DKK)
          </label>
          <input
            id="amount_dkk"
            name="amount_dkk"
            type="number"
            step="0.01"
            placeholder="10.00"
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <div style={{ color: "#666", fontSize: 12 }}>
            Optional. Leave blank to refund the full captured amount.
          </div>
        </div>

        <div>
          <label htmlFor="reason" style={{ fontWeight: 600 }}>
            Reason
          </label>
          <select id="reason" name="reason" style={{ width: "100%", padding: "0.5rem" }}>
            <option value="requested_by_customer">requested_by_customer</option>
            <option value="duplicate">duplicate</option>
            <option value="fraudulent">fraudulent</option>
            <option value="other">other</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" style={{ fontWeight: 600 }}>
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            placeholder="Internal note…"
            rows={4}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button
          type="submit"
          style={{
            background: "black",
            color: "white",
            padding: "0.75rem 1rem",
            borderRadius: 8,
            border: 0,
            cursor: "pointer",
          }}
        >
          Create refund
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <a href="/refunds" style={{ color: "#0366d6" }}>Back to refunds</a>
      </div>
    </div>
  );
}
