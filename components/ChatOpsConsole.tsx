// components/ChatOpsConsole.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Log = { id: string; role: "user" | "system"; text: string };

const HINT = `Try:
/help
/health
/payouts
/time
/whoami
/echo hello world
/clear`;

function nowIso() {
  return new Date().toISOString();
}
function fmtCopenhagen(d = new Date()) {
  try {
    return new Intl.DateTimeFormat("da-DK", {
      timeZone: "Europe/Copenhagen",
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export default function ChatOpsConsole() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<Log[]>([
    { id: "boot-1", role: "system", text: "ChatOps ready. Type /help" },
  ]);
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);
  const idx = useRef<number>(-1);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [logs.length]);

  const append = useCallback((entry: Log | Log[]) => {
    setLogs((prev) => prev.concat(entry as any));
  }, []);

  const run = useCallback(
    async (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;
      setBusy(true);
      append({ id: `u-${Date.now()}`, role: "user", text: cmd });
      history.current.unshift(cmd);
      idx.current = -1;

      const out = async (text: string) =>
        append({ id: `s-${Date.now()}-${Math.random()}`, role: "system", text });

      try {
        if (cmd === "/help") {
          await out(
            [
              "Commands:",
              "  /help                Show this list",
              "  /health              Call GET /api/health",
              "  /payouts             Call GET /api/finance/payouts",
              "  /time                Show current Copenhagen time",
              "  /whoami              Browser & hint about public IP",
              "  /echo <text>         Repeat your text",
              "  /clear               Clear the screen",
              "",
              "Tips: Use ↑/↓ to navigate history. Press Enter to run.",
            ].join("\n")
          );
        } else if (cmd === "/clear") {
          setLogs([]);
        } else if (cmd.startsWith("/echo ")) {
          await out(cmd.slice(6));
        } else if (cmd === "/time") {
          await out(`Europe/Copenhagen: ${fmtCopenhagen()}`);
        } else if (cmd === "/whoami") {
          const ua = navigator.userAgent;
          await out(
            [
              `User-Agent: ${ua}`,
              "Public IP hint: open https://ifconfig.me or https://ipinfo.io/ip",
            ].join("\n")
          );
        } else if (cmd === "/health") {
          const r = await fetch("/api/health", { cache: "no-store" });
          const j = await r.json().catch(() => ({}));
          await out(
            r.ok
              ? `Health OK\n${JSON.stringify(j, null, 2)}`
              : `Health error HTTP ${r.status}\n${JSON.stringify(j, null, 2)}`
          );
        } else if (cmd === "/payouts") {
          const r = await fetch("/api/finance/payouts", { cache: "no-store" });
          const j = await r.json().catch(() => ({}));
          if (r.ok) {
            const count = Array.isArray(j?.items) ? j.items.length : 0;
            const sum = j?.totals?.amount ?? 0;
            await out(
              [
                `Payouts OK — ${count} item(s), total ${sum} kr`,
                JSON.stringify(j, null, 2),
              ].join("\n")
            );
          } else {
            await out(
              `Payouts error HTTP ${r.status}\n${JSON.stringify(j, null, 2)}`
            );
          }
        } else if (cmd === "/") {
          await out(HINT);
        } else if (cmd.startsWith("/")) {
          await out(`Unknown command: ${cmd}\nType /help`);
        } else {
          await out(`(No command) ${cmd}\nType /help`);
        }
      } catch (e: any) {
        await out(`Error: ${e?.message || e}`);
      } finally {
        setBusy(false);
      }
    },
    [append]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    setInput("");
    run(v);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      if (idx.current + 1 < h.length) idx.current += 1;
      setInput(h[idx.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (idx.current > 0) {
        idx.current -= 1;
        setInput(h[idx.current]);
      } else {
        idx.current = -1;
        setInput("");
      }
    }
  };

  const samples = useMemo(
    () => ["/help", "/health", "/payouts", "/time", "/whoami", "/echo hello"],
    []
  );

  return (
    <div style={wrap}>
      <div style={header}>
        <strong>ChatOps</strong>
        <span style={{ color: "#666" }}> · type /help</span>
      </div>

      <div style={logbox}>
        {logs.map((l) => (
          <div key={l.id} style={l.role === "user" ? rowUser : rowSys}>
            <pre style={pre}>{l.text}</pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {samples.map((s) => (
          <button
            key={s}
            style={chip}
            onClick={() => {
              setInput(s);
              setTimeout(() => run(s), 0);
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} style={form}>
        <input
          placeholder="Type a command… (try /help)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          style={inp}
          autoFocus
        />
        <button type="submit" style={btn} disabled={busy}>
          Run
        </button>
      </form>
    </div>
  );
}

/* ---------- styles ---------- */
const wrap: React.CSSProperties = { maxWidth: 900, margin: "0 auto" };
const header: React.CSSProperties = { padding: "6px 2px", marginBottom: 6 };
const logbox: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 10,
  minHeight: 240,
  maxHeight: 420,
  overflow: "auto",
  padding: 10,
  background: "#fafafa",
};
const rowUser: React.CSSProperties = {
  background: "#eef6ff",
  border: "1px solid #dbeafe",
  borderRadius: 8,
  margin: "6px 0",
};
const rowSys: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 8,
  margin: "6px 0",
};
const pre: React.CSSProperties = {
  margin: 0,
  padding: 10,
  whiteSpace: "pre-wrap",
  fontFamily:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  fontSize: 13,
};
const form: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center" };
const inp: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
};
const btn: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #ddd",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
};
const chip: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #ddd",
  borderRadius: 999,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
};
