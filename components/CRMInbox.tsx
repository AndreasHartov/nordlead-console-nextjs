// components/CRMInbox.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: string;
  createdAt: string;
  name: string;
  phone?: string;
  email?: string;
  trade: string;
  city?: string;
  zip?: string;
  description?: string;
  cplDkk?: number;
  source?: string;
};

type RefundTicket = {
  id: string;          // ticket id
  leadId: string;
  createdAt: string;   // ISO when queued
  reason: string;      // one of predefined or custom
  note?: string;
  name?: string;
  phone?: string;
  email?: string;
  trade?: string;
  city?: string;
  zip?: string;
  cplDkk?: number;
};

const REASONS = [
  "Invalid contact",
  "Outside area",
  "Job doesn't exist / duplicate",
  "Wrong trade category",
  "Spam / abusive",
];

function fmtDate(s?: string) {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return d.toLocaleString("da-DK");
  } catch {
    return s;
  }
}

function stripeSearchUrl(q?: string) {
  if (!q) return "https://dashboard.stripe.com/search";
  return `https://dashboard.stripe.com/search?query=${encodeURIComponent(q)}`;
}

function useRefundQueue() {
  const [items, setItems] = useState<RefundTicket[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem("crm:refunds");
    setItems(raw ? JSON.parse(raw) : []);
  }, []);
  const save = (arr: RefundTicket[]) => {
    setItems(arr);
    localStorage.setItem("crm:refunds", JSON.stringify(arr));
  };
  const add = (t: RefundTicket) => save([t, ...items]);
  const remove = (id: string) => save(items.filter((x) => x.id !== id));
  const clear = () => save([]);
  const csvHref = useMemo(() => {
    const header = [
      "ticket_id",
      "lead_id",
      "queued_at",
      "reason",
      "note",
      "name",
      "phone",
      "email",
      "trade",
      "city",
      "zip",
      "cpl_dkk",
    ];
    const rows = items.map((x) => [
      x.id,
      x.leadId,
      x.createdAt,
      x.reason,
      (x.note || "").replace(/\n/g, " ").replace(/,/g, ";"),
      x.name || "",
      x.phone || "",
      x.email || "",
      x.trade || "",
      x.city || "",
      x.zip || "",
      String(x.cplDkk ?? ""),
    ]);
    const all = [header, ...rows].map((r) => r.join(",")).join("\n");
    return "data:text/csv;charset=utf-8," + encodeURIComponent(all);
  }, [items]);

  return { items, add, remove, clear, csvHref };
}

