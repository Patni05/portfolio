"use client";

import { education } from "@/data/education";
import { useInView } from "@/hooks/useInView";

/**
 * "Learning progression" graphic sitting beside the education timeline.
 *
 * Replaces the empty circular outline that used to float here. It is derived
 * from the real education data — each rung is one qualification, and the rung
 * width tracks the recorded result — so it carries meaning rather than being
 * abstract decoration.
 */

/** Pull the leading number out of "CGPA 8.5+", "88.2%", "83.4%". */
function resultFraction(result: string): number {
  const value = Number.parseFloat(result.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(value)) return 0.6;
  // CGPA is out of 10, percentages out of 100.
  return value <= 10 ? value / 10 : value / 100;
}

const WIDTH = 260;
const HEIGHT = 320;
const PAD_TOP = 34;
const SPINE_X = 42;

export function EducationVisual() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  // Oldest at the bottom, newest at the top — reads as progression upward.
  const rungs = [...education].reverse();
  const gap = (HEIGHT - PAD_TOP * 2) / (rungs.length - 1 || 1);

  return (
    <div
      ref={ref}
      className="eduviz"
      data-visible={inView ? "true" : "false"}
      role="img"
      aria-label="Education progression: Class X, Class XII, then BCA at Graphic Era Hill University."
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="eduviz__svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="eduviz-spine" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="eduviz-rung" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Vertical spine, drawn bottom-to-top. */}
        <line
          className="eduviz__spine"
          x1={SPINE_X}
          y1={HEIGHT - PAD_TOP}
          x2={SPINE_X}
          y2={PAD_TOP}
          stroke="url(#eduviz-spine)"
          strokeWidth="1.5"
        />

        {rungs.map((entry, i) => {
          const y = HEIGHT - PAD_TOP - i * gap;
          const length = 60 + resultFraction(entry.result) * 150;
          return (
            <g
              key={`${entry.institution}-${entry.period}`}
              className="eduviz__group"
              style={{ ["--i" as string]: String(i) }}
            >
              <line
                className="eduviz__rung"
                x1={SPINE_X}
                y1={y}
                x2={SPINE_X + length}
                y2={y}
                stroke="url(#eduviz-rung)"
                strokeWidth="1.25"
              />
              <circle
                className="eduviz__node"
                cx={SPINE_X}
                cy={y}
                r={i === rungs.length - 1 ? 5 : 3.5}
                fill="var(--bg)"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
              <text
                className="eduviz__year"
                x={SPINE_X + length + 8}
                y={y + 3.5}
                fill="var(--text-dim)"
              >
                {entry.period.split("–").pop()?.trim()}
              </text>
              <text
                className="eduviz__result"
                x={SPINE_X + 10}
                y={y - 9}
                fill="var(--accent)"
              >
                {entry.result}
              </text>
            </g>
          );
        })}

        {/* Current stage marker at the top of the spine. */}
        <circle
          className="eduviz__pulse"
          cx={SPINE_X}
          cy={PAD_TOP}
          r="9"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1"
        />
      </svg>

      <p className="eduviz__caption mono">
        <span className="eduviz__caption-dot" aria-hidden="true" />
        graduated · 2026
      </p>
    </div>
  );
}
