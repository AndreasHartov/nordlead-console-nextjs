// app/api/refunds/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sql } from "../../../lib/db";

// Small, local helper to avoid importing a non-existent 'first' from lib/db
const firstRow = <T>(rows: T[]): T => {
  if (!rows || rows.length === 0) throw new Error("Not found");
  return rows[0] as T;
};

// Row shape we expect back from INSERT ... RETURNING
type RefundRow = { id: string };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

async function readPayload(req: Request) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await req.json();
    return {
      payment_intent: (j.payment_intent || "").toString().trim(),
      charge: (j.charge || "").toString().trim(),
      amount_dkk: j.amount_dkk ? Number(j.amount_dkk) : undefined,
      reason: (j.reason || "").toString().trim(),
      notes: (j.notes || "").toString().trim(),
    };
  } else {
    const f = await req.formData();
    return {
      payment_intent: (f.get("payment_intent") || "").toString().trim(),
      charge: (f.get("charge") || "").toString().trim(),
      amount_dkk: f.get("amount_dkk")
        ? Number(f.get("amount_dkk")!.toString())
        : undefined,
      reason: (f.get("reason") || "").toString().trim(),
      notes: (f.get("notes") || "").toString().trim(),
    };
  }
}

export async function POST(req: Request) {
  try {
    const { payment_intent, charge, amount_dkk, reason, notes } =
      await readPayload(req);

    if (!payment_intent && !charge) {
      return NextResponse.json(
        { error: "Provide either a PaymentIntent (pi_...) or a Charge (ch_...)."},
        { status: 400 }
      );
    }
    if (payment_intent && charge) {
      return NextResponse.json(
        { error: "Provide only one of payment_intent or charge, not both." },
        { status: 400 }
      );
    }

    const createParams: Stripe.RefundCreateParams = {};
    if (payment_intent) createParams.payment_intent = payment_intent;
    if (charge) createParams.charge = charge;

    if (typeof amount_dkk === "number" && !Number.isNaN(amount_dkk)) {
      createParams.amount = Math.round(amount_dkk * 100); // DKK → øre
    }
    if (reason) createParams.reason = reason as any;

    // Ensure we always tag who initiated this
    createParams.metadata = {
      initiated_by: "operator",
      notes: notes || "",
    };

    const refund = await stripe.refunds.create(createParams);

    const provider_payment_intent_id =
      typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : refund.payment_intent?.id ?? null;

    const provider_charge_id =
      typeof refund.charge === "string"
        ? refund.charge
        : refund.charge?.id ?? null;

    // ---- NOTE ON TYPING ----
    // Our sql() helper is typed loosely and may return unknown.
    // We coerce the result to RefundRow[] here so TS knows the shape.
    const inserted = (await sql`
      insert into refunds
        (provider_refund_id, status, amount_cents, currency,
         provider_payment_intent_id, provider_charge_id, initiated_by)
      values
        (${refund.id}, ${refund.status}, ${refund.amount ?? null}, ${
          refund.currency ?? "dkk"
        },
         ${provider_payment_intent_id}, ${provider_charge_id}, 'operator')
      returning id
    `) as RefundRow[];

    const row = firstRow<RefundRow>(inserted);

    await sql`
      insert into refund_events (refund_id, type, created_at)
      values (${row.id}, 'operator_created', now())
    `;

    // Redirect to the new refund details page
    const url = new URL(`/refunds/${row.id}`, req.url);
    return NextResponse.redirect(url, { status: 303 });
  } catch (err: any) {
    const message =
      err?.raw?.message ||
      err?.message ||
      "Refund creation failed. See logs for details.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
