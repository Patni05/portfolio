export const profile = {
  name: "Bhupesh Patni",
  handle: "bhupesh_patni",
  role: "Full-Stack Developer",
  location: "Dehradun, Uttarakhand, India",
  locationShort: "Dehradun, Uttarakhand, IN",
  email: "patnibhupesh2@gmail.com",
  github: "https://github.com/Patni05",
  githubLabel: "github.com/Patni05",
  linkedin: "https://linkedin.com/in/bhupeshpatni",
  linkedinLabel: "linkedin.com/in/bhupeshpatni",

  tagline:
    "BCA graduate building full-stack products, real-time collaborative tools, and fine-tuned speech models.",

  /** Cycled by the hero typewriter. */
  roles: [
    "Full-Stack Developer",
    "Next.js & React",
    "Node · PostgreSQL · Prisma",
    "AI / TTS Fine-Tuning",
    "Cloudflare Workers",
  ],

  about: [
    "I'm a BCA graduate from Graphic Era Hill University, Dehradun, with a CGPA of 8.5+. I build full-stack web applications end to end — from Postgres schemas and REST APIs to the interaction details in the browser.",
    "My work spans a multi-role grocery delivery platform, an infinite real-time collaborative whiteboard, and a fine-tuned Hindi text-to-speech model trained on 80+ GB of speech data. I like problems where architecture matters: plugin systems that stay extensible, dashboards that stay fast, and pipelines that stay reproducible.",
    "Right now I'm looking for a role where I can ship real product and keep going deeper on systems and AI.",
  ],

  /** Rendered by the About terminal card, typed out line by line. */
  terminal: [
    { key: "role", value: "Full-Stack Developer", type: "string" },
    { key: "location", value: "Dehradun, Uttarakhand, IN", type: "string" },
    {
      key: "education",
      value: "BCA @ Graphic Era Hill University (2023-2026)",
      type: "string",
    },
    { key: "cgpa", value: "8.5+", type: "string" },
    {
      key: "focus",
      value: ["Next.js", "Node.js", "PostgreSQL", "AI/TTS"],
      type: "array",
    },
    { key: "currently", value: "Looking for full-time SDE roles", type: "string" },
    {
      key: "open_to",
      value: ["Full-time", "Internship", "Freelance"],
      type: "array",
    },
  ] as const,

  stats: [
    { value: 8.5, suffix: "+", label: "CGPA", decimals: 1 },
    { value: 3, suffix: "", label: "Major Projects", decimals: 0 },
    { value: 80, suffix: "GB+", label: "Speech Data Trained", decimals: 0 },
    { value: 10, suffix: "+", label: "Technologies", decimals: 0 },
  ],
} as const;

export type TerminalLine = (typeof profile.terminal)[number];
