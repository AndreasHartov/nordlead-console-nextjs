// components/SLAClock.tsx
"use client";

import { useEffect, useState } from "react";

type SLAState = {
  timeLabel: string;        // e.g., "Mon 10:23:05"
  inSLA: boolean;           // true if within Mon–Fri 09:00–17:00 (Copenhagen)
  statusLabel: string;      // "IN SLA" or "OUT OF SLA"
  helper: string;           // "closes at 17:00" or "opens Mon 09:00"
  color: string;            // "#10B981" (green) / "#EF4444" (red) / "#9CA3AF" (grey)
};

const TZ = "Europe/Copenhagen";
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const OPEN_MIN = 9 * 60;     // 09:00
const CLOSE_MIN = 17 * 60;   // 17:00 (exclusive)

function parts
