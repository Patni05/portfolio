"use client";

import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { TechChip } from "@/components/ui/TechChip";
import { LinkButton, PendingButton } from "@/components/ui/Button";
import { DashboardVisual } from "./DashboardVisual";
import { ScribbleCanvas } from "./ScribbleCanvas";
import { Waveform } from "./Waveform";

function Visual({ project }: { project: Project }) {
  switch (project.visual) {
    case "scribble":
      return <ScribbleCanvas />;
    case "waveform":
      return <Waveform src={project.audio} />;
    default:
      return <DashboardVisual />;
  }
}

/**
 * One project. The visual column is `position: sticky` rather than
 * ScrollTrigger-pinned: it reads the same but does not need a scroller proxy to
 * cooperate with Lenis, and it cannot leave the page in a broken pinned state
 * on resize.
 */
export function ProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const flipped = index % 2 === 1;
  const headingId = `project-${project.slug}`;

  return (
    <article
      className="project"
      data-flipped={flipped ? "true" : "false"}
      aria-labelledby={headingId}
    >
      <Reveal className="project__visual-col" variant="scale">
        <div className="project__visual card">
          <Visual project={project} />
        </div>
      </Reveal>

      <div className="project__detail">
        <Reveal>
          <div className="project__head">
            <span className="project__year mono">{project.year}</span>
            <h3 id={headingId} className="project__name">
              {project.name}
            </h3>
            <p className="project__tagline">{project.tagline}</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <ul className="project__tech" aria-label="Technologies used">
            {project.tech.map((tech) => (
              <li key={tech}>
                <TechChip name={tech} small />
              </li>
            ))}
          </ul>
        </Reveal>

        <ul className="project__bullets">
          {project.bullets.map((bullet, i) => (
            <Reveal as="li" key={i} delay={120 + i * 90}>
              <span className="project__bullet-mark mono" aria-hidden="true">
                →
              </span>
              {bullet}
            </Reveal>
          ))}
        </ul>

        <Reveal delay={200}>
          <div className="project__links">
            {(["live", "code"] as const).map((key) => {
              const link = project.links[key];
              if (!link) return null;
              return link.href ? (
                <LinkButton
                  key={key}
                  href={link.href}
                  external
                  variant={key === "live" ? "primary" : "outline"}
                >
                  {link.label}
                </LinkButton>
              ) : (
                <PendingButton key={key}>{link.label} — soon</PendingButton>
              );
            })}
          </div>
        </Reveal>
      </div>
    </article>
  );
}
