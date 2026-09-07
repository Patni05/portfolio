import { workersUrl } from "@/lib/cloudflare";

export type ProjectLink = {
  label: string;
  /** `null` means the URL has not been supplied yet — the button renders disabled. */
  href: string | null;
};

export type Project = {
  slug: string;
  name: string;
  year: string;
  tagline: string;
  tech: string[];
  bullets: string[];
  /** Which decorative visual the project row renders. */
  visual: "dashboard" | "scribble" | "waveform";
  /**
   * Optional sample clip. When a file is dropped in and this path is set, the
   * waveform visual switches from a synthetic loop to a real Web Audio
   * analyser driven by the actual model output.
   */
  audio?: string | null;
  links: { live?: ProjectLink; code?: ProjectLink };
};

export const projects: Project[] = [
  {
    slug: "zeplymart",
    name: "Zeplymart",
    year: "2026",
    tagline: "Full-Stack Multi-Role Grocery Delivery Platform",
    tech: [
      "Next.js 15",
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "PostgreSQL",
      "Prisma",
      "Zod",
      "SWR",
      "Firebase Auth",
      "JWT",
      "bcrypt",
      "Recharts",
      "Google Maps API",
    ],
    bullets: [
      "Full-stack, multi-role grocery delivery platform supporting Customer, Admin, Manager, and Delivery Rider workflows.",
      "Role-based admin and operations dashboards with SWR-powered live data updates and Recharts analytics for orders, delivery activity, and sales performance.",
      "PostgreSQL + Prisma ORM backend with Zod validation and secure auth via Firebase Auth, JWT, and bcrypt.",
      "Integrated Google Maps, Places, and Distance Matrix APIs for address selection, live location tracking, driving-distance calculation, and delivery ETA estimation.",
    ],
    visual: "dashboard",
    links: {
      live: { label: "Live", href: "https://zeplymart.com" },
    },
  },
  {
    slug: "canvasx",
    name: "CanvasX",
    year: "2026",
    tagline: "Real-Time Collaborative Infinite Whiteboard",
    tech: [
      "TypeScript",
      "React",
      "Canvas2D",
      "Cloudflare Workers",
      "Durable Objects",
      "WebSockets",
    ],
    bullets: [
      "Infinite collaborative whiteboard supporting drawing, shapes, arrows, text, images, sticky notes, tables, code blocks, search, and export.",
      "Extensible plugin-based architecture — new canvas elements inherit move, resize, rotate, undo, export, grouping, and real-time collaboration without touching core editor logic.",
      "Deployed on Cloudflare Workers and Durable Objects, serving both the app and the collaboration relay from a single secure origin.",
    ],
    visual: "scribble",
    links: {
      live: { label: "Live", href: workersUrl("canvasx") },
      code: { label: "Code", href: "https://github.com/Patni05/canvasx" },
    },
  },
  {
    slug: "f5-tts",
    name: "F5-TTS Hindi Speech Synthesis",
    year: "2025",
    tagline: "Fine-Tuned Hindi Text-to-Speech Model",
    tech: [
      "Python",
      "F5-TTS",
      "PyTorch",
      "Audio Preprocessing",
      "Dataset Pipelines",
    ],
    bullets: [
      "Trained and fine-tuned an F5-TTS Hindi text-to-speech model on 80+ GB of Hindi speech data for natural, intelligible synthesis.",
      "Built the full speech-data preprocessing pipeline: audio cleaning, normalization, dataset filtering, text processing, alignment, and training-data preparation.",
      "Optimized training and inference to improve Hindi pronunciation accuracy, naturalness, speaker consistency, and generation quality.",
      "Designed for integration with AI voice assistants, accessibility systems, content generation, and speech-enabled applications.",
    ],
    visual: "waveform",
    audio: null,
    links: {
      code: { label: "Code", href: null },
    },
  },
];
