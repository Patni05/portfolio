"use client";

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { frameState } from "@/lib/frameState";
import { useCapabilities } from "@/hooks/useCapabilities";
import { useTheme } from "@/components/providers/ThemeProvider";
import { scenePalette } from "./palette";
import { CameraRig } from "./CameraRig";
import { CodeGlyphs } from "./CodeGlyphs";
import { Particles } from "./Particles";
import { SectionAccents } from "./SectionAccents";

/**
 * Writes pointer position into the shared frame state and pauses the render
 * loop whenever the tab is hidden — no point burning GPU on an invisible page.
 */
function useSceneLifecycle() {
  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      frameState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      frameState.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    const onVisibility = () => {
      frameState.paused = document.visibilityState === "hidden";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      frameState.paused = false;
    };
  }, []);
}

export default function Scene() {
  const caps = useCapabilities();
  const { theme } = useTheme();
  useSceneLifecycle();

  if (!caps || caps.tier === "none") return null;

  const palette = scenePalette[theme];
  const { intensity } = palette;

  return (
    <Canvas
      // Decorative only: it must never take focus or be announced. r3f does
      // not forward these to the underlying <canvas>, so they are set on the
      // real DOM node once the renderer exists.
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true");
        gl.domElement.setAttribute("role", "presentation");
        gl.domElement.tabIndex = -1;
      }}
      dpr={[1, caps.maxDpr]}
      gl={{
        antialias: caps.tier === "full",
        powerPreference: "high-performance",
        alpha: true,
      }}
      camera={{ fov: 50, position: [0, 0, 8], near: 0.1, far: 120 }}
      style={{ pointerEvents: "none" }}
    >
      {/* No EffectComposer: postprocessing is a full extra pass over the
          whole viewport, and for a background this subtle it is not worth the
          frame time. Removing it also keeps the postprocessing library out of
          the lazy chunk entirely. */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
      <CameraRig />

      <Suspense fallback={null}>
        <Particles
          count={caps.particleCount}
          color={palette.particle}
          opacity={0.55 * intensity}
        />
        <CodeGlyphs
          count={caps.glyphCount}
          color={palette.glyph}
          opacity={intensity}
        />
        <SectionAccents
          accent2={palette.accent2}
          accent3={palette.accent3}
          opacity={intensity}
        />
      </Suspense>

    </Canvas>
  );
}
