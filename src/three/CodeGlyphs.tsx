"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { frameState } from "@/lib/frameState";
import { GLYPHS, getGlyphTexture } from "./glyphTexture";

type Props = {
  count: number;
  color: string;
  opacity: number;
};

type Glyph = {
  char: string;
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
};

/**
 * Code characters drifting in depth. Sprites always face the camera, so they
 * stay legible from every camera position in the scroll choreography.
 */
export function CodeGlyphs({ count, color, opacity }: Props) {
  const group = useRef<THREE.Group>(null);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);

  const glyphs = useMemo<Glyph[]>(() => {
    // Deterministic pseudo-random, so the layout is stable across remounts.
    let seed = 20260907;
    const random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    return Array.from({ length: count }, (_, i) => ({
      char: GLYPHS[i % GLYPHS.length],
      position: [
        (random() - 0.5) * 22,
        (random() - 0.5) * 14,
        (random() - 0.5) * 16 - 2,
      ] as [number, number, number],
      scale: 0.32 + random() * 0.5,
      speed: 0.25 + random() * 0.7,
      phase: random() * Math.PI * 2,
    }));
  }, [count]);

  const textures = useMemo(
    () => glyphs.map((glyph) => getGlyphTexture(glyph.char, color)),
    [glyphs, color],
  );

  useFrame((state, delta) => {
    if (frameState.paused) return;
    const g = group.current;
    if (!g) return;

    if (frameState.reducedMotion) {
      g.rotation.set(0, 0, 0);
      return;
    }

    const step = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    // Glyphs speed up as the visitor moves down the page.
    const rush = 1 + frameState.progress * 1.6;

    for (let i = 0; i < sprites.current.length; i += 1) {
      const sprite = sprites.current[i];
      const glyph = glyphs[i];
      if (!sprite || !glyph) continue;

      sprite.position.y +=
        step * glyph.speed * rush * 0.4 * (i % 2 === 0 ? 1 : -1);

      // Wrap vertically so the field never empties out.
      if (sprite.position.y > 8) sprite.position.y = -8;
      if (sprite.position.y < -8) sprite.position.y = 8;

      sprite.position.x =
        glyph.position[0] + Math.sin(time * 0.3 + glyph.phase) * 0.5;
    }

    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      frameState.pointerX * 0.08,
      0.02,
    );
  });

  return (
    <group ref={group}>
      {glyphs.map((glyph, i) => (
        <sprite
          key={`${glyph.char}-${i}`}
          ref={(node) => {
            sprites.current[i] = node;
          }}
          position={glyph.position}
          scale={[glyph.scale, glyph.scale, glyph.scale]}
        >
          <spriteMaterial
            map={textures[i]}
            transparent
            opacity={opacity * 0.42}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}
