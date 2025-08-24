// components/FinancePayoutSchedule.tsx
"use client";

import { useEffect, useState } from "react";

type Schedule = {
  interval?: "daily" | "manual" | "weekly" | "monthly";
  weekly_anchor?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  monthly_anchor?: number;
  delay_days?: number | "minimum";
};

type Resp = {
  ok: boolean;
  source: "stripe" | "missing_key" | "error";
  schedule?: Schedule;
  updatedAt: string;
  error?: string;
};

function pretty(s?: Schedule) {
  if (!s?.interval) return "Unknown";
  if (s.interval === "daily") return "Automatic — daily";
  if (s.interval === "manual") return "Manual payouts (initiate from Stripe)";
  if (s.interval === "weekly") return `Automatic — weekly (${s.weekly_anchor || "anchor unset"})`;
  if (s.interval === "monthly") return `Automatic — monthly (day ${s.monthly_anchor ?? "unset"})`;
  return "Unknown";
}

export default function FinancePayoutSchedule() {
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/api/stripe/account", { cache: "no-store" });
        const json = (await res.json()) as Resp;
        if (!res.ok || !json.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setData(json);
      } catch (e: any) {
        setErr(e?.message || "Failed to load payout schedule");
      }
    })();
  }, []);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Payout schedule</h2>
        <span style={{ color: "#666" }}>{data?.source ? ` · source: ${data.source}` : ""}</span>
        <a href="https://dashboard.stripe.com/settings/payouts" target="_blank" style={{ marginLeft: "auto", textDecoration: "none" }}>
          Edit in Stripe →
        </a>
      </div>
      {err ? <div style={{ color: "#EF4444" }}>Error: {err}</div> : null}
      <div>{pretty(data?.schedule)}</div>
      {typeof data?.schedule?.delay_days !== "undefined" ? (
        <div style={{ color: "#666", marginTop: 4 }}>Payout delay: {String(data.schedule.delay_days)} day(s)</div>
      ) : null}
      <div style={{ color: "#666", marginTop: 6 }}>
        {data?.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleTimeString()}` : "Loading…"}
      </div>
    </div>
  );
}
