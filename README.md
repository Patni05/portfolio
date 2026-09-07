# Bhupesh Patni — Portfolio

A single-page, scroll-driven portfolio. Next.js 15 + TypeScript, `react-three-fiber`
for the ambient WebGL background, a 2D canvas for the hero visual, Lenis for
inertial scrolling, and pure CSS for every entrance animation.

Built to the spec in [build.md](build.md).

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # eslint
npx tsc --noEmit   # typecheck
```

Node 20+ (developed on 24.19).

---

## How to update your portfolio

**Everything you'd want to change is in `src/data/`.** No component holds copy.

| To change | Edit |
|---|---|
| Name, email, socials, hero role list, about paragraphs, terminal card, stat row | [src/data/profile.ts](src/data/profile.ts) |
| Projects — add, reorder, edit bullets/tech/links | [src/data/projects.ts](src/data/projects.ts) |
| Skill groups and chips | [src/data/skills.ts](src/data/skills.ts) |
| Education timeline | [src/data/education.ts](src/data/education.ts) |
| Achievements | [src/data/achievements.ts](src/data/achievements.ts) |

### Add a project

Append an entry to the `projects` array in `src/data/projects.ts`. Rows alternate
left/right automatically. `visual` picks the accompanying panel:
`"dashboard" | "scribble" | "waveform"`.

### Fill in a project link

Links start as `{ label: "Live", href: null }`. A `null` href renders a dashed,
disabled **"Live — soon"** button rather than a dead link. Set the URL:

```ts
links: {
  live: { label: "Live", href: "https://zeplymart.example.com" },
  code: { label: "Code", href: "https://github.com/Patni05/zeplymart" },
},
```

### Add your resume

**Drop the PDF at `public/resume.pdf` and rebuild. That is the whole task** —
availability is detected at build time by [src/lib/resume.ts](src/lib/resume.ts),
so there is no flag to remember and no way to ship a button pointing at a 404.
Until the file exists, no resume control is rendered anywhere — not in the nav,
not in the hero. An inert button in the hero is worse than no button.

### Add the TTS audio sample

Put the clip in `public/` and set `audio: "/tts-sample.wav"` on the `f5-tts`
project. The waveform panel switches from a synthetic envelope to a real Web
Audio `AnalyserNode` reading the actual model output, and grows a play button.
No other change needed.

### Change the accent colour

`src/app/globals.css` — `--accent` appears in three places: `:root` (light), the
`prefers-color-scheme: dark` block, and `:root[data-theme="dark"]`. Update all
three. The WebGL scene reads its own colours from
[src/three/palette.ts](src/three/palette.ts); the hero visual and education
graphic both read `--accent` live, so they follow automatically.

### Change the overall text size

[globals.css](src/app/globals.css) — `html { font-size: 106.25% }`. That single
value scales every `rem` in the design (type *and* spacing) together.

### Change the intro timing

[src/lib/boot.ts](src/lib/boot.ts) — `HOLD_MS` and `FADE_MS`. Set `HOLD_MS` to
`0` to drop the intro entirely.

### Set the domain

`NEXT_PUBLIC_SITE_URL=https://yourdomain.com` at build time. It feeds canonical
URLs, OpenGraph, `robots.txt` and `sitemap.xml`. Falls back to a placeholder
otherwise — see [src/lib/site.ts](src/lib/site.ts).

---

## Performance

The page is deliberately cheap to composite. What was removed, and why:

| Removed | Why it cost so much |
|---|---|
| `backdrop-filter: blur(12px)` on `.card` | That class is on ~15 elements. Each blurred backdrop is a separate offscreen pass the compositor redoes while scrolling. |
| `filter: blur(90px)` on two 60vmax glows | A huge blurred layer animated with `transform` is re-rasterized continuously. Replaced with a `radial-gradient`, which is free and looks the same. |
| `filter: blur(36px)` on the hero glow | The element was already a soft radial-gradient; the blur on top was redundant and re-rastered on every frame of the scale animation. |
| `mix-blend-mode: overlay` on the grain | Blending a full-viewport layer is a composite pass every frame, and it is invisible at 3-4% opacity. Grain is dropped entirely under 768px. |
| `EffectComposer` (bloom + vignette) | A full extra render pass over the whole viewport. Also keeps the postprocessing library out of the lazy chunk. |
| `getComputedStyle` inside two draw loops | Forces a style recalculation every frame. The palette is now read once per theme change. |
| 48 gradients per frame in the waveform | `createLinearGradient` per bar per frame. Now built once per size/theme. |

Still in place, and cheap: one `backdrop-filter` on the nav (a single element) and
one on the mobile menu overlay (only while open).

Other measures:

- **Canvas loops are capped at ~30fps** and stop completely when scrolled out of
  view or when the tab is hidden. The drift is slow; 60fps bought nothing.
- **No WebGL on any touch device.** The ambient scene is the largest cost for
  the least benefit on a phone, and the CSS fallback looks near-identical.
- **three.js is fetched only when the browser is idle** — `requestIdleCallback`
  in [BackgroundLayer.tsx](src/three/BackgroundLayer.tsx) — so downloading and
  parsing the ~325 kB chunk never competes with hydration or the hero entrance.
  Verified: the chunk arrives after the `load` event.
