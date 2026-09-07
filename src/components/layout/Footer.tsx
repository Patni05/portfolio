"use client";

import { useEffect, useState } from "react";

/** Live IST clock — small bit of personality in the footer. */
function IstClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }).format(new Date());

    setTime(format());
    const timer = setInterval(() => setTime(format()), 15_000);
    return () => clearInterval(timer);
  }, []);

  // Renders nothing until mounted, so server and client markup agree.
  if (!time) return null;

  return (
    <span className="footer__clock mono">
      {time} IST
      <span className="footer__pulse" aria-hidden="true" />
    </span>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <p className="footer__credit mono">
          Built with Next.js, three.js &amp; too much coffee — ©{" "}
          {new Date().getFullYear()} Bhupesh Patni
        </p>
        <IstClock />
      </div>
    </footer>
  );
}
