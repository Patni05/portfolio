import { ImageResponse } from "next/og";

/**
 * Required by `output: "export"`: route handlers must opt in to being
 * prerendered at build time rather than served dynamically.
 */
export const dynamic = "force-static";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: accent-on-black "~", matching the nav brand mark. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          color: "#4f8dff",
          fontSize: 46,
          fontWeight: 700,
          fontFamily: "monospace",
        }}
      >
        ~
      </div>
    ),
    size,
  );
}
