"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { profile, type TerminalLine } from "@/data/profile";

/** Width of the longest key, so the values align in a column. */
const KEY_WIDTH = Math.max(
  ...profile.terminal.map((line) => line.key.length),
);

function Value({ line }: { line: TerminalLine }) {
  if (line.type === "array") {
    const items = line.value as readonly string[];
    return (
      <>
        <span className="tok-punct">[</span>
        {items.map((item, i) => (
          <span key={item}>
            <span className="tok-string">&quot;{item}&quot;</span>
            {i < items.length - 1 ? (
              <span className="tok-punct">, </span>
            ) : null}
          </span>
        ))}
        <span className="tok-punct">]</span>
      </>
    );
  }
  return <span className="tok-string">&quot;{line.value as string}&quot;</span>;
}

/**
 * Faux terminal that types out a JS object describing Bhupesh, one line at a
 * time, the first time it scrolls into view. Types once only — a loop here
 * would pull attention away from the prose beside it.
 */
export function Terminal() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const reducedMotion = useReducedMotion();
  const total = profile.terminal.length;
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      setRevealed(total);
      return;
    }

    let line = 0;
    const timer = setInterval(() => {
      line += 1;
      setRevealed(line);
      if (line >= total) clearInterval(timer);
    }, 170);

    return () => clearInterval(timer);
  }, [inView, reducedMotion, total]);

  const complete = revealed >= total;

  return (
    <div ref={ref} className="terminal card">
      <div className="terminal__bar">
        <span className="terminal__dot" data-dot="close" />
        <span className="terminal__dot" data-dot="min" />
        <span className="terminal__dot" data-dot="max" />
        <span className="terminal__title mono">bhupesh@portfolio: ~</span>
      </div>

      <pre className="terminal__body mono">
        <code>
          <span className="terminal__line">
            <span className="tok-keyword">const</span>{" "}
            <span className="tok-ident">bhupesh</span>{" "}
            <span className="tok-punct">=</span>{" "}
            <span className="tok-punct">{"{"}</span>
          </span>

          {profile.terminal.map((line, i) => (
            <span
              key={line.key}
              className="terminal__line"
              data-shown={i < revealed ? "true" : "false"}
            >
              {"  "}
              <span className="tok-key">{line.key}</span>
              <span className="tok-punct">:</span>
              {" ".repeat(KEY_WIDTH - line.key.length + 1)}
              <Value line={line} />
              <span className="tok-punct">,</span>
            </span>
          ))}

          <span
            className="terminal__line"
            data-shown={complete ? "true" : "false"}
          >
            <span className="tok-punct">{"}"};</span>
            {complete ? <span className="caret" /> : null}
          </span>
        </code>
      </pre>
    </div>
  );
}
