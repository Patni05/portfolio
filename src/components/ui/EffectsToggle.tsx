"use client";

import { Zap, ZapOff } from "lucide-react";
import { useEffectsSetting } from "@/components/providers/EffectsProvider";

/**
 * Turns the ambient background scene on and off. Offered because the scene's
 * cost depends on the visitor's GPU, and no amount of tuning replaces simply
 * letting them switch it off.
 */
export function EffectsToggle() {
  const { enabled, toggle } = useEffectsSetting();

  return (
    <button
      type="button"
      onClick={toggle}
      className="icon-btn"
      aria-pressed={enabled}
      aria-label={
        enabled
          ? "Turn background effects off (improves performance)"
          : "Turn background effects on"
      }
      title={enabled ? "Background effects: on" : "Background effects: off"}
      data-off={enabled ? undefined : "true"}
    >
      {enabled ? <Zap size={15} /> : <ZapOff size={15} />}
    </button>
  );
}
