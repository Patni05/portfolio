export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "bp-theme";
export const INTRO_SESSION_KEY = "bp-intro-seen";
export const EFFECTS_STORAGE_KEY = "bp-effects";

/**
 * On-screen hold, then the cross-fade. Deliberately short: this is a flourish,
 * not a loading screen, and every millisecond here is a millisecond the
 * visitor cannot read the page.
 */
const HOLD_MS = 700;
const FADE_MS = 300;

/**
 * Inlined in <head> and run before first paint.
 *
 * It owns two things that must be correct on the very first frame:
 *
 *  - the theme, so there is no light/dark flash;
 *  - the intro, so the page is either covered from the start or fully visible
 *    from the start. Deciding in React would paint the page, cover it, then
 *    reveal it again.
 *
 * The intro timing lives here rather than in a React effect on purpose: an
 * effect's cleanup runs on unmount, which released the intro early and left
 * the hero stuck at opacity 0. Plain timers on the document have no such
 * lifecycle to get wrong.
 *
 * State is expressed as attributes on <html>:
 *   data-intro="playing" | "leaving"  — overlay visible, hero held back
 *   data-hero-ready="true"            — hero entrance released
 * Neither attribute (JS disabled) means everything is simply visible.
 */
export const bootScript = `
(function () {
  var root = document.documentElement;

  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (e) {
    root.dataset.theme = 'dark';
  }

  // Background effects preference, applied before paint so the scene never
  // mounts for a visitor who has turned it off.
  try {
    if (localStorage.getItem('bp-effects') === 'off') {
      root.dataset.effects = 'off';
    }
  } catch (e) {}

  function finish() {
    delete root.dataset.intro;
    root.classList.remove('intro-lock');
    root.dataset.heroReady = 'true';
  }

  try {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen = false;
    try { seen = sessionStorage.getItem('${INTRO_SESSION_KEY}') === '1'; }
    catch (e) { seen = true; }

    if (reduce || seen) {
      root.dataset.heroReady = 'true';
      return;
    }

    root.dataset.intro = 'playing';
    root.classList.add('intro-lock');
    try { sessionStorage.setItem('${INTRO_SESSION_KEY}', '1'); } catch (e) {}

    setTimeout(function () { root.dataset.intro = 'leaving'; }, ${HOLD_MS});
    setTimeout(finish, ${HOLD_MS + FADE_MS});

    // Safety net: if anything above is interrupted, never leave the visitor
    // staring at a covered, unscrollable page.
    window.addEventListener('pageshow', function () {
      setTimeout(finish, ${HOLD_MS + FADE_MS + 400});
    });
  } catch (e) {
    finish();
  }
})();
`;
