// components/HealthWidget.tsx
"use client";

import { useEffect, useState } from "react";

type State = { status: "unknown" | "ok" | "error"; latency?: number; ts?: string };

export default function HealthWidget() {
  const [state, setState] = useState<State>({ status: "unknown" });

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const json = await res.json();
        const t1 = performance.now();
        if (!cancelled) {
          setState({ status: json?.ok ? "ok" : "error", latency: Math.round(t1 - t0), ts: json?.ts });
        }
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    };

    ping();
    const id = setInterval(ping, 10_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const color =
    state.status === "ok" ? "#10B981" :
    state.status === "error" ? "#EF4444" : "#9CA3AF";

  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: 10,
      padding: "14px 16px",
      background: "#fff",
      display: "flex",
      alignItems: "center",
      gap: 12
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: 9999, background: color,
        boxShadow: `0 0 0 3px ${color}22`
      }} />
      <div style={{ fontWeight: 600 }}>API Health:</div>
      <div>
        {state.status.toUpperCase()}
        {state.latency !== undefined ? ` · ${state.latency}ms` : ""}
      </div>
      {state.ts ? <div style={{ marginLeft: 8, color: "#666", fontSize: 12 }}>at {new Date(state.ts).toLocaleTimeString()}</div> : null}
    </div>
  );
}
