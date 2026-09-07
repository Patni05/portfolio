"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A miniature of the real thing: the visitor can actually draw here, and the
 * strokes clear when the pointer leaves. Keyboard and touch users are not
 * excluded from anything — it is purely decorative.
 */
export function ScribbleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const reducedMotion = useReducedMotion();
  // Cached: pointermove fires ~60x/sec and getComputedStyle forces a style
  // recalculation each time.
  const strokeColor = useRef("#4f8dff");

  useEffect(() => {
    strokeColor.current =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || "#4f8dff";
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.5;
    }
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = strokeColor.current;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  return (
    <div className="scribble">
      <canvas
        ref={canvasRef}
        className="scribble__canvas"
        aria-hidden="true"
        onPointerDown={(event) => {
          drawing.current = true;
          last.current = point(event);
          setHasDrawn(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!drawing.current || !last.current) return;
          const next = point(event);
          stroke(last.current, next);
          last.current = next;
        }}
        onPointerUp={() => {
          drawing.current = false;
          last.current = null;
        }}
        onPointerLeave={() => {
          drawing.current = false;
          last.current = null;
          if (!reducedMotion) clear();
        }}
      />

      {!hasDrawn ? (
        <p className="scribble__hint mono" aria-hidden="true">
          draw here
        </p>
      ) : null}
    </div>
  );
}