export default function CRMInbox() {
  const [data, setData] = useState<Lead[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [openBad, setOpenBad] = useState<string | null>(null);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [note, setNote] = useState<string>("");

  const queue = useRefundQueue();

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const r = await fetch("/api/crm/leads", { cache: "no-store" });
        const j = await r.json();
        if (!r.ok || !j?.ok) throw new Error(j?.error || `HTTP ${r.status}`);
        setData(j.items || []);
      } catch (e: any) {
        setErr(e?.message || "Failed to load leads");
      }
    })();
  }, []);

  const assign = (id: string) => {
    // v0: purely client-side mark-as-done
    const keep = data.filter((x) => x.id !== id);
    setData(keep);
  };

  const queueBadLead = (lead: Lead) => {
    const ticket: RefundTicket = {
      id: `T-${Date.now()}`,
      leadId: lead.id,
      createdAt: new Date().toISOString(),
      reason: reason || "Other",
      note,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      trade: lead.trade,
      city: lead.city,
      zip: lead.zip,
      cplDkk: lead.cplDkk,
    };
    queue.add(ticket);
    // remove from inbox
    setData((arr) => arr.filter((x) => x.id !== lead.id));
    // reset
    setOpenBad(null);
    setReason(REASONS[0]);
    setNote("");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Lead Inbox</h2>
        <span style={{ color: "#666" }}>({data.length})</span>
        <a
          href={queue.csvHref}
          download={`bad-lead-refunds-${new Date().toISOString().slice(0,10)}.csv`}
          style={{ marginLeft: "auto", textDecoration: "none" }}
        >
          Export refund queue (CSV) →
        </a>
      </div>

      {err ? <div style={{ color: "#EF4444" }}>Error: {err}</div> : null}

      <div style={{ overflowX: "auto", border: "1px solid #eee", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa" }}>
              <th style={th}>When</th>
              <th style={th}>Lead</th>
              <th style={th}>Trade</th>
              <th style={th}>City</th>
              <th style={th}>Notes</th>
              <th style={th}>CPL</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 14, textAlign: "center", color: "#666" }}>
                  Inbox empty.
                </td>
              </tr>
            ) : (
              data.map((lead) => (
                <tr key={lead.id} style={{ borderTop: "1px solid #f2f2f2" }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{fmtDate(lead.createdAt)}</div>
                    <div style={{ color: "#666", fontSize: 12 }}>{lead.id}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{lead.name}</div>
                    <div style={{ fontSize: 13 }}>
                      {lead.phone ? (
                        <>
                          <a href={`tel:${lead.phone}`} style={{ textDecoration: "none" }}>{lead.phone}</a>{" · "}
                          <a href={stripeSearchUrl(lead.phone)} target="_blank">Stripe search</a>
                        </>
                      ) : "—"}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {lead.email ? (
                        <>
                          <a href={`mailto:${lead.email}`} style={{ textDecoration: "none" }}>{lead.email}</a>{" · "}
                          <a href={stripeSearchUrl(lead.email)} target="_blank">Stripe search</a>
                        </>
                      ) : "—"}
                    </div>
                  </td>
                  <td style={td}>{lead.trade}</td>
                  <td style={td}>{lead.city || "—"} {lead.zip ? `(${lead.zip})` : ""}</td>
                  <td style={td}>{lead.description || "—"}</td>
                  <td style={td}>{typeof lead.cplDkk === "number" ? `${lead.cplDkk} kr` : "—"}</td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => assign(lead.id)}
                        title="Mark valid and assign (v0: removes from inbox)"
                        style={btn}
                      >
                        Valid → assign
                      </button>
                      <button
                        onClick={() => setOpenBad(lead.id === openBad ? null : lead.id)}
                        style={btnDanger}
                        title="Queue bad-lead refund"
                      >
                        Bad lead
                      </button>
                    </div>

                    {openBad === lead.id && (
                      <div style={{ marginTop: 8, padding: 8, border: "1px solid #f3f4f6", borderRadius: 8, background: "#fffaf7" }}>
                        <div style={{ marginBottom: 6 }}>
                          <label style={{ display: "block", marginBottom: 4 }}>Reason</label>
                          <select value={reason} onChange={(e) => setReason(e.target.value)} style={input}>
                            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: 4 }}>Short note (optional)</label>
                          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} style={textarea} />
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button onClick={() => queueBadLead(lead)} style={btnDanger}>Queue refund</button>
                          <button onClick={() => setOpenBad(null)} style={btnLight}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Refund queue preview inline */}
      <div style={{ marginTop: 12 }}>
        <h3 style={{ margin: "12px 0 6px 0" }}>Queued refund requests ({queue.items.length})</h3>
        {queue.items.length === 0 ? (
          <div style={{ color: "#666" }}>No items queued.</div>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {queue.items.map((t) => (
              <li key={t.id} style={{ marginBottom: 6 }}>
                <strong>{t.leadId}</strong> · {t.reason}
                {t.note ? ` · ${t.note}` : ""} · {t.name || "—"} ({t.email || "—"}, {t.phone || "—"}) ·{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); queue.remove(t.id); }}>remove</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "10px 12px", fontWeight: 700, fontSize: 13, color: "#444" };
const td: React.CSSProperties = { padding: "10px 12px", verticalAlign: "top", fontSize: 14 };
const btn: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #ddd",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
};
const btnLight: React.CSSProperties = { ...btn, background: "#fff" };
const btnDanger: React.CSSProperties = { ...btn, borderColor: "#fca5a5", color: "#b91c1c", background: "#fff" };
const input: React.CSSProperties = { padding: 8, border: "1px solid #ddd", borderRadius: 8, width: "100%" };
const textarea: React.CSSProperties = { ...input, minHeight: 70 };
