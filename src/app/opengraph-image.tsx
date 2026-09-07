import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

/**
 * Required by `output: "export"`: route handlers must opt in to being
 * prerendered at build time rather than served dynamically.
 */
export const dynamic = "force-static";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dark card: name, role, accent rule. Generated at build time. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0b",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#4f8dff",
              letterSpacing: "0.06em",
            }}
          >
            $ whoami
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 104,
              fontWeight: 700,
              color: "#ededf0",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              display: "flex",
              width: 180,
              height: 4,
              marginTop: 36,
              background: "#4f8dff",
            }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 34,
              color: "#8a8a95",
            }}
          >
            {profile.role}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#8a8a95",
          }}
        >
          <span>Next.js · Node.js · PostgreSQL · AI/TTS</span>
          <span>{profile.locationShort}</span>
        </div>
      </div>
    ),
    size,
  );
}
