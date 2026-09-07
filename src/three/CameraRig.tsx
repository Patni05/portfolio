"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { frameState } from "@/lib/frameState";

/**
 * Camera choreography keyframes: scroll progress -> camera position and the
 * point it looks at.
 *
 * This is driven directly from `frameState.progress` inside the render loop
 * rather than through a GSAP ScrollTrigger scrub. Scrubbing a Lenis-smoothed
 * scroll through ScrollTrigger means two independent easings fighting each
 * other; lerping toward the keyframed target every frame gives one easing and
 * a visibly smoother result.
 */
type Keyframe = {
  at: number;
  position: [number, number, number];
  lookAt: [number, number, number];
};

/**
 * Restrained on purpose. The scene is now ambient background only — the hero's
 * focal visual lives in the DOM — so the camera drifts rather than swooping.
 * Large moves here read as the background competing with the text.
 */
const KEYFRAMES: Keyframe[] = [
  { at: 0.0, position: [0, 0, 9], lookAt: [0, 0, 0] },
  { at: 0.25, position: [-0.9, 0.35, 10.5], lookAt: [0.2, 0, 0] },
  { at: 0.5, position: [0.9, 0.7, 9.5], lookAt: [0, 0.1, 0] },
  { at: 0.72, position: [0.4, 0.2, 8], lookAt: [0, -0.2, 0] },
  { at: 1.0, position: [0, 0, 13], lookAt: [0, 0, 0] },
];

/** Where the camera parks when reduced motion is requested. */
const STATIC_POSE: Keyframe = {
  at: 0,
  position: [0.8, 0.4, 9],
  lookAt: [0, 0, 0],
};

const targetPosition = new THREE.Vector3();
const targetLookAt = new THREE.Vector3();
const currentLookAt = new THREE.Vector3();

function sample(progress: number) {
  // Find the surrounding keyframes and interpolate between them.
  let lower = KEYFRAMES[0];
  let upper = KEYFRAMES[KEYFRAMES.length - 1];

  for (let i = 0; i < KEYFRAMES.length - 1; i += 1) {
    if (progress >= KEYFRAMES[i].at && progress <= KEYFRAMES[i + 1].at) {
      lower = KEYFRAMES[i];
      upper = KEYFRAMES[i + 1];
      break;
    }
  }

  const span = upper.at - lower.at;
  const local = span > 0 ? (progress - lower.at) / span : 0;
  const eased = THREE.MathUtils.smoothstep(local, 0, 1);

  targetPosition.set(
    THREE.MathUtils.lerp(lower.position[0], upper.position[0], eased),
    THREE.MathUtils.lerp(lower.position[1], upper.position[1], eased),
    THREE.MathUtils.lerp(lower.position[2], upper.position[2], eased),
  );
  targetLookAt.set(
    THREE.MathUtils.lerp(lower.lookAt[0], upper.lookAt[0], eased),
    THREE.MathUtils.lerp(lower.lookAt[1], upper.lookAt[1], eased),
    THREE.MathUtils.lerp(lower.lookAt[2], upper.lookAt[2], eased),
  );
}

export function CameraRig() {
  const initialised = useRef(false);

  useFrame(({ camera }, delta) => {
    if (frameState.paused) return;

    if (frameState.reducedMotion) {
      camera.position.set(...STATIC_POSE.position);
      camera.lookAt(...STATIC_POSE.lookAt);
      return;
    }

    sample(frameState.progress);

    // Add a small parallax offset from the pointer on top of the scroll pose.
    targetPosition.x += frameState.pointerX * 0.6;
    targetPosition.y += frameState.pointerY * 0.4;

    // Frame-rate independent damping, so a 144Hz display eases identically to 60Hz.
    const damping = initialised.current
      ? 1 - Math.pow(0.0015, Math.min(delta, 0.05))
      : 1;
    initialised.current = true;

    camera.position.lerp(targetPosition, damping);
    currentLookAt.lerp(targetLookAt, damping);
    camera.lookAt(currentLookAt);
  });

  return null;
}
