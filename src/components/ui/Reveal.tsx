"use client";

import { createElement } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * `up`    — fade + translateY (the default)
 * `scale` — fade + a slight 0.98 → 1 scale, for cards
 * `fade`  — opacity only, where movement would be distracting
 */
export type RevealVariant = "up" | "scale" | "fade";

type Props = {
  children: React.ReactNode;
  /** ms added before this element animates — use to stagger siblings. */
  delay?: number;
  variant?: RevealVariant;
  className?: string;
  as?: "div" | "li" | "article" | "section" | "span";
};

/** Fades its children in the first time they enter the viewport. */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  className = "",
  as: Tag = "div",
}: Props) {
  const { ref, inView } = useInView<HTMLElement>(0.12, "0px 0px -6% 0px");

  // createElement keeps this polymorphic without needing a ref type that is
  // the intersection of every allowed tag.
  return createElement(
    Tag,
    {
      ref,
      className: `reveal ${className}`.trim(),
      "data-visible": inView ? "true" : "false",
      "data-variant": variant,
      style: { ["--reveal-delay" as string]: `${delay}ms` },
    },
    children,
  );
}
