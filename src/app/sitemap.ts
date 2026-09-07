import type { MetadataRoute } from "next";

/**
 * Required by `output: "export"`: route handlers must opt in to being
 * prerendered at build time rather than served dynamically.
 */
export const dynamic = "force-static";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
