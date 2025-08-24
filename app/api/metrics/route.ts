// app/api/metrics/route.ts
import { NextResponse } from "next/server";

// Simple mock values for now. Change these anytime.
function getMockMetrics() {
  // You can add light variability so it "moves" slightly
  const base = {
    mrrDKK: 4500 * 3,          // 3 retainers
    cplAvgDKK: 300,            // across trades
    refundRatePct: 6,          // last 7 days
    vatRunwayDays: 42,         // cash runway until next VAT
    updatedAt: new Date().toISOString(),
  };
  return base;
}

export async function GET() {
  // later we can read from Stripe, DB, etc.
  return NextResponse.json(getMockMetrics(), {
    headers: { "Cache-Control": "no-store" },
  });
}
