"use client";

/**
 * Pure-CSS backdrop. On capable devices it sits behind the WebGL canvas as the
 * base gradient; on phones and low-end hardware it is the entire background,
 * with a few slow CSS-animated motes standing in for the particle field.
 */
export function FallbackBackground({ animated }: { animated: boolean }) {
  return (
    <div className="fallback-bg" aria-hidden="true">
      <div className="fallback-bg__glow fallback-bg__glow--one" />
      <div className="fallback-bg__glow fallback-bg__glow--two" />
      {animated ? (
        <div className="fallback-bg__motes">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} style={{ ["--i" as string]: String(i) }} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
