// app/api/stripe/webhook/route.ts
// FULL FILE — do not trim.
//
// Endpoint: POST /api/stripe/webhook
// Runtime: Node (needed for raw body)
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DATABASE_URL

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
// from app/api/stripe/webhook → root/lib
import { sql } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// stripe@14 types match this version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Signature verification failed: ${err?.message ?? "invalid"}` },
      { status: 400 }
    );
  }

  // Utility to persist/update our refund + log an event
  async function upsertFromRefund(r: Stripe.Refund) {
    const provider_refund_id = r.id;
    const status = r.status ?? "pending";
    const amount_cents = r.amount ?? 0;
    const currency = String(r.currency ?? "dkk").toLowerCase();
    const pi = typeof r.payment_intent === "string" ? r.payment_intent : r.payment_intent?.id ?? null;
    const ch = typeof r.charge === "string" ? r.charge : r.charge?.id ?? null;

    // 1) try update by refund id
    const updated = await sql<{ id: string }>`
      update refunds
         set status = ${status},
             amount_cents = case when ${amount_cents} > 0 then ${amount_cents} else amount_cents end,
             currency = ${currency},
             provider_payment_intent_id = ${pi},
             provider_charge_id = ${ch},
             updated_at = now()
       where provider = 'stripe' and provider_refund_id = ${provider_refund_id}
       returning id
    `;
    let refundId: string | null = updated[0]?.id ?? null;

    // 2) if not found, try attach to existing by PI or Charge
    if (!refundId && (pi || ch)) {
      const found = await sql<{ id: string }>`
        select id from refunds
         where provider = 'stripe'
           and (provider_payment_intent_id = ${pi} or provider_charge_id = ${ch})
         order by created_at desc
         limit 1
      `;
      if (found.length) {
        refundId = found[0].id;
        await sql`
          update refunds
             set provider_refund_id = ${provider_refund_id},
                 status = ${status},
                 amount_cents = case when ${amount_cents} > 0 then ${amount_cents} else amount_cents end,
                 currency = ${currency},
                 updated_at = now()
           where id = ${refundId}
        `;
      }
    }

    // 3) still not found → create minimal record (webhook-originated)
    if (!refundId) {
      const inserted = await sql<{ id: string }>`
        insert into refunds (
          provider, provider_refund_id, provider_payment_intent_id, provider_charge_id,
          status, amount_cents, currency, reason, initiated_by, source, notes
        ) values (
          'stripe', ${provider_refund_id}, ${pi}, ${ch},
          ${status}, ${amount_cents}, ${currency}, ${r.reason ?? null},
          'stripe/webhook', 'webhook', null
        )
        returning id
      `;
      refundId = inserted[0].id;
    }

    // Log this webhook payload
    await sql`
      insert into refund_events (refund_id, type, payload)
      values (${refundId}, 'webhook_update', ${JSON.stringify(event)})
    `;
  }

  try {
    switch (event.type) {
      case "refund.updated": {
        const r = event.data.object as Stripe.Refund;
        await upsertFromRefund(r);
        break;
      }
      case "charge.refund.updated": {
        const r = event.data.object as Stripe.Refund;
        await upsertFromRefund(r);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const list = charge.refunds?.data ?? [];
        for (const r of list) await upsertFromRefund(r as unknown as Stripe.Refund);
        break;
      }
      default:
        // ignore unrelated events in v1
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    // Always 200 to prevent retries storm; log the error row
    try {
      await sql`
        insert into refund_events (refund_id, type, payload)
        values (null, 'error', ${JSON.stringify({ message: err?.message ?? "unknown", event })})
      `;
    } catch {}
    return NextResponse.json({ received: true });
  }
}
