// components/CRMPartners.tsx
"use client";

import { useEffect, useState } from "react";

type Partner = { id: string; name: string; trade?: string; phone?: string; email?: string };

export default function CRMPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [name, setName] = useState("");
  const [trade, setTrade] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("crm:partners");
    setPartners(raw ? JSON.parse(raw) : []);
  }, []);

  const save = (arr: Partner[]) => {
    setPartners(arr);
    localStorage.setItem("crm:partners", JSON.stringify(arr));
  };

  const add = () => {
    if (!name.trim()) return;
    const p: Partner = {
      id: `P-${Date.now()}`,
      name: name.trim(),
      trade: trade.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    };
    save([p, ...partners]);
    setName(""); setTrade(""); setPhone(""); setEmail("");
  };

  const remove = (id: string) => save(partners.filter((x) => x.id !== id));

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0 }}>Partners</h2>
        <span style={{ color: "#666" }}>({partners.length})</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 8, marginTop: 10 }}>
        <input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} style={inp} />
        <input placeholder="Trade" value={trade} onChange={(e) => setTrade(e.target.value)} style={inp} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} />
        <button onClick={add} style={btn}>Add</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr style={{ background: "#fafafa" }}>
            <th style={th}>Name</th><th style={th}>Trade</th><th style={th}>Phone</th><th style={th}>Email</th><th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {partners.length === 0 ? (
            <tr><td colSpan={5} style={{ padding: 12, color: "#666" }}>No partners yet.</td></tr>
          ) : partners.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid #f2f2f2" }}>
              <td style={td}>{p.name}</td>
              <td style={td}>{p.trade || "—"}</td>
              <td style={td}>{p.phone || "—"}</td>
              <td style={td}>{p.email || "—"}</td>
              <td style={td}><button onClick={() => remove(p.id)} style={btnLight}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "8px 10px", fontWeight: 700, fontSize: 13, color: "#444" };
const td: React.CSSProperties = { padding: "8px 10px", verticalAlign: "top", fontSize: 14 };
const btn: React.CSSProperties = { padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, background: "#fff" };
const btnLight: React.CSSProperties = { ...btn };
const inp: React.CSSProperties = { padding: 8, border: "1px solid #ddd", borderRadius: 8, width: "100%" };
