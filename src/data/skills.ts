export type SkillGroup = {
  label: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    label: "Languages",
    items: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C"],
  },
  {
    label: "Frontend",
    items: ["React.js", "Next.js", "HTML", "CSS", "Tailwind CSS", "Bootstrap"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Express.js", "REST APIs", "API Integration"],
  },
  {
    label: "Databases",
    items: ["PostgreSQL", "MongoDB", "MySQL", "Prisma ORM"],
  },
  {
    label: "DevOps & Cloud",
    items: [
      "Docker",
      "Linux",
      "Cloudflare Workers",
      "Cloudflare Tunnel",
      "Deployment & Hosting",
    ],
  },
  {
    label: "Automation & Testing",
    items: [
      "Bash Scripting",
      "Python Automation",
      "Selenium",
      "Apache JMeter",
      "Postman",
    ],
  },
  {
    label: "AI / ML",
    items: [
      "Model Training",
      "Fine-Tuning",
      "Dataset Preparation",
      "F5-TTS",
    ],
  },
  { label: "Tools", items: ["Git", "GitHub", "VS Code", "Figma"] },
  {
    label: "Core CS",
    items: [
      "DSA",
      "OOP",
      "DBMS",
      "Operating Systems",
      "Computer Networks",
    ],
  },
];
