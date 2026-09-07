"use client";

import { useEffect, useState } from "react";
import { Download, Menu, X } from "lucide-react";
import { scrollToId } from "@/lib/lenis";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { EffectsToggle } from "@/components/ui/EffectsToggle";

const LINKS = [
  { id: "about", label: "about" },
  { id: "skills", label: "skills" },
  { id: "work", label: "work" },
  { id: "contact", label: "contact" },
];

export function Nav({ resumeHref }: { resumeHref: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section indicator. One observer over the sections, choosing the
  // entry closest to the top of the viewport rather than the largest — that
  // keeps the highlight stable through tall sections.
  useEffect(() => {
    const sections = LINKS.map((link) =>
      document.getElementById(link.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Bias the band toward the upper-middle of the viewport.
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll while the mobile overlay is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // Wait a frame so the overflow lock is released before Lenis scrolls.
    requestAnimationFrame(() => scrollToId(id));
  };

  return (
    <header className="nav" data-scrolled={scrolled ? "true" : "false"}>
      <div className="shell nav__inner">
        <a
          href="#top"
          className="nav__brand mono"
          onClick={(event) => {
            event.preventDefault();
            go("top");
          }}
        >
          <span className="nav__brand-sigil">~/</span>bhupesh
        </a>

        <nav className="nav__links mono" aria-label="Sections">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              data-active={active === link.id ? "true" : "false"}
              aria-current={active === link.id ? "true" : undefined}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey) return;
                event.preventDefault();
                go(link.id);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          {resumeHref ? (
            <a
              href={resumeHref}
              className="btn btn--outline btn--sm nav__resume"
              download=""
            >
              <Download size={14} aria-hidden="true" />
              Resume
            </a>
          ) : null}
          <EffectsToggle />
          <ThemeToggle />
          <button
            type="button"
            className="nav__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="nav__overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <nav className="nav__overlay-links mono">
            {LINKS.map((link, i) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                style={{ ["--i" as string]: String(i) }}
                onClick={(event) => {
                  event.preventDefault();
                  go(link.id);
                }}
              >
                <span className="nav__overlay-index">0{i + 1}</span>
                {link.label}
              </a>
            ))}
            {resumeHref ? (
              <a
                href={resumeHref}
                download=""
                style={{ ["--i" as string]: String(LINKS.length) }}
                onClick={() => setOpen(false)}
              >
                <span className="nav__overlay-index">05</span>
                resume
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
