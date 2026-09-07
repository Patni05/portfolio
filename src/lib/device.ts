/**
 * One-shot capability detection. Called once on the client and cached — we never
 * re-evaluate on resize, because thrashing between the WebGL scene and the CSS
 * fallback mid-session looks broken.
 */
export type DeviceTier = "full" | "lite" | "none";

export type Capabilities = {
  tier: DeviceTier;
  /** Full WebGL scene with postprocessing. */
  postprocessing: boolean;
  particleCount: number;
  glyphCount: number;
  maxDpr: number;
};

const SERVER_DEFAULT: Capabilities = {
  tier: "full",
  postprocessing: false,
  particleCount: 3000,
  glyphCount: 28,
  maxDpr: 1.5,
};

let cached: Capabilities | null = null;

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export function detectCapabilities(): Capabilities {
  if (typeof window === "undefined") return SERVER_DEFAULT;
  if (cached) return cached;

  if (!hasWebGL()) {
    cached = { ...SERVER_DEFAULT, tier: "none", particleCount: 0, glyphCount: 0 };
    return cached;
  }

  const cores = navigator.hardwareConcurrency ?? 8;
  const touchPrimary = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  const deviceMemory = (
    navigator as Navigator & { deviceMemory?: number }
  ).deviceMemory;

  // Any touch-primary device, or genuinely weak hardware -> skip WebGL
  // entirely. On phones and tablets the ambient scene is the single largest
  // cost for the least benefit, and the CSS fallback looks near-identical.
  if (touchPrimary || narrow || cores <= 2 || (deviceMemory ?? 8) <= 2) {
    cached = { ...SERVER_DEFAULT, tier: "none", particleCount: 0, glyphCount: 0 };
    return cached;
  }

  // Mid-range: thin the field out further.
  if (cores <= 4) {
    cached = {
      tier: "lite",
      postprocessing: false,
      particleCount: 600,
      glyphCount: 10,
      maxDpr: 1.25,
    };
    return cached;
  }

  // Postprocessing stays OFF even here. Bloom is a full extra render pass over
  // the whole viewport, and for a background this subtle it is not worth the
  // frame time.
  cached = {
    tier: "full",
    postprocessing: false,
    particleCount: 2200,
    glyphCount: 16,
    maxDpr: 1.5,
  };
  return cached;
}
