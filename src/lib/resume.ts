import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Server-only. Returns the resume URL if the PDF is actually present in
 * /public, otherwise null.
 *
 * Detected rather than configured by a flag: dropping resume.pdf into /public
 * is the whole task, and a stale flag pointing at a missing file would ship a
 * 404 download button.
 */
export function getResumeHref(): string | null {
  try {
    return existsSync(path.join(process.cwd(), "public", "resume.pdf"))
      ? "/resume.pdf"
      : null;
  } catch {
    return null;
  }
}
