import type { MetadataRoute } from "next";

/**
 * Required by `output: "export"`: route handlers must opt in to being
 * prerendered at build time rather than served dynamically.
 */
export const dynamic = "force-static";
import { profile } from "@/data/profile";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} — ${profile.role}`,
    short_name: "Bhupesh Patni",
    description:
      "Portfolio of Bhupesh Patni, full-stack developer based in Dehradun, India.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
  };
}
