"use client";

import { useEffect, useState } from "react";
import { frameState } from "@/lib/frameState";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Starts as `true` on the server and the first client frame so that no
 * animation can fire before we know the visitor's preference — the reduced
 * path shows all content immediately, which is the safe default to flash.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const apply = () => {
      setReduced(mq.matches);
      frameState.reducedMotion = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return reduced;
}
