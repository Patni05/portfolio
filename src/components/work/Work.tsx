import { projects } from "@/data/projects";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProjectRow } from "./ProjectRow";

export function Work() {
  return (
    <section id="work" className="section" aria-labelledby="work-heading">
      <div className="shell">
        <SectionLabel index="03" label="work" />

        <h2 id="work-heading" className="section__heading">
          Selected work.
        </h2>
        <p className="section__lede">
          Three projects, built end to end — a delivery platform, a
          collaborative canvas, and a fine-tuned speech model.
        </p>

        <div className="work__list">
          {projects.map((project, index) => (
            <ProjectRow key={project.slug} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
