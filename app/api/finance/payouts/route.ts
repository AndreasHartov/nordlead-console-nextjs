// app/api/finance/payouts/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";       // ensure Node runtime (Stripe needs Node)
export const dynamic = "force-dynamic"; // always fresh

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;

    // Safe empty response if Stripe is not configured yet
    if (!key) {
      return NextResponse.json({
        ok: true,
        source: "stripe",
        items: [],
        totals: { amount: 0 },
        count: 0,
        updatedAt: new Date().toISOString(),
        note: "STRIPE_SECRET_KEY not set; returning empty list.",
      });
    }

    const stripe = new Stripe(key, { apiVersion: "2024-06-20" });

    // last 10 payouts
    const payouts = await stripe.payouts.list({ limit: 10 });

    const items = payouts.data.map((p) => ({
      id: p.id,
      status: p.status,
      amount: p.amount, // smallest currency unit
      currency: p.currency,
      arrival: p.arrival_date ? new Date(p.arrival_date * 1000).toISOString() : null,
      created: new Date(p.created * 1000).toISOString(),
      method: p.method,
    }));

    const totals = { amount: items.reduce((sum, i) => sum + (i.amount || 0), 0) };

    return NextResponse.json({
      ok: true,
      source: "stripe",
      items,
      totals,
      count: items.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
