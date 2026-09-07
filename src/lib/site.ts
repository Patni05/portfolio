import { profile } from "@/data/profile";

/**
 * Canonical origin, used for canonical links, OpenGraph, robots.txt and the
 * sitemap.
 *
 * The fallback is the live Cloudflare URL, so a plain `next build` produces
 * correct metadata with no configuration. Set NEXT_PUBLIC_SITE_URL to override
 * it once a custom domain is attached.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bhupesh.canvax1.workers.dev";

export const siteName = `${profile.name} — ${profile.role}`;

export const siteDescription =
  "Full-stack developer in Dehradun, India. Next.js, Node.js, PostgreSQL and fine-tuned speech models — including Zeplymart, CanvasX and an F5-TTS Hindi TTS model.";

/** schema.org Person, so search engines get the entity right. */
export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dehradun",
    addressRegion: "Uttarakhand",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Graphic Era Hill University",
  },
  knowsAbout: [
    "Full-Stack Web Development",
    "Next.js",
    "React",
    "Node.js",
    "PostgreSQL",
    "Text-to-Speech",
    "Cloudflare Workers",
  ],
  sameAs: [profile.github, profile.linkedin],
};
