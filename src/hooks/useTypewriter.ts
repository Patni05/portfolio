"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** ms per character while typing. */
  typeSpeed?: number;
  /** ms per character while deleting. */
  deleteSpeed?: number;
  /** ms to hold a completed string before deleting it. */
  holdDelay?: number;
  /** ms to wait before the first character. */
  startDelay?: number;
  /** Random +/- ms added per character so it reads like a human typing. */
  jitter?: number;
  /** Type once and stop on the last string. */
  loop?: boolean;
  /** When true, jump straight to the final string with no animation. */
  disabled?: boolean;
};

/** Type/delete loop. Returns the text to render plus whether it is mid-type. */
export function useTypewriter(strings: readonly string[], options: Options = {}) {
  const {
    typeSpeed = 40,
    deleteSpeed = 22,
    holdDelay = 1800,
    startDelay = 0,
    jitter = 18,
    loop = true,
    disabled = false,
  } = options;

  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (disabled || strings.length === 0) {
      setText(strings[strings.length - 1] ?? "");
      setDone(true);
      return;
    }

    let stringIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let cancelled = false;

    const wait = (ms: number, fn: () => void) => {
      timer.current = setTimeout(() => {
        if (!cancelled) fn();
      }, Math.max(0, ms));
    };

    const step = () => {
      const current = strings[stringIndex];
      const noise = jitter ? (Math.random() - 0.5) * 2 * jitter : 0;

      if (!deleting) {
        charIndex += 1;
        setText(current.slice(0, charIndex));

        if (charIndex >= current.length) {
          const isLast = stringIndex === strings.length - 1;
          if (!loop && isLast) {
            setDone(true);
            return;
          }
          deleting = true;
          wait(holdDelay, step);
          return;
        }
        wait(typeSpeed + noise, step);
        return;
      }

      charIndex -= 1;
      setText(current.slice(0, charIndex));

      if (charIndex <= 0) {
        deleting = false;
        stringIndex = (stringIndex + 1) % strings.length;
        wait(typeSpeed * 4, step);
        return;
      }
      wait(deleteSpeed + noise, step);
    };

    setDone(false);
    setText("");
    wait(startDelay, step);

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [
    strings,
    typeSpeed,
    deleteSpeed,
    holdDelay,
    startDelay,
    jitter,
    loop,
    disabled,
  ]);

  return { text, done };
}
