// components/VATWatcher.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

const THRESHOLD = 50000; // DKK

function pct(n: number) {
  return Math.max(0, Math.min(100, Math.round((n / THRESHOLD) * 100)));
}

function barColor(amount: number) {
  const r = amount / THRESHOLD;
  if (r >= 1) return "#EF4444";      // red (hit/exceeded threshold)
  if (r >= 0.9) return "#F59E0B";    // amber (within 10%)
  if (r >= 0.75) return "#FCD34D";   // yellow
  return "#10B981";                  // green
}

export default function VATWatcher() {
  const [rev, setRev] = useState<number>(() => {
    const raw = localStorage.getItem("vat:rev12m");
    return raw ? Number(raw) : 0;
  });
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem("vat:notes") || "";
  });

  useEffect(() => {
    localStorage.setItem("vat:rev12m", String(rev));
  }, [rev]);

  useEffect(() => {
    localStorage.setItem("vat:notes", notes);
  }, [notes]);

  const progress = useMemo(() => pct(rev), [rev]);
  const status = useMemo(() => {
    if (rev >= THRESHOLD) return "ACTION: Register for moms (VAT) now.";
    if (rev >= THRESHOLD * 0.9) return "Warning: within 10% of the VAT threshold.";
    return "OK: Below VAT threshold.";
  }, [rev]);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h2 style={{ margin: 0 }}>VAT watcher (DK)</h2>
        <span style={{ color: "#666" }}>Threshold: {THRESHOLD.toLocaleString("da-DK")} kr.</span>
        <a
          href="https://www.sktst.dk/virksomhed/moms/registrer-din-virksomhed-for-moms/"
          target="_blank"
          style={{ marginLeft: "auto", textDecoration: "none" }}
        >
          How VAT registration works →
        </a>
      </div>

      <div style={{ marginTop: 10 }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Trailing 12-month revenue (DKK)
        </label>
        <input
          type="number"
          value={Number.isFinite(rev) ? rev : 0}
          onChange={(e) => setRev(Number(e.target.value || 0))}
          min={0}
          step={1000}
          style={{
            padding: "8px 10px",
            border: "1px solid #ddd",
            borderRadius: 8,
            width: 240,
          }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
          Progress: {progress}%
        </div>
        <div
          style={{
            height: 10,
            width: "100%",
            background: "#f3f4f6",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: barColor(rev),
              transition: "width 200ms",
            }}
          />
        </div>
        <div style={{ marginTop: 8, fontWeight: 600, color: barColor(rev) }}>{status}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Notes</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add context (e.g., why revenue spiked, planned registration date)…"
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        />
      </div>
    </div>
  );
}
