// app/api/finance/payouts/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";    // always fresh
export const runtime = "edge";             // works in Edge & Node

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;

    // Safe empty response if Stripe not configured yet
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

    // Call Stripe REST directly (no SDK)
    const params = new URLSearchParams({ limit: "10" });
    const res = await fetch(`https://api.stripe.com/v1/payouts?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
      // Stripe REST is fine to cache-bust explicitly
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, status: res.status, error: text || "Stripe error" },
        { status: res.status }
      );
    }

    const json: any = await res.json();

    // json.data[] → map to a compact shape
    const items = Array.isArray(json?.data)
      ? json.data.map((p: any) => ({
          id: p?.id ?? null,
          status: p?.status ?? null,
          amount: typeof p?.amount === "number" ? p.amount : 0, // smallest unit
          currency: p?.currency ?? null,
          arrival: p?.arrival_date ? new Date(p.arrival_date * 1000).toISOString() : null,
          created: p?.created ? new Date(p.created * 1000).toISOString() : null,
          method: p?.method ?? null,
        }))
      : [];

    const totals = { amount: items.reduce((sum: number, i: any) => sum + (i.amount || 0), 0) };

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
