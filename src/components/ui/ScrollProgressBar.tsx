"use client";

/**
 * Top-of-page progress bar. Driven entirely by the `--scroll-progress` custom
 * property that the scroll listener writes onto <html>, so scrolling never
 * re-renders React here.
 */
export function ScrollProgressBar() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 70,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "var(--accent)",
          transform: "scaleX(var(--scroll-progress, 0))",
          transformOrigin: "0 50%",
        }}
      />
    </div>
  );
}
