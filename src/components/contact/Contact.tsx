"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Github, Linkedin, MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";

/**
 * No contact form: there is no mail backend wired up, and a form that silently
 * discards messages is worse than none. A mailto plus a copy button is honest
 * and works everywhere.
 */
export function Contact() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      return;
    } catch {
      // Async clipboard unavailable or denied — fall through to the legacy path.
    }

    // Legacy fallback: works in insecure contexts and older embedded browsers.
    try {
      const field = document.createElement("textarea");
      field.value = profile.email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      field.style.pointerEvents = "none";
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(field);
      if (copied) setCopied(true);
    } catch {
      // Nothing more to try — the mailto button still works, and the address
      // is visible on screen either way.
    }
  };

  return (
    <section id="contact" className="section" aria-labelledby="contact-heading">
      <div className="shell contact">
        <SectionLabel index="05" label="contact" />

        <Reveal>
          <h2 id="contact-heading" className="contact__heading">
            Let&apos;s build something.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <p className="contact__lede">
            Open to full-time roles, internships, and freelance work. Usually
            reply within a day.
          </p>
        </Reveal>

        <Reveal delay={160}>
          <div className="contact__actions">
            <LinkButton
              href={`mailto:${profile.email}`}
              variant="primary"
              className="btn--lg"
            >
              {profile.email}
            </LinkButton>

            <button
              type="button"
              onClick={copy}
              className="btn btn--outline btn--lg"
              aria-label={copied ? "Email address copied" : "Copy email address"}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <ul className="contact__links mono">
            <li>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">
                <Github size={15} aria-hidden="true" />
                {profile.githubLabel}
              </a>
            </li>
            <li>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={15} aria-hidden="true" />
                {profile.linkedinLabel}
              </a>
            </li>
            <li>
              <span>
                <MapPin size={15} aria-hidden="true" />
                {profile.location}
              </span>
            </li>
          </ul>
        </Reveal>

        {/* Politeness announcement for the copy action. */}
        <p className="sr-only" role="status" aria-live="polite">
          {copied ? "Email address copied to clipboard" : ""}
        </p>
      </div>
    </section>
  );
}
