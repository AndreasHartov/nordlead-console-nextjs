// app/api/stripe-webhook/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const sig = headers().get("stripe-signature");
  const body = await req.text();
  if (!sig) return new Response("Missing Stripe signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        console.log("[stripe] checkout.session.completed", {
          id: s.id,
          email: s.customer_details?.email,
          amount_total: s.amount_total,
          mode: s.mode,
        });
        break;
      }
      case "charge.refunded": {
        const c = event.data.object as Stripe.Charge;
        console.log("[stripe] charge.refunded", { id: c.id });
        break;
      }
      case "payment_intent.payment_failed": {
        const p = event.data.object as Stripe.PaymentIntent;
        console.warn("[stripe] payment_intent.payment_failed", {
          id: p.id,
          error: p.last_payment_error?.message,
        });
        break;
      }
      default:
        console.log("[stripe] unhandled event", event.type);
    }
  } catch (e) {
    console.error("[stripe-webhook] handler error", e);
    return new Response("Handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

export async function GET() {
  return new Response("ok", { status: 200 });
}
