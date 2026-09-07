"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  to: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
};

/** Counts from zero to `to` once, the first time it scrolls into view. */
export function CountUp({ to, suffix = "", decimals = 0, duration = 1200 }: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      setValue(to);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo — fast out of the gate, gentle landing.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(to * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [inView, to, duration, reducedMotion]);

  return (
    <span ref={ref} className="mono">
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
