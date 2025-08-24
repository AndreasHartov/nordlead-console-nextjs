// components/CRMAssigned.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Assignment = {
  id: string;
  leadId: string;
  partnerId: string;
  partnerName: string;
  createdAt: string;
  name?: string;
  phone?: string;
  email?: string;
  trade?: string;
  city?: string;
  zip?: string;
  cplDkk?: number;
};

function fmtDate(s?: string) {
  if (!s) return "—";
  try { return new Date(s).toLocaleString("da-DK"); } catch { return s; }
}

export default function CRMAssigned() {
  const [items, setItems] = useState<Assignment[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem("crm:assigned");
    setItems(raw ? JSON.parse(raw) : []);
  }, []);

  const csvHref = useMemo(() => {
    const header = [
      "assignment_id","lead_id","partner_id","partner_name","assigned_at",
      "name","phone","email","trade","city","zip","cpl_dkk",
    ];
    const rows = items.map((x) => [
      x.id, x.leadId, x.partnerId, x.partnerName, x.createdAt,
      x.name || "", x.phone || "", x.email || "", x.trade || "",
      x.city || "", x.zip || "", String(x.cplDkk ?? ""),
    ]);
    const all = [header, ...rows].map((r) => r.join(",")).join("\n");
    return "data:text/csv;charset=utf-8," + encodeURIComponent(all);
  }, [items]);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Assigned</h2>
        <span style={{ color: "#666" }}>({items.length})</span>
        <a href={csvHref} download={`assigned-${new Date().toISOString().slice(0,10)}.csv`} style={{ marginLeft: "auto" }}>
          Export CSV →
        </a>
      </div>

      <div style={{ overflowX: "auto", marginTop: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>When</th><th style={th}>Lead</th><th style={th}>Partner</th>
              <th style={th}>Trade</th><th style={th}>City</th><th style={th}>CPL</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 12, color: "#666" }}>Nothing assigned yet.</td></tr>
            ) : items.map((x) => (
              <tr key={x.id} style={{ borderTop: "1px solid #f2f2f2" }}>
                <td style={td}>{fmtDate(x.createdAt)}<div style={{ color:"#666", fontSize:12 }}>{x.id}</div></td>
                <td style={td}><div style={{ fontWeight: 600 }}>{x.name || "—"}</div><div style={{ fontSize:13 }}>{x.email || "—"} · {x.phone || "—"}</div></td>
                <td style={td}>{x.partnerName}</td>
                <td style={td}>{x.trade || "—"}</td>
                <td style={td}>{x.city || "—"} {x.zip ? `(${x.zip})` : ""}</td>
                <td style={td}>{typeof x.cplDkk === "number" ? `${x.cplDkk} kr` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: 13, color: "#444" };
const td: React.CSSProperties = { padding: "10px 12px", verticalAlign: "top", fontSize: 14 };
