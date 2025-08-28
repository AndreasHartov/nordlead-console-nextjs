// app/api/refunds/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
// Use a relative path (no TS alias) so Vercel bundler resolves it reliably
import { sql } from "../../../lib/db";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

function pickStr(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" && v.trim().length ? v.trim() : null;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const payment_intent = pickStr(form, "payment_intent");
    const charge = pickStr(form, "charge_id");
    const amountStr = pickStr(form, "amount");
    const reason = pickStr(form, "reason");
    const notes = pickStr(form, "notes");

    if (!payment_intent && !charge) {
      return NextResponse.json(
        { error: "Provide either a PaymentIntent (pi_…) or a Charge (ch_…)." },
        { status: 400 }
      );
    }

    const params: Stripe.RefundCreateParams = {};
    if (payment_intent) params.payment_intent = payment_intent;
    if (charge) params.charge = charge;

    if (amountStr) {
      const amount = Number(amountStr);
      if (!Number.isFinite(amount) || amount < 0) {
        return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
      }
      params.amount = amount;
    }

    if (reason) {
      // Stripe accepts specific reasons; pass through if provided
      params.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    const refund = await stripe.refunds.create(params);

    // Persist in Postgres; always set NOT NULL columns explicitly
    const rows = await sql<{ id: number }[]>`
      insert into refunds (
        provider_refund_id,
        status,
        amount_cents,
        currency,
        provider_payment_intent_id,
        provider_charge_id,
        initiated_by,
        source,
        created_at
      ) values (
        ${refund.id},
        ${refund.status ?? "succeeded"},
        ${refund.amount ?? null},
        ${refund.currency ?? null},
        ${refund.payment_intent ?? null},
        ${refund.charge ?? null},
        ${"operator"},
        ${"console"},
        now()
      )
      returning id
    `;

    const refundId = rows[0].id;

    // Add creation event (operator side)
    await sql`
      insert into refund_events (refund_id, type, notes, created_at)
      values (${refundId}, ${"operator_created"}, ${notes}, now())
    `;

    // Redirect operator to the (existing) details page
    const target = new URL(`/refunds/${refundId}`, req.url);
    return NextResponse.redirect(target, { status: 303 });
  } catch (err: any) {
    const message =
      (err && (err.message || err.error?.message)) || "Refund creation failed";

    // Best-effort logging row in refund_events table (if we can infer an id, which we can't here safely).
    // Fall back to JSON error for the UI.
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
