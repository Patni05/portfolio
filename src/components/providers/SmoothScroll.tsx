"use client";

import { useEffect } from "react";
import { setLenis } from "@/lib/lenis";
import { setProgress } from "@/lib/frameState";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Lenis inertial scrolling, plus the single writer of `frameState.progress`.
 *
 * With reduced motion requested we never construct Lenis at all — native
 * scrolling stays untouched — but we still publish scroll progress so the
 * (frozen) scene and the progress bar stay correct.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const publish = (scroll: number, limit: number) => {
      setProgress(limit > 0 ? scroll / limit : 0);
      document.documentElement.style.setProperty(
        "--scroll-progress",
        String(limit > 0 ? scroll / limit : 0),
      );
    };

    // Reduced motion: plain listener, no scroll hijacking of any kind.
    if (reducedMotion) {
      const onScroll = () => {
        const limit =
          document.documentElement.scrollHeight - window.innerHeight;
        publish(window.scrollY, limit);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    let lenis: Lenis | undefined;
    let raf = 0;
    let cancelled = false;

    // Dynamic import keeps Lenis out of the critical path.
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        // lerp, not duration: a duration-based tween keeps animating for a
        // fixed time after the wheel stops, which is what reads as "floaty"
        // or laggy. A per-frame lerp tracks the input and settles fast.
        lerp: 0.13,
        wheelMultiplier: 1,
        smoothWheel: true,
        // Native scrolling on touch. Smoothing it fights the platform and
        // feels worse than the real thing on every phone.
        syncTouch: false,
      });
      setLenis(lenis);

      lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) => {
        publish(scroll, limit);
      });

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      lenis?.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  return <>{children}</>;
}

type Lenis = import("lenis").default;
