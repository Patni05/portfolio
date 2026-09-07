import * as THREE from "three";

/** Characters drifting through the scene — the "coding feeling". */
export const GLYPHS = [
  "{",
  "}",
  "<",
  ">",
  "/",
  ";",
  "=",
  "=>",
  "[]",
  "()",
  "#",
  "*",
  "&&",
  "??",
] as const;

const cache = new Map<string, THREE.CanvasTexture>();

/**
 * Renders a glyph to a canvas once and caches it. Cached per char+colour, so a
 * scene with 30 sprites still only creates ~14 textures.
 */
export function getGlyphTexture(char: string, color: string): THREE.CanvasTexture {
  const key = `${char}|${color}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = color;
    ctx.font = `600 ${char.length > 1 ? 52 : 78}px ui-monospace, "JetBrains Mono", "Cascadia Mono", Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, size / 2, size / 2 + 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}

export function disposeGlyphTextures() {
  cache.forEach((texture) => texture.dispose());
  cache.clear();
}
