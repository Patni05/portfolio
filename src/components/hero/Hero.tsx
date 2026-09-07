"use client";

import { ChevronDown, Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTypewriter } from "@/hooks/useTypewriter";
import { LinkButton, ScrollButton } from "@/components/ui/Button";
import { SocialIcon } from "./SocialIcon";
import { HeroVisual } from "./HeroVisual";

/**
 * The entrance animation is pure CSS, released by `data-hero-ready` on <html>
 * (set by the intro overlay, or immediately when the intro is skipped). Each
 * element carries its own `--enter-delay`, which keeps the stagger declarative
 * and costs no animation library.
 */
export function Hero({ resumeHref }: { resumeHref: string | null }) {
  const reducedMotion = useReducedMotion();

  const prompt = useTypewriter(["whoami"], {
    typeSpeed: 55,
    startDelay: 1000,
    loop: false,
    disabled: reducedMotion,
  });

  const roles = useTypewriter(profile.roles, {
    typeSpeed: 45,
    deleteSpeed: 22,
    holdDelay: 1900,
    startDelay: 1500,
    disabled: reducedMotion,
  });

  return (
    <section id="top" className="hero" aria-labelledby="hero-name">
      <div className="shell hero__grid">
        <div className="hero__content">
          <p className="hero__prompt mono" style={enter(0)}>
            <span className="hero__sigil">$</span> {prompt.text}
            {prompt.done ? null : <span className="caret" />}
            {prompt.done ? (
              <span className="hero__prompt-out">
                {" "}
                <span className="hero__sigil">&gt;</span> {profile.handle}
              </span>
            ) : null}
          </p>

          <h1 id="hero-name" className="hero__name" style={enter(80)}>
            <span className="hero__name-line">Bhupesh</span>
            <span className="hero__name-line">Patni</span>
          </h1>

          {/* Technical stack label, not a headline. */}
          <p className="hero__stack mono" style={enter(200)}>
            <span className="hero__stack-dot" aria-hidden="true" />
            <span className="hero__stack-text">{roles.text}</span>
            <span className="caret caret--sm" />
          </p>

          <p className="hero__tagline" style={enter(300)}>
            {profile.tagline}
          </p>

          <div className="hero__actions" style={enter(400)}>
            <ScrollButton targetId="work" variant="primary">
              View Work
            </ScrollButton>
            {/* Only rendered once public/resume.pdf exists — no placeholder,
                because an inert button in the hero is worse than no button. */}
            {resumeHref ? (
              <LinkButton href={resumeHref} variant="outline" download>
                Download Resume
              </LinkButton>
            ) : null}
          </div>

          <ul className="hero__socials" style={enter(500)}>
            <li>
              <SocialIcon
                href={profile.github}
                label="GitHub profile"
                external
                disabled={reducedMotion}
              >
                <Github size={17} aria-hidden="true" />
              </SocialIcon>
            </li>
            <li>
              <SocialIcon
                href={profile.linkedin}
                label="LinkedIn profile"
                external
                disabled={reducedMotion}
              >
                <Linkedin size={17} aria-hidden="true" />
              </SocialIcon>
            </li>
            <li>
              <SocialIcon
                href={`mailto:${profile.email}`}
                label={`Email ${profile.email}`}
                disabled={reducedMotion}
              >
                <Mail size={17} aria-hidden="true" />
              </SocialIcon>
            </li>
          </ul>
        </div>

        {/* Its own column, so it can never overlap the name. */}
        <div className="hero__visual-col" style={enter(320)}>
          <HeroVisual />
        </div>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true" style={enter(700)}>
        <ChevronDown size={16} />
      </div>
    </section>
  );
}

/** Per-element entrance delay. */
function enter(ms: number): React.CSSProperties {
  return { ["--enter-delay" as string]: `${ms}ms` };
}
