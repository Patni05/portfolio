/**
 * Mutable state shared between the DOM scroll/pointer listeners and the r3f
 * render loop.
 *
 * This is deliberately NOT React state. Driving the 3D scene from React
 * re-renders on every scroll frame is the single biggest source of jank in a
 * scroll-linked WebGL page, so the listeners write here and `useFrame` reads
 * here — no reconciliation in between.
 */
export const frameState = {
  /** Normalised page scroll progress, 0 at the top, 1 at the bottom. */
  progress: 0,
  /** Pointer position in normalised device coords, -1..1. */
  pointerX: 0,
  pointerY: 0,
  /** Set while the page is hidden or the hero canvas is scrolled out of view. */
  paused: false,
  /** True when the visitor prefers reduced motion; the scene freezes. */
  reducedMotion: false,
};

export function setProgress(value: number) {
  frameState.progress = Math.min(1, Math.max(0, value));
}
