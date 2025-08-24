// components/FinanceBalance.tsx
"use client";

import { useEffect, useState } from "react";

type MapNum = Record<string, number>;
type Resp = {
  ok: boolean;
  source: "stripe" | "missing_key" | "mock" | "error";
  balances: { available: MapNum; pending: MapNum; instant?: MapNum };
  updatedAt: string;
  error?: string;
};

const fmt = (amt: number, cur: string) =>
  new Intl.NumberFormat("da-DK", { style: "currency", currency: cur.toUpperCase(), maximumFractionDigits: 0 })
    .format(amt / 100);

function Row({ label, map }: { label: string; map?: MapNum }) {
  const entries = map ? Object.entries(map) : [];
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <div style={{ width: 100, color: "#666" }}>{label}</div>
      {entries.length === 0 ? <div>—</div> :
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {entries.map(([cur, amount]) => (
            <div key={cur} style={{ fontWeight: 600 }}>{fmt(amount, cur)} <span style={{ color: "#666", fontWeight: 400 }}>({cur})</span></div>
          ))}
        </div>
      }
    </div>
  );
}

export default function FinanceBalance() {
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/api/stripe/balance", { cache: "no-store" });
        const json = (await res.json()) as Resp;
        if (!res.ok || !json.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setData(json);
      } catch (e: any) {
        setErr(e?.message || "Failed to load balance");
      }
    })();
  }, []);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Balance</h2>
        <span style={{ color: "#666" }}>{data?.source ? ` · source: ${data.source}` : ""}</span>
        <a href="https://dashboard.stripe.com/balance" target="_blank" style={{ marginLeft: "auto", textDecoration: "none" }}>Open in Stripe →</a>
      </div>
      {err ? <div style={{ color: "#EF4444" }}>Error: {err}</div> : null}
      <Row label="Available" map={data?.balances?.available} />
      <Row label="Pending" map={data?.balances?.pending} />
      <Row label="Instant" map={data?.balances?.instant} />
      <div style={{ color: "#666", marginTop: 6 }}>
        {data?.updatedAt ? `Updated ${new Date(data.updatedAt).toLocaleTimeString()}` : "Loading…"}
      </div>
    </div>
  );
}
