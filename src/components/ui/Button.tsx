"use client";

import { ArrowUpRight } from "lucide-react";
import { scrollToId } from "@/lib/lenis";

type Variant = "primary" | "outline" | "ghost";

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

function classesFor(variant: Variant, extra = "") {
  return `btn btn--${variant} ${extra}`.trim();
}

/** Links to another page or an external URL. */
export function LinkButton({
  href,
  external = false,
  children,
  variant = "primary",
  className,
  download,
}: CommonProps & {
  href: string;
  external?: boolean;
  download?: boolean;
}) {
  return (
    <a
      href={href}
      className={classesFor(variant, className)}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...(download ? { download: "" } : {})}
    >
      {children}
      {external ? (
        <ArrowUpRight size={15} className="btn__arrow" aria-hidden="true" />
      ) : null}
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}

/** Scrolls to a section on this page through Lenis. */
export function ScrollButton({
  targetId,
  children,
  variant = "primary",
  className,
}: CommonProps & { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={classesFor(variant, className)}
      onClick={(event) => {
        // Let modified clicks (new tab, etc.) behave normally.
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        scrollToId(targetId);
      }}
    >
      {children}
    </a>
  );
}

/**
 * Placeholder for a link whose URL has not been supplied yet. Rendered as a
 * disabled control rather than a dead <a>, so nothing looks clickable when it
 * is not.
 */
export function PendingButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`btn btn--outline btn--pending ${className ?? ""}`.trim()}
      aria-disabled="true"
      title="Link coming soon"
    >
      {children}
    </span>
  );
}
