// components/SLAClock.tsx
"use client";

import { useEffect, useState } from "react";

type SLAState = {
  timeLabel: string;   // "Mon 10:23:05"
  inSLA: boolean;      // true if within Mon–Fri 09:00–17:00 Copenhagen
  statusLabel: string; // "IN SLA" / "OUT OF SLA"
  helper: string;      // "closes at 17:00" / "opens Mon 09:00" / "opens today 09:00"
  color: string;       // green/red/grey
};

const TZ = "Europe/Copenhagen";
const OPEN_MIN = 9 * 60;   // 09:00
const CLOSE_MIN = 17 * 60; // 17:00 (exclusive)
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getCphParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const second = Number(get("second"));
  const weekday = get("weekday"); // "Mon"
  const label = `${weekday} ${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}:${String(second).padStart(2, "0")}`;
  return { hour, minute, second, weekday, label };
}

function computeState(now = new Date()): SLAState {
  const p = getCphParts(now);
  const dayIdx = weekdays.indexOf(p.weekday); // 0..6 (Sun..Sat)
  const isWeekday = dayIdx >= 1 && dayIdx <= 5;
  const minutes = p.hour * 60 + p.minute;

  const inSLA = isWeekday && minutes >= OPEN_MIN && minutes < CLOSE_MIN;

  let statusLabel = inSLA ? "IN SLA" : "OUT OF SLA";
  let color = inSLA ? "#10B981" : "#EF4444"; // green / red
  let helper = "";

  if (inSLA) {
    helper = "closes at 17:00";
  } else {
    // outside SLA
    if (isWeekday && minutes < OPEN_MIN) {
      helper = "opens today 09:00";
      color = "#9CA3AF"; // before open -> grey
    } else {
      // after close or weekend
      let nextIdx: number;
      if (isWeekday && minutes >= CLOSE_MIN) {
        // after close today
        nextIdx = dayIdx === 5 ? 1 : dayIdx + 1; // Fri -> Mon, else next day
      } else {
        // weekend -> next Monday
        nextIdx = 1; // Mon
      }
      const nextDay = weekdays[nextIdx];
      helper = `opens ${nextDay} 09:00`;
      if (!isWeekday) color = "#9CA3AF"; // weekend -> grey
    }
  }

  return {
    timeLabel: p.label,
    inSLA,
    statusLabel,
    helper,
    color,
  };
}

export default function SLAClock() {
  const [state, setState] = useState<SLAState>(() => computeState());

  useEffect(() => {
    const id = setInterval(() => setState(computeState()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 10,
        padding: "14px 16px",
        background: "#fff",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: state.color,
            boxShadow: `0 0 0 3px ${state.color}22`,
          }}
        />
        <strong>Status:</strong>
        <span>{state.statusLabel}</span>
        <span style={{ color: "#666", marginLeft: 8 }}>({state.helper})</span>
      </div>

      <div style={{ color: "#111" }}>
        <strong>Now (Copenhagen):</strong> {state.timeLabel}
      </div>

      <div style={{ color: "#666", fontSize: 14 }}>
        SLA window: <strong>Mon–Fri, 09:00–17:00</strong> (Europe/Copenhagen)
      </div>
    </div>
  );
}
