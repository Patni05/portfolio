"use client";

import { useMagneticHover } from "@/hooks/useMagneticHover";

type Props = {
  href: string;
  label: string;
  children: React.ReactNode;
  external?: boolean;
  disabled?: boolean;
};

/** Icon link that drifts toward the cursor while hovered. */
export function SocialIcon({
  href,
  label,
  children,
  external = false,
  disabled = false,
}: Props) {
  const ref = useMagneticHover<HTMLAnchorElement>(4, disabled);

  return (
    <a
      ref={ref}
      href={href}
      aria-label={label}
      title={label}
      className="social-icon"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
