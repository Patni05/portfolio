import { profile } from "@/data/profile";
import { education } from "@/data/education";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { Terminal } from "@/components/ui/Terminal";
import { EducationVisual } from "./EducationVisual";

export function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-heading">
      <div className="shell">
        <SectionLabel index="01" label="about" />

        <div className="about__grid">
          <div className="about__prose">
            <h2 id="about-heading" className="section__heading">
              Building things end to end.
            </h2>
            {profile.about.map((paragraph, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="about__paragraph">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="about__terminal" delay={120}>
            <Terminal />
          </Reveal>
        </div>

        <ul className="stats" aria-label="At a glance">
          {profile.stats.map((stat, i) => (
            <Reveal as="li" key={stat.label} delay={i * 90} className="stats__item">
              <span className="stats__value">
                <CountUp
                  to={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </span>
              <span className="stats__label">{stat.label}</span>
            </Reveal>
          ))}
        </ul>

        <div id="education" className="timeline">
          <h3 className="timeline__heading mono">Education</h3>
          <div className="timeline__layout">
          <ol className="timeline__list">
            {education.map((entry, i) => (
              <Reveal
                as="li"
                key={`${entry.institution}-${entry.period}`}
                delay={i * 110}
                className="timeline__item"
              >
                <div className="timeline__marker" aria-hidden="true" />
                <div className="timeline__content">
                  <div className="timeline__row">
                    <h4 className="timeline__institution">
                      {entry.institution}
                    </h4>
                    <span className="timeline__period mono">
                      {entry.period}
                    </span>
                  </div>
                  <p className="timeline__qualification">
                    {entry.qualification}
                  </p>
                  <p className="timeline__meta mono">
                    {entry.result} · {entry.place}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal className="timeline__visual" delay={120}>
            <EducationVisual />
          </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
