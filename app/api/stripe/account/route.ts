// app/api/stripe/account/route.ts
import { NextResponse } from "next/server";

type Schedule = {
  interval?: "daily" | "manual" | "weekly" | "monthly";
  weekly_anchor?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  monthly_anchor?: number; // 1..31
  delay_days?: number | "minimum";
};

type Payload = {
  ok: boolean;
  source: "stripe" | "missing_key" | "error";
  schedule?: Schedule;
  updatedAt: string;
  error?: string;
};

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json(
        { ok: true, source: "missing_key", updatedAt: new Date().toISOString() } as Payload,
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(key, { apiVersion: "2023-10-16" });

    const acct = await stripe.accounts.retrieve();
    const sched = acct.settings?.payouts?.schedule as Schedule | undefined;

    return NextResponse.json(
      { ok: true, source: "stripe", schedule: sched, updatedAt: new Date().toISOString() } as Payload,
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        source: "error",
        updatedAt: new Date().toISOString(),
        error: e?.message || "Unknown error",
      } as Payload,
      { status: 500 }
    );
  }
}
