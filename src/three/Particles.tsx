"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { frameState } from "@/lib/frameState";

type Props = {
  count: number;
  color: string;
  opacity: number;
};

/**
 * Starfield. A single Points draw call; the whole cloud is animated by
 * transforming the group rather than rewriting the position buffer each frame.
 */
export function Particles({ count, color, opacity }: Props) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Spherical shell so density stays even and nothing clumps at the poles.
      const radius = 14 + Math.random() * 34;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      array[i * 3 + 2] = radius * Math.cos(phi);
    }
    return array;
  }, [count]);

  useFrame((_, delta) => {
    if (frameState.paused) return;
    const g = group.current;
    if (!g) return;

    if (frameState.reducedMotion) {
      g.rotation.set(0.1, 0.3, 0);
      return;
    }

    const step = Math.min(delta, 0.05);
    g.rotation.y += step * 0.012;
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      frameState.pointerY * 0.05 + frameState.progress * 0.25,
      0.03,
    );
    g.position.x = THREE.MathUtils.lerp(
      g.position.x,
      frameState.pointerX * -1.2,
      0.02,
    );
  });

  return (
    <group ref={group}>
      <points ref={points} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.06}
          sizeAttenuation
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
