import React, { useEffect, useMemo, useRef, useState } from "react";

export function AnimatedCounter({
  value,
  format = (v) => `${v}`,
  durationMs = 650,
  className = "",
}: {
  value: number;
  format?: (v: number) => string;
  durationMs?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prevValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  const formatter = useMemo(() => format, [format]);

  useEffect(() => {
    const from = prevValueRef.current;
    const to = value;

    if (from === to) {
      setDisplay(to);
      return;
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;
      setDisplay(next);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    prevValueRef.current = value;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <span className={className}>{formatter(Math.round(display))}</span>;
}