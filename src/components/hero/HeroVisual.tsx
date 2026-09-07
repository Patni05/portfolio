"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * The hero's companion visual: a slowly drifting node graph with a few code
 * fragments floating in front of it.
 *
 * Deliberately NOT in the fixed WebGL background — it lives in its own grid
 * column, so it can never overlap the name, it stacks predictably on mobile,
 * and it costs one small 2D canvas instead of a second GL scene.
 *
 * Performance notes:
 *  - Theme colours are read ONCE per theme change. Calling getComputedStyle
 *    inside the draw loop forces a style recalculation every single frame.
 *  - Capped at ~30 fps. The drift is slow enough that 60 fps buys nothing and
 *    costs twice the CPU.
 *  - Stops completely when scrolled out of view or when the tab is hidden.
 */

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Larger nodes sit "closer" and parallax further. */
  depth: number;
};

const NODE_COUNT = 20;
const LINK_DISTANCE = 0.34;
const FRAME_MS = 1000 / 30;

/** Code fragments, positioned as percentages of the panel. */
const FRAGMENTS = [
  { text: "const dev = {", left: 4, top: 12, delay: 0 },
  { text: "stack: 'full'", left: 20, top: 33, delay: 0.9 },
  { text: "await db.query()", left: 44, top: 66, delay: 1.8 },
  { text: "}", left: 8, top: 86, delay: 2.6 },
];

export function HeroVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Node[]>([]);
  const pointer = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const colors = useRef({ accent: "#4f8dff", accent3: "#a855f7" });
  const raf = useRef(0);
  const lastDraw = useRef(0);
  const onScreen = useRef(true);

  const reducedMotion = useReducedMotion();
  const { theme } = useTheme();

  // Read the palette once per theme change, never inside the loop.
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    colors.current = {
      accent: styles.getPropertyValue("--accent").trim() || "#4f8dff",
      accent3: styles.getPropertyValue("--accent-3").trim() || "#a855f7",
    };
  }, [theme]);

  const seed = useCallback((count: number) => {
    // Deterministic layout so it looks identical on every load.
    let s = 991;
    const rnd = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    nodes.current = Array.from({ length: count }, () => {
      const depth = 0.35 + rnd() * 0.65;
      return {
        x: rnd(),
        y: rnd(),
        vx: (rnd() - 0.5) * 0.00016,
        vy: (rnd() - 0.5) * 0.00016,
        r: 1.2 + depth * 2.1,
        depth,
      };
    });
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const { accent, accent3 } = colors.current;
    ctx.clearRect(0, 0, w, h);

    // Damped pointer parallax.
    pointer.current.x += (pointer.current.tx - pointer.current.x) * 0.08;
    pointer.current.y += (pointer.current.ty - pointer.current.y) * 0.08;

    const list = nodes.current;
    const px = pointer.current.x;
    const py = pointer.current.y;

    // Screen positions first, so links and dots agree.
    const points = list.map((n) => ({
      sx: (n.x + px * n.depth * 0.05) * w,
      sy: (n.y + py * n.depth * 0.05) * h,
      r: n.r * dpr,
      depth: n.depth,
    }));

    // Links.
    ctx.lineWidth = Math.max(1, dpr * 0.75);
    ctx.strokeStyle = accent;
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = (points[i].sx - points[j].sx) / w;
        const dy = (points[i].sy - points[j].sy) / h;
        const dist = Math.hypot(dx, dy);
        if (dist > LINK_DISTANCE) continue;
        // Fade the line out as the pair separates.
        ctx.globalAlpha = (1 - dist / LINK_DISTANCE) * 0.24;
        ctx.beginPath();
        ctx.moveTo(points[i].sx, points[i].sy);
        ctx.lineTo(points[j].sx, points[j].sy);
        ctx.stroke();
      }
    }

    // Nodes.
    for (const point of points) {
      ctx.globalAlpha = 0.3 + point.depth * 0.6;
      ctx.fillStyle = point.depth > 0.8 ? accent3 : accent;
      ctx.beginPath();
      ctx.arc(point.sx, point.sy, point.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    seed(NODE_COUNT);
    render();

    if (reducedMotion) return;

    const step = (now: number) => {
      raf.current = requestAnimationFrame(step);

      // Throttle to ~30 fps and skip entirely when not visible.
      if (!onScreen.current || document.visibilityState === "hidden") return;
      if (now - lastDraw.current < FRAME_MS) return;
      lastDraw.current = now;

      for (const n of nodes.current) {
        n.x += n.vx;
        n.y += n.vy;
        // Bounce softly at the edges rather than wrapping, so links persist.
        if (n.x < 0.04 || n.x > 0.96) n.vx *= -1;
        if (n.y < 0.04 || n.y > 0.96) n.vy *= -1;
      }
      render();
    };
    raf.current = requestAnimationFrame(step);

    const onResize = () => render();
    window.addEventListener("resize", onResize);

    // Stop drawing once the hero is scrolled past.
    let observer: IntersectionObserver | undefined;
    const el = wrapRef.current;
    if (el && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          onScreen.current = entry.isIntersecting;
        },
        { rootMargin: "120px" },
      );
      observer.observe(el);
    }

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, [reducedMotion, render, seed]);

  // Redraw immediately on theme change so colours never lag behind.
  useEffect(() => {
    render();
  }, [theme, render]);

  // Pointer parallax, scoped to the panel.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reducedMotion) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.current.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.current.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      pointer.current.tx = 0;
      pointer.current.ty = 0;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="hero-visual" aria-hidden="true">
      <div className="hero-visual__glow" />
      <canvas ref={canvasRef} className="hero-visual__canvas" />

      <div className="hero-visual__fragments mono">
        {FRAGMENTS.map((fragment) => (
          <span
            key={fragment.text}
            className="hero-visual__fragment"
            style={{
              left: `${fragment.left}%`,
              top: `${fragment.top}%`,
              ["--float-delay" as string]: `${fragment.delay}s`,
            }}
          >
            {fragment.text}
          </span>
        ))}
      </div>

      {/* Thin corner brackets — reads as a viewport/frame without a big shape. */}
      <span className="hero-visual__bracket" data-corner="tl" />
      <span className="hero-visual__bracket" data-corner="br" />
    </div>
  );
}