- **Lenis uses `lerp`, not `duration`.** A duration-based tween keeps animating
  for a fixed time after the wheel stops, which is what reads as "floaty". A
  per-frame lerp tracks the input and settles fast. Touch scrolling is left
  native — smoothing it fights the platform and feels worse on every phone.
- Particle counts halved (2200 full / 600 lite, was 5000 / 800).

### The effects toggle

The lightning-bolt button in the nav turns the ambient background off. The
choice persists and is applied by the boot script **before first paint**, so a
visitor who switched it off never downloads three.js again.

This exists because the scene's cost depends entirely on the GPU it lands on,
and no amount of tuning substitutes for letting the visitor switch it off.
Measured in the (software-GL, therefore pessimistic) harness: worst long task
during a full-page scroll dropped from 2343 ms to 356 ms — 85% lower — because
with it off the chunk is never fetched, parsed, or run.

---

## Architecture notes

**Scroll never re-renders React.** The Lenis listener writes scroll progress into
a plain mutable object ([src/lib/frameState.ts](src/lib/frameState.ts)) and a
`--scroll-progress` CSS variable. The WebGL scene reads that object inside
`useFrame`; the progress bar reads the CSS variable. Nothing subscribes to
scroll through React state — that is the main reason it stays smooth.

**Entrance animations are pure CSS.** The intro decision *and* its timing live in
an inline `<head>` script ([src/lib/boot.ts](src/lib/boot.ts)) that runs before
first paint, expressing state as attributes on `<html>`:

| State | Meaning |
|---|---|
| `data-intro="playing"` | overlay covering the page, hero held back |
| `data-intro="leaving"` | overlay cross-fading out |
| `data-hero-ready="true"` | hero entrance released |
| *neither* | JS disabled — everything simply visible |

Two things this ordering buys, both of which were bugs first:

- **No flash.** Deciding in a React effect painted the page, covered it, then
  revealed it again. The script settles it before the first frame.
- **No blank hero without JS.** The hold applies *only* while `data-intro` is
  set, so the default state is visible. A `<noscript>` style does the same for
  the scroll reveals.

The timing is plain `setTimeout` on the document rather than a React effect,
because an effect's cleanup runs on unmount — which released the intro early and
left the hero stuck at opacity 0.

**Two separate canvases, by role.**

- The **hero visual** ([HeroVisual.tsx](src/components/hero/HeroVisual.tsx)) is a
  small 2D canvas in its own grid column: a drifting node graph with floating
  code fragments. Being a real column means it *cannot* overlap the name, and it
  stacks predictably on mobile.
- The **background** ([src/three/Scene.tsx](src/three/Scene.tsx)) is one fixed
  WebGL canvas — particles, code glyphs, a runway grid and a particle helix.
  Ambient only; the camera drifts rather than swoops
  ([CameraRig.tsx](src/three/CameraRig.tsx)).

There are deliberately **no large circular forms** in either: the hero
icosahedron and the Skills torus both read as an awkward empty circle behind text
and were removed.

**The education graphic is derived from real data.**
[EducationVisual.tsx](src/components/about/EducationVisual.tsx) builds a spine
with one rung per qualification, rung length scaled by the recorded result, and
draws itself in with `stroke-dashoffset` on scroll. It replaced the empty circle
that used to sit there.

**The type scale is set by the ROOT font size.** `html { font-size: 106.25% }`
(17px) in [globals.css](src/app/globals.css) is the only correct place to scale
the design: `rem` resolves against `<html>`, so putting a size on `<body>`
enlarges inherited text but leaves every rem-based size untouched. Change that
one value to scale all type and spacing together.

**Fonts must be declared on `<html>`, not `<body>`.** `--font-display` references
`--font-space-grotesk`, and a custom property that references another is
substituted **where it is declared**. With the font variables on `<body>` the
whole stack resolved to nothing and silently fell back to system fonts. Both now
live on the same element. If you add a font, put its `.variable` class on
`<html>` in [layout.tsx](src/app/layout.tsx).

**Mobile specifics.** No WebGL on touch. The hero visual is hidden below 520px
and the hero stacks; `min-height` drops from `100svh` to `auto` so the tagline
and CTA are reachable without scrolling. Stats collapse to one column with the
value and label on one row. Project and contact buttons go full-width. Grain is
off. Every control clears a 44px tap target, and no rendered text is below
13.3px at any width.

**Three device tiers**, detected once on mount
([src/lib/device.ts](src/lib/device.ts)):

| Tier | When | What renders |
|---|---|---|
| `full` | desktop, >4 cores | 2200 particles, no postprocessing, DPR <=1.5 |
| `lite` | <=4 cores | 600 particles, DPR <=1.25 |
| `none` | **any touch device**, narrow, <=2 cores, <=2 GB RAM, or no WebGL | CSS gradient + slow ambient drift, **no WebGL at all** |

**three.js is not in the initial payload.** The scene is `next/dynamic` with
`ssr: false`, so text renders and is readable before WebGL is even fetched.
Initial JS is ~136 kB; three.js sits in a separate ~333 kB lazy chunk.

