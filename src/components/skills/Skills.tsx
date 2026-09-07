import { skillGroups } from "@/data/skills";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TechChip } from "@/components/ui/TechChip";

export function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-heading">
      <div className="shell">
        <SectionLabel index="02" label="skills" />

        <h2 id="skills-heading" className="section__heading">
          The toolkit.
        </h2>
        <p className="section__lede">
          Grouped by what they actually do — no proficiency bars, because nobody
          believes them.
        </p>

        <div className="skills__grid">
          {skillGroups.map((group, groupIndex) => (
            <Reveal
              key={group.label}
              delay={groupIndex * 60}
              variant="scale"
              className="skills__group card"
            >
              <h3 className="skills__group-label mono">{group.label}</h3>
              <ul className="skills__chips">
                {group.items.map((item) => (
                  <li key={item}>
                    <TechChip name={item} />
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
