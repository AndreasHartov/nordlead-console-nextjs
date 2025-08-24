// components/MetricsWidget.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import StatCard from "./StatCard";

type Metrics = {
  mrrDKK: number;
  cplAvgDKK: number;
  refundRatePct: number;
  vatRunwayDays: number;
  updatedAt: string;
};

const formatDKK = (n: number) =>
  new Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK", maximumFractionDigits: 0 }).format(n);

export default function MetricsWidget() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch("/api/metrics", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000); // refresh every 30s
    return () => clearInterval(id);
  }, [load]);

  const cards = [
    { label: "MRR (DKK)", value: data ? formatDKK(data.mrrDKK) : "—", hint: "Retainers" },
    { label: "CPL avg (DKK)", value: data ? formatDKK(data.cplAvgDKK) : "—", hint: "Across trades" },
    { label: "Refund rate", value: data ? `${data.refundRatePct}%` : "—", hint: "Last 7 days" },
    { label: "VAT runway (days)", value: data ? String(data.vatRunwayDays) : "—", hint: "Until next VAT" },
  ];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} hint={c.hint} />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#666" }}>
        <button
          onClick={load}
          disabled={loading}
          style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", background: "#fff" }}
          title="Refresh now"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
        <span>
          {err
            ? `Error: ${err}`
            : data
            ? `Updated ${new Date(data.updatedAt).toLocaleTimeString()}`
            : "Loading…"}
        </span>
      </div>
    </div>
  );
}
