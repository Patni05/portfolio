"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { frameState } from "@/lib/frameState";

type Props = {
  accent2: string;
  accent3: string;
  opacity: number;
};

/**
 * Trapezoidal fade so accents cross-fade rather than hard-cut: ramps up over
 * [start, in], holds, then ramps down over [out, end].
 */
function fadeWindow(
  progress: number,
  start: number,
  fadeIn: number,
  fadeOut: number,
  end: number,
) {
  if (progress <= start || progress >= end) return 0;
  if (progress < fadeIn) {
    return THREE.MathUtils.smoothstep(progress, start, fadeIn);
  }
  if (progress > fadeOut) {
    return 1 - THREE.MathUtils.smoothstep(progress, fadeOut, end);
  }
  return 1;
}

/** Scroll windows, tuned to roughly match where each section sits on the page. */
const WINDOWS = {
  grid: [0.44, 0.54, 0.76, 0.86] as const,
  helix: [0.62, 0.72, 0.82, 0.92] as const,
};

const HELIX_POINTS = 420;

/**
 * Ambient accents behind the content: a runway grid under the project rows and
 * a particle helix beside the AI project.
 *
 * Deliberately no large circular forms — the hero solid and the Skills torus
 * both read as an "empty circle" against the text and were removed.
 */
export function SectionAccents({ accent2, accent3, opacity }: Props) {
  const grid = useRef<THREE.Group>(null);
  const gridMaterial = useRef<THREE.LineBasicMaterial>(null);

  const helix = useRef<THREE.Points>(null);
  const helixMaterial = useRef<THREE.PointsMaterial>(null);

  const gridGeometry = useMemo(() => {
    // A flat lattice we tilt under the content so it reads like a runway.
    const size = 40;
    const divisions = 24;
    const step = size / divisions;
    const half = size / 2;
    const vertices: number[] = [];

    for (let i = 0; i <= divisions; i += 1) {
      const offset = -half + i * step;
      vertices.push(-half, 0, offset, half, 0, offset);
      vertices.push(offset, 0, -half, offset, 0, half);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    return geo;
  }, []);

  const helixGeometry = useMemo(() => {
    const positions = new Float32Array(HELIX_POINTS * 3);
    const turns = 5;
    const height = 16;

    for (let i = 0; i < HELIX_POINTS; i += 1) {
      const t = i / (HELIX_POINTS - 1);
      // Two interleaved strands.
      const strand = i % 2 === 0 ? 0 : Math.PI;
      const angle = t * Math.PI * 2 * turns + strand;
      positions[i * 3] = Math.cos(angle) * 2.4;
      positions[i * 3 + 1] = (t - 0.5) * height;
      positions[i * 3 + 2] = Math.sin(angle) * 2.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (frameState.paused) return;

    const progress = frameState.reducedMotion ? 0.5 : frameState.progress;
    const step = frameState.reducedMotion ? 0 : Math.min(delta, 0.05);

    const gridAmount = fadeWindow(progress, ...WINDOWS.grid);
    const helixAmount = fadeWindow(progress, ...WINDOWS.helix);

    if (grid.current && gridMaterial.current) {
      grid.current.visible = gridAmount > 0.001;
      gridMaterial.current.opacity = gridAmount * opacity * 0.3;
      // Slide the lattice toward the camera so it moves like a runway.
      grid.current.position.z = ((progress * 40) % 3.333) - 6;
      grid.current.rotation.x = -0.35 + gridAmount * 0.1;
    }

    if (helix.current && helixMaterial.current) {
      helix.current.visible = helixAmount > 0.001;
      helixMaterial.current.opacity = helixAmount * opacity * 0.7;
      helix.current.rotation.y += step * 0.35;
    }
  });

  return (
    <group>
      <group ref={grid} position={[0, -5.5, -6]} visible={false}>
        <lineSegments geometry={gridGeometry}>
          <lineBasicMaterial
            ref={gridMaterial}
            color={accent2}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      <points
        ref={helix}
        geometry={helixGeometry}
        position={[-4.5, 0, -3]}
        visible={false}
      >
        <pointsMaterial
          ref={helixMaterial}
          color={accent3}
          size={0.07}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
