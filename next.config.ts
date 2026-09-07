import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Static export.
   *
   * Every route in this site is prerendered — there are no dynamic routes, no
   * server actions, no middleware, and the only server-side work (detecting
   * whether public/resume.pdf exists) happens at build time. So a static
   * export is a complete build, and it deploys to Cloudflare's static asset
   * hosting with no Workers runtime, no adapter, and no cold starts.
   */
  output: "export",

  /**
   * `next/image` has no optimiser in a static export. Nothing on this site
   * uses <Image> today, but this keeps the build honest if that changes.
   */
  images: { unoptimized: true },

  /** Emit `/path/index.html`, which is what static asset hosts expect. */
  trailingSlash: true,
};

export default nextConfig;
