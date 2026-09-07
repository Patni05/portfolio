"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCapabilities } from "@/hooks/useCapabilities";
import { useEffectsSetting } from "@/components/providers/EffectsProvider";
import { FallbackBackground } from "./FallbackBackground";

/**
 * The WebGL scene is client-only and code-split, so the page text renders and
 * is readable before three.js has even been fetched.
 */
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Waits until the browser is actually idle before allowing the (large) three.js
 * chunk to be requested. Without this, fetching and parsing it competes with
 * hydration and the hero entrance, which is exactly when the page feels slow.
 */
function useDeferredUntilIdle(delayMs = 1200) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled) setReady(true);
    };

    type WindowWithIdle = Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const win = window as WindowWithIdle;

    if (typeof win.requestIdleCallback === "function") {
      const handle = win.requestIdleCallback(go, { timeout: delayMs + 1500 });
      return () => {
        cancelled = true;
        win.cancelIdleCallback?.(handle);
      };
    }

    const timer = setTimeout(go, delayMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [delayMs]);

  return ready;
}

export function BackgroundLayer() {
  const caps = useCapabilities();
  const idle = useDeferredUntilIdle();
  const { enabled } = useEffectsSetting();

  const useScene =
    enabled && Boolean(caps) && caps!.tier !== "none" && idle;

  return (
    <div className="scene-layer" aria-hidden="true">
      {/* Always painted: it is the backdrop behind the canvas and the sole
          background on devices that never get WebGL. */}
      <FallbackBackground animated={!enabled || caps?.tier === "none"} />
      {useScene ? <Scene /> : null}
    </div>
  );
}
