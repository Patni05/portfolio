import { profile } from "@/data/profile";
import { workersUrl } from "@/lib/cloudflare";

/**
 * Canonical origin, used for canonical links, OpenGraph, robots.txt and the
 * sitemap.
 *
 * The fallback is the live Cloudflare URL, so a plain `next build` produces
 * correct metadata with no configuration. Set NEXT_PUBLIC_SITE_URL to override
 * it once a custom domain is attached.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? workersUrl("bhupesh");

export const siteName = `${profile.name} — ${profile.role}`;

export const siteDescription =
  "Full-Stack Developer building production-ready web applications, collaborative tools, and AI-powered projects.";

/**
 * Social preview image.
 *
 * A real PNG in public/ rather than a generated `opengraph-image` route, for
 * two reasons that are specifically LinkedIn's:
 *
 *  - Next appends a cache-busting query string to a generated OG route
 *    (`/opengraph-image?<hash>`) and emits it WITHOUT a file extension.
 *    LinkedIn's crawler is the least forgiving of the major ones on both
 *    counts and routinely drops such images, leaving a title-only card.
 *  - A static file is served straight from Cloudflare's asset storage with a
 *    correct `image/png` content type inferred from the extension, so there is
 *    no `_headers` rule to keep in sync.
 *
 * Dimensions are declared to the crawler, so they must match the file exactly:
 * scrapers that trust the tags and pre-allocate the card will render a
 * letterboxed or clipped image if they disagree. 1200x627 is exactly
 * LinkedIn's recommended size, and the file is generated to match.
 */
export const ogImage = {
  url: `${siteUrl}/og-image.png`,
  width: 1200,
  height: 627,
  alt: `${profile.name} — ${profile.role}`,
  type: "image/png",
} as const;

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
