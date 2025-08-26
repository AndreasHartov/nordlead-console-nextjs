// components/LocalTime.tsx
// FULL FILE — renders an ISO timestamp in the viewer's local timezone.
"use client";

import { useEffect, useState } from "react";

export default function LocalTime({
  iso,
  options,
}: {
  iso: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  const [text, setText] = useState(iso);

  useEffect(() => {
    try {
      const d = new Date(iso);
      const fmt = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZoneName: "short",
        ...options,
      });
      setText(fmt.format(d));
    } catch {
      setText(iso);
    }
  }, [iso, options]);

  return <time dateTime={iso}>{text}</time>;
}