**Reduced motion is a real path.** `prefers-reduced-motion: reduce` skips the
intro, skips Lenis entirely (native scrolling, untouched), freezes the scene,
disables the typewriters and the node-graph loop, and shows all content
immediately.

**Stylesheets.** `globals.css` holds tokens and base rules and imports three
partials: `components.css` (most components), `hero.css` (hero + visual + intro,
which are coupled since the intro releases the hero), and `parts.css` (education
graphic, nav active state, hover polish, heading rhythm).

---

## Deliberate deviations from build.md

1. **No GSAP.** The spec called for it, but after the hero rewrite every entrance
   is a CSS keyframe with a `--enter-delay`, and the camera is lerped in the
   render loop. Nothing was left for GSAP to do, so the dependency was removed
   rather than kept for its own sake.

2. **Camera driven by the render loop, not `ScrollTrigger` scrub.** Scrubbing a
   Lenis-smoothed scroll through ScrollTrigger means two independent easings
   fighting each other. The camera lerps toward a keyframed target every frame —
   one easing, visibly smoother.

3. **Project visuals use `position: sticky`, not a ScrollTrigger pin.** Reads
   identically, needs no `scrollerProxy` to cooperate with Lenis, and cannot
   leave the page stuck in a broken pinned state on resize.

4. **No postprocessing, despite build.md asking for bloom + vignette.** It is a
   full extra render pass over the viewport for an effect that is barely visible
   on an ambient background. Dropping it also removes the postprocessing library
   from the lazy chunk.

5. **The hero name is two lines, not one giant string.** At one size it crowded
   everything; splitting it and dimming the surname gives the block hierarchy
   without extra weight.

---

## Still to fill in

1. **`public/resume.pdf`** — drop it in and rebuild; nothing else to change.
2. **F5-TTS repo URL** — currently a disabled "Code — soon" button. Zeplymart
   (live) and CanvasX (live + code) are wired up.
3. **Screenshots** of Zeplymart and CanvasX. The Zeplymart panel is a CSS
   schematic, labelled "schematic · not a screenshot" so it cannot be mistaken
   for the real UI.
4. **F5-TTS audio sample** — unlocks the real waveform analyser.
5. **`NEXT_PUBLIC_SITE_URL`** — placeholder domain until set.
6. Optional: phone number for the contact section.

---

## Verification status

Checked with a headless Chrome harness at 419 / 768 / 1440 / 2560 px, in both
themes, with reduced motion, and with JavaScript disabled:

- `npm run build` clean, `tsc --noEmit` clean, no ESLint errors
- No console errors or page errors on load or through a full scroll
- No horizontal overflow at any tested width
- **Intro**: overlay at 97ms -> cross-fade at 1534ms -> hero released at 1932ms,
  scroll lock taken and released; skipped on reload (session-scoped) with no
  blank frame; never shown under reduced motion
- **Hero visual**: canvas 420x420 desktop / 290x218 tablet / hidden at 430px;
  never overlaps the name at any width; no large outlined circle anywhere in the
  DOM
- **Education graphic**: 3 rungs from real data (2021/83.4%, 2023/88.2%,
  2026/CGPA 8.5+), spine drawn, nodes faded in, descriptive `aria-label`
- **Nav**: active indicator tracks about -> skills -> work -> contact correctly
- **Fonts**: h1 resolves to Space Grotesk, body to Inter, labels to JetBrains
  Mono (verified via computed `font-family`, not just the CSS)
- **Links**: zeplymart.com, canvasx.canvax1.workers.dev and
  github.com/Patni05/canvasx all return 200 and carry `rel="noopener noreferrer"`
- Text contrast: 34 checks across both themes, all pass (dark 5.8-16.9:1, light
  4.95-17.1:1)
- CLS ~ 0.0001; one background canvas, `aria-hidden`, real drawing buffer; phone
  tier mounts zero canvases
- Exactly one `<h1>`, no skipped heading levels, all landmarks present
- Theme toggle switches, persists to `localStorage`, survives reload
- Copy-email writes to the clipboard, announces via `aria-live`, and reverts
- Mobile menu opens, locks body scroll, closes on Escape, releases scroll, and
  its links scroll to the right section
- **Without JavaScript**: 5,392 characters of readable text, hero fully visible,
  all 50 reveal elements visible, intro overlay hidden
- **Mobile (430px and 820px, touch)**: no horizontal overflow, zero WebGL
  canvases, smallest rendered text 13.3px, every tap target >=40px tall, hero
  name + CTA above the fold, menu opens with 56px rows
- **Effects toggle**: on/off persists across reload and is applied before first
  paint; with it off, three.js is never fetched

**Not verified here:** FPS, LCP, TBT and Lighthouse scores. The only browser
available in this environment was headless Chrome on SwiftShader (software GL),
which cannot produce meaningful numbers for a WebGL page — measurements there
were bad even for the no-WebGL fallback, which shows the harness was the
bottleneck. Run Lighthouse and a DevTools Performance trace on real hardware
before treating the perf targets in build.md as met.
