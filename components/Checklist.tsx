// components/Checklist.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { id: string; text: string; done: boolean };

type Props = {
  title?: string;
  storageKey: string;
  initial: Item[];
};

export default function Checklist({ title = "Checklist", storageKey, initial }: Props) {
  const [items, setItems] = useState<Item[]>(initial);
  const [text, setText] = useState("");

  // load once
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items, storageKey]);

  const remaining = useMemo(() => items.filter(i => !i.done).length, [items]);

  const addItem = () => {
    if (!text.trim()) return;
    setItems(prev => [{ id: Date.now() + "-" + Math.random().toString(36).slice(2), text: text.trim(), done: false }, ...prev]);
    setText("");
  };

  const toggle = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const reset = () => setItems(initial);

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <span style={{ fontSize: 12, color: "#666" }}>
          {items.length - remaining}/{items.length} done
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task…"
          style={{ flex: 1, padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button onClick={addItem} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#f7f7f7" }}>
          Add
        </button>
        <button onClick={reset} title="Reset to defaults" style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff" }}>
          Reset
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {items.map((i) => (
          <li key={i.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} />
            <span style={{ textDecoration: i.done ? "line-through" : "none" }}>{i.text}</span>
            <button
              onClick={() => remove(i.id)}
              style={{ marginLeft: "auto", border: "1px solid #eee", background: "#fff", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}
              title="Delete item"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
