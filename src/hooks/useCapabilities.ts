"use client";

import { useEffect, useState } from "react";
import { detectCapabilities, type Capabilities } from "@/lib/device";

/**
 * `null` until the client has measured the device, so nothing 3D mounts during
 * SSR or the first paint.
 */
export function useCapabilities(): Capabilities | null {
  const [caps, setCaps] = useState<Capabilities | null>(null);
  useEffect(() => setCaps(detectCapabilities()), []);
  return caps;
}
