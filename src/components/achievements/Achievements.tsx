import { Award, ShieldCheck } from "lucide-react";
import { achievements } from "@/data/achievements";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = {
  award: Award,
  shield: ShieldCheck,
} as const;

export function Achievements() {
  return (
    <section
      id="achievements"
      className="section"
      aria-labelledby="achievements-heading"
    >
      <div className="shell">
        <SectionLabel index="04" label="achievements" />

        <h2 id="achievements-heading" className="section__heading">
          Recognition.
        </h2>

        <ul className="achievements">
          {achievements.map((item, i) => {
            const Icon = ICONS[item.icon];
            return (
              <Reveal
                as="li"
                key={item.title}
                delay={i * 110}
                variant="scale"
                className="achievements__item card"
              >
                <span className="achievements__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="achievements__title">{item.title}</h3>
                  <p className="achievements__detail">{item.detail}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
