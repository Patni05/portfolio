import { profile } from "@/data/profile";

/**
 * Static intro markup, server-rendered so it is painted on the first frame.
 *
 * Visibility is controlled purely by `data-intro` on <html>, which the boot
 * script sets before paint — see src/lib/boot.ts. When the intro is skipped
 * this collapses to display:none and costs nothing.
 */
export function IntroScreen() {
  return (
    <div className="intro" aria-hidden="true" inert>
      <div className="intro__inner mono">
        <p className="intro__path">
          <span className="intro__sigil">~/</span>
          {profile.handle.replace("_", "")}
        </p>
        <p className="intro__status">initializing...</p>
        <div className="intro__track">
          <span className="intro__bar" />
        </div>
      </div>
    </div>
  );
}
