// components/FinancePayouts.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

type Resp = {
  ok: boolean;
  source: "stripe" | "mock" | "missing_key" | "error";
  items: PayoutLite[];
  totals: { amount: number; currency?: string };
  count: number;
  updatedAt: string;
  error?: string;
};

const fmtCurrency = (amount: number, currency = "dkk") =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);

const fmtDate = (unixSeconds: number) =>
  unixSeconds ? new Date(unixSeconds * 1000).toLocaleString() : "—";

export default function FinancePayouts() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch("/api/stripe/payouts", { cache: "no-store" });
      const json = (await res.json()) as Resp;
      if (!res.ok || !json.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000); // refresh every 60s
    return () => clearInterval(id);
  }, [load]);

  const totalFormatted = useMemo(() => {
    if (!data) return "—";
    return fmtCurrency(data.totals.amount, data.totals.currency || "dkk");
  }, [data]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Payouts</h2>
        <span style={{ color: "#666" }}>
          {data ? `${data.count} items` : "—"}
          {data?.source ? ` · source: ${data.source}` : ""}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            onClick={load}
            disabled={loading}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", background: "#fff" }}
            title="Refresh now"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <a
            href="https://dashboard.stripe.com/payouts"
            target="_blank"
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", background: "#f7f7f7", textDecoration: "none", color: "#111" }}
          >
            Open in Stripe
          </a>
        </div>
      </div>

      <div style={{ color: "#666" }}>
        Total (sum of listed): <b>{totalFormatted}</b>{" "}
        {data?.updatedAt ? `· Updated ${new Date(data.updatedAt).toLocaleTimeString()}` : ""}
        {err ? <span style={{ color: "#EF4444", marginLeft: 8 }}>Error: {err}</span> : null}
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>Status</th>
              <th style={th}>Amount</th>
              <th style={th}>Arrival</th>
              <th style={th}>Created</th>
              <th style={th}>Method</th>
              <th style={th}>ID</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((p) => (
              <tr key={p.id}>
                <td style={td}>{p.status}</td>
                <td style={td}>{fmtCurrency(p.amount, p.currency)}</td>
                <td style={td}>{fmtDate(p.arrival_date)}</td>
                <td style={td}>{fmtDate(p.created)}</td>
                <td style={td}>{p.method ?? "—"}</td>
                <td style={{ ...td, fontFamily: "monospace" }}>{p.id}</td>
              </tr>
            ))}
            {!data?.items?.length ? (
              <tr>
                <td style={td} colSpan={6}>No payouts found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid #eee",
  fontWeight: 600,
  fontSize: 13,
  color: "#444",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f2f2f2",
  fontSize: 14,
  color: "#222",
};
