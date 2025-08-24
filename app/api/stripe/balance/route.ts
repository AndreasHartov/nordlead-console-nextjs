// app/api/stripe/balance/route.ts
import { NextResponse } from "next/server";

type MapNum = Record<string, number>;

type Payload = {
  ok: boolean;
  source: "stripe" | "missing_key" | "mock" | "error";
  balances: {
    available: MapNum;
    pending: MapNum;
    instant?: MapNum;
  };
  updatedAt: string;
  error?: string;
};

function sumByCurrency(
  items: { amount: number; currency: string }[] | undefined
): MapNum {
  const out: MapNum = {};
  (items || []).forEach((x) => {
    const cur = (x.currency || "dkk").toLowerCase();
    out[cur] = (out[cur] || 0) + (x.amount || 0);
  });
  return out;
}

function mock(): Payload {
  return {
    ok: true,
    source: "missing_key",
    balances: {
      available: { dkk: 185000 }, // 1,850 kr
      pending: { dkk: 42000 },    //   420 kr
      instant: { dkk: 0 },
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return NextResponse.json(mock(), { headers: { "Cache-Control": "no-store" } });

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(key, { apiVersion: "2023-10-16" });

    const bal = await stripe.balance.retrieve();

    const payload: Payload = {
      ok: true,
      source: "stripe",
      balances: {
        available: sumByCurrency(bal.available),
        pending: sumByCurrency(bal.pending),
        instant: sumByCurrency(bal.instant_available),
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        source: "error",
        balances: { available: {}, pending: {} },
        updatedAt: new Date().toISOString(),
        error: e?.message || "Unknown error",
      } as Payload,
      { status: 500 }
    );
  }
}
