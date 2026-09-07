"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { EFFECTS_STORAGE_KEY } from "@/lib/boot";

type EffectsContextValue = {
  /** When false, the ambient WebGL background never mounts. */
  enabled: boolean;
  toggle: () => void;
};

const EffectsContext = createContext<EffectsContextValue>({
  enabled: true,
  toggle: () => {},
});

/**
 * Lets the visitor turn the ambient background scene off.
 *
 * The scene is the single heaviest thing on the page, and how heavy depends
 * entirely on the GPU it lands on. Rather than guess, this is an explicit
 * switch — and the boot script applies the stored choice before first paint,
 * so a visitor who turned it off never pays for it again.
 */
export function EffectsProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(document.documentElement.dataset.effects !== "off");
  }, []);

  const toggle = useCallback(() => {
    setEnabled((previous) => {
      const next = !previous;
      if (next) {
        delete document.documentElement.dataset.effects;
      } else {
        document.documentElement.dataset.effects = "off";
      }
      try {
        localStorage.setItem(EFFECTS_STORAGE_KEY, next ? "on" : "off");
      } catch {
        // Private browsing — the choice just will not persist.
      }
      return next;
    });
  }, []);

  return (
    <EffectsContext.Provider value={{ enabled, toggle }}>
      {children}
    </EffectsContext.Provider>
  );
}

export const useEffectsSetting = () => useContext(EffectsContext);
