// app/api/stripe/payouts/route.ts
import { NextResponse } from "next/server";

type PayoutLite = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: number;
  created: number;
  method?: string | null;
  description?: string | null;
};

type Payload = {
  ok: boolean;
  source: "stripe" | "mock" | "missing_key" | "error";
  items: PayoutLite[];
  totals: { amount: number; currency?: string };
  count: number;
  updatedAt: string;
  error?: string;
};

function mockData(): Payload {
  const now = Math.floor(Date.now() / 1000);
  const items: PayoutLite[] = [
    { id: "po_mock_1", amount: 125000, currency: "dkk", status: "paid",       arrival_date: now - 86400 * 2, created: now - 86400 * 3, method: "standard", description: "Mock payout 1" },
    { id: "po_mock_2", amount:  98000, currency: "dkk", status: "paid",       arrival_date: now - 86400 * 7, created: now - 86400 * 8, method: "standard", description: "Mock payout 2" },
    { id: "po_mock_3", amount:  45500, currency: "dkk", status: "in_transit", arrival_date: now + 86400 * 1, created: now - 3600 * 12,  method: "standard", description: "Mock payout 3" },
  ];
  const total = items.reduce((s, i) => s + i.amount, 0);
  return {
    ok: true,
    source: "mock",
    items,
    totals: { amount: total, currency: "dkk" },
    count: items.length,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      const mock = mockData();
      mock.source = "missing_key";
      return NextResponse.json(mock, { headers: { "Cache-Control": "no-store" } });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(key, { apiVersion: "2023-10-16" });

    const payouts = await stripe.payouts.list({ limit: 10 });
    const items: PayoutLite[] = payouts.data.map((p) => ({
      id: p.id,
      amount: p.amount ?? 0,
      currency: (p.currency || "dkk").toLowerCase(),
      status: p.status || "unknown",
      arrival_date: p.arrival_date ?? p.created ?? 0,
      created: p.created ?? 0,
      method: (p as any).method ?? null,
      description: (p as any).description ?? null,
    }));

    const total = items.reduce((s, i) => s + (i.amount || 0), 0);
    const currency = items[0]?.currency;

    const payload: Payload = {
      ok: true,
      source: "stripe",
      items,
      totals: { amount: total, currency },
      count: items.length,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        source: "error",
        items: [],
        totals: { amount: 0 },
        count: 0,
        updatedAt: new Date().toISOString(),
        error: e?.message || "Unknown error",
      } as Payload,
      { status: 500 }
    );
  }
}
