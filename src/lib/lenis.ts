import type Lenis from "lenis";

/**
 * Module-level handle so nav links and CTAs can drive the same Lenis instance
 * without threading it through context.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}

/** Smooth-scrolls to an element id, falling back to native scroll. */
export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: -8 });
    return;
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
