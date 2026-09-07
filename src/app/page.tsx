import { getResumeHref } from "@/lib/resume";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/about/About";
import { Skills } from "@/components/skills/Skills";
import { Work } from "@/components/work/Work";
import { Achievements } from "@/components/achievements/Achievements";
import { Contact } from "@/components/contact/Contact";

export default function Home() {
  const resumeHref = getResumeHref();

  return (
    <>
      <Hero resumeHref={resumeHref} />
      <About />
      <hr className="rule" />
      <Skills />
      <hr className="rule" />
      <Work />
      <hr className="rule" />
      <Achievements />
      <hr className="rule" />
      <Contact />
    </>
  );
}
