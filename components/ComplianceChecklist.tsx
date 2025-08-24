// components/ComplianceChecklist.tsx
"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  label: string;
  href?: string;
};

const ITEMS: Item[] = [
  { id: "cvr", label: "Register CVR (or confirm sole prop path)", href: "https://virk.dk" },
  { id: "mitid", label: "MitID Erhverv + Digital Post access", href: "https://www.mitid-erhverv.dk/" },
  { id: "nemkonto", label: "Map account to NemKonto (business)", href: "https://www.nemkonto.dk/" },
  { id: "vat", label: "Register for moms (VAT) when threshold is reached", href: "https://www.sktst.dk/" },
  { id: "refunds", label: "Write refund policy and publish on public sites" },
  { id: "privacy", label: "Write privacy policy and retention schedule" },
  { id: "stripe-public", label: "Stripe public details (support email/URL/descriptors) set" },
  { id: "webhook-200", label: "Stripe webhook returns 200 OK (live)" },
];

export default function ComplianceChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = localStorage.getItem("compliance:checklist");
    setDone(raw ? JSON.parse(raw) : {});
  }, []);

  useEffect(() => {
    localStorage.setItem("compliance:checklist", JSON.stringify(done));
  }, [done]);

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));
  const reset = () => {
    if (confirm("Reset all checklist items?")) {
      setDone({});
      localStorage.removeItem("compliance:checklist");
    }
  };

  const count = ITEMS.filter((i) => done[i.id]).length;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Compliance checklist</h2>
        <span style={{ color: "#666" }}>{count}/{ITEMS.length} done</span>
        <button onClick={reset} style={{ marginLeft: "auto", border: "1px solid #ddd", borderRadius: 8, padding: "6px 10px", background: "#fff" }}>
          Reset
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0 0" }}>
        {ITEMS.map((item) => (
          <li key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
            <input
              type="checkbox"
              checked={!!done[item.id]}
              onChange={() => toggle(item.id)}
              style={{ width: 18, height: 18 }}
            />
            <span style={{ flex: 1 }}>
              {item.href ? (
                <a href={item.href} target="_blank" style={{ textDecoration: "none" }}>
                  {item.label} →
                </a>
              ) : (
                item.label
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
