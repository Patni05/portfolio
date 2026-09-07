# BUILD PROMPT — 3D Interactive Developer Portfolio for Bhupesh Patni

> **How to use this file:** Paste the whole thing as the prompt to a coding agent (Claude Code, Cursor, etc.), or hand it to me and say "build this". Everything the agent needs — stack, content, animation direction, section-by-section spec, and acceptance criteria — is below. Placeholders marked `<<TODO>>` must be filled by Bhupesh before launch.

---

## 1. Mission

Build a **single-page, scroll-driven 3D portfolio website** for Bhupesh Patni — a BCA final-year full-stack developer. It must feel like a *developer's* portfolio: terminal aesthetics, typing/code animations, and real 3D depth — not a generic template. Priorities in order:

1. **Smooth** — buttery scroll, no jank, 60fps on a mid-range laptop.
2. **Interactive** — the visitor's cursor and scroll position visibly change the scene.
3. **Substantive** — every project's real work and links are front and center.
4. **Fast** — LCP under 2.5s, works on mobile without the 3D killing the battery.

Recruiters must be able to skim it in 30 seconds and developers must want to scroll to the end.

---

## 2. Tech stack (use exactly this unless a swap is justified in the README)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, TypeScript, strict mode) | Matches Bhupesh's own stack; static export friendly |
| Styling | **Tailwind CSS v4** + CSS variables for theme tokens | Fast, consistent |
| 3D | **three.js** via **@react-three/fiber** + **@react-three/drei** | Declarative 3D in React |
| 3D extras | `@react-three/postprocessing` (bloom, chromatic aberration, vignette) | Cheap "wow" |
| Scroll | **Lenis** (`lenis` / `@studio-freight/lenis`) for smooth inertial scroll | The single biggest "smooth" win |
| Animation | **GSAP + ScrollTrigger** for scroll timelines, **Framer Motion** (`motion`) for component/enter animations | GSAP for scrubbed scenes, Motion for UI |
| Typing FX | Custom hook (no library) or `typed.js` for the terminal | Full control over cursor + speed |
| Icons | `lucide-react` + `react-icons` (for brand/tech logos) | Complete coverage |
| Fonts | `JetBrains Mono` (code/UI accents) + `Inter` or `Geist Sans` (prose), via `next/font` | Self-hosted, no layout shift |
| Deploy | **Cloudflare Pages** (or Workers via `@opennextjs/cloudflare`) | Bhupesh already uses Cloudflare |

**Hard rule:** pin exact versions in `package.json`. No `latest`.

---

## 3. Design direction

**Theme: "The Terminal in Space."** Dark-first, deep near-black background (`#0A0A0B`), a single electric accent, thin monospace labels, generous whitespace, and a 3D layer that lives *behind* the content rather than fighting it.

**Palette (tokens in `globals.css`, both themes required):**

```
--bg          #0A0A0B   /* near-black, not pure black */
--surface     #121215
--border      #26262B
--text        #EDEDF0
--text-dim    #8A8A95
--accent      #4F8DFF   /* electric blue — primary */
--accent-2    #22D3A6   /* mint — success/secondary */
--accent-3    #A855F7   /* violet — used sparingly, 3D glow only */
```

- Ship a **light theme too** (toggle in the nav, persisted to `localStorage`, respects `prefers-color-scheme` on first visit). Light theme = warm off-white `#FAFAF8`, same accent, softer 3D.
- Type scale: `clamp()` everywhere. Hero headline `clamp(2.5rem, 8vw, 7rem)`, tight tracking (`-0.03em`), `font-weight: 600`.
- Every section label is a monospace kicker like `// 01 — about` in `--text-dim`.
- Borders 1px, radii small (`4–8px`) — sharp and technical, not bubbly.
- **Grain overlay:** a subtle SVG/canvas noise layer at 3–4% opacity over the whole page. Cheap, makes it look designed.

---

## 4. The 3D layer

One persistent `<Canvas>` fixed behind all content (`position: fixed; inset: 0; z-index: 0`), driven by scroll progress. **Do not mount a new canvas per section** — one scene, animated camera and swapped objects.

### Scene contents

1. **Particle field / starfield** — 3,000–6,000 instanced points, slow drift, subtle parallax to mouse. Reduce to ~800 on mobile.
2. **Hero centerpiece** — a slowly rotating **wireframe icosahedron** (or a distorted sphere using `MeshDistortMaterial` from drei) that:
   - rotates continuously on a slow idle loop,
   - tilts toward the cursor (lerped, damping ~0.05 — never snappy),
   - explodes/disperses into particles as the user scrolls out of the hero.
3. **Floating code glyphs** — 20–40 instanced sprites/`<Text>` of characters `{ } < > / ; = => [] () #` drifting in 3D depth. These are the "coding feeling."
4. **Per-section accents** — as scroll enters each section, one geometric form fades in behind it (torus for Skills, grid plane for Projects, DNA-ish helix of particles for the F5-TTS/AI project). Fade the previous one out. Cross-fade, never hard-cut.
5. **Postprocessing** — `Bloom` (low intensity, ~0.4), `Vignette`, optional `ChromaticAberration` at 0.0005. **Disable all postprocessing on mobile and on low-end GPUs.**

### Scroll-camera choreography (GSAP ScrollTrigger, `scrub: 1`)

| Scroll % | Camera | Scene |
|---|---|---|
| 0–15 | z: 8, centered | Icosahedron front and center, glyphs drifting |
| 15–30 | pull back to z: 14, drift left | Icosahedron disperses; About text enters from right |
| 30–50 | orbit right, slight y-rise | Skills torus rotates in; glyphs speed up |
| 50–80 | dolly in to z: 6, grid plane tilts under content | Project cards; grid moves like a runway |
| 80–100 | pull back to z: 18, everything settles | Particle field only; contact section |

Use a single normalized `scrollProgress` value (0→1) in a Zustand store or React context, read inside R3F via `useFrame`. **Never** drive R3F state from React re-renders on scroll — that's the #1 jank source.

---

## 5. Performance rules (non-negotiable — these are acceptance criteria)

- `dpr={[1, 1.5]}` on the Canvas, never uncapped.
- Use `<AdaptiveDpr />` and `<AdaptiveEvents />` from drei.
- All repeated geometry uses `InstancedMesh` / `<Instances>`. Zero `new THREE.Mesh()` inside `useFrame`.
- Zero allocations in `useFrame` — hoist all `Vector3`/`Color`/`Quaternion` objects to module or ref scope.
- `frameloop="demand"` is *not* suitable here (continuous animation), but **pause rendering when the canvas is offscreen or the tab is hidden** (`document.visibilityState` + IntersectionObserver).
- **`prefers-reduced-motion: reduce`** → disable Lenis, disable all scrub animations, freeze the 3D to a static tasteful pose, show all content immediately. Test this path.
- **Mobile / low-power fallback:** if `navigator.hardwareConcurrency <= 4` or the device is touch-primary with a narrow viewport, render a **static gradient + CSS-animated particle** background instead of the full WebGL scene. Detect once, don't thrash.
- Lazy-load the Canvas with `next/dynamic` + `ssr: false`, behind a `<Suspense>` with a minimal skeleton. The text content must render and be readable **before** WebGL boots.
- Lighthouse targets: **Performance ≥ 90 desktop / ≥ 75 mobile, Accessibility ≥ 95, LCP < 2.5s, CLS < 0.05, TBT < 200ms.**
- Bundle: keep the initial JS route payload under ~200KB gzip excluding the 3D chunk.

---

## 6. Page structure & content

Nav: fixed, minimal, blurred backdrop on scroll. Links: `about · skills · work · contact` + theme toggle + a `resume.pdf` download button. On mobile, collapse to a full-screen overlay menu.

Also add a thin **scroll progress bar** (1–2px, accent color) at the very top.

---

### Section 0 — Hero

Full viewport. Centered or left-aligned over the 3D icosahedron.

- Kicker (monospace, dim): a **typed terminal line** that types itself out on load:
  ```
  $ whoami
  > bhupesh_patni
  ```
  Blinking block cursor. Types at ~40ms/char with a realistic slight jitter.
- Headline: **BHUPESH PATNI** — huge, tight, split into per-character spans that stagger up (`y: 100% → 0`, 40ms stagger, `power4.out`).
- Subline, cycling with a typewriter delete/retype loop:
  `Full-Stack Developer` → `Next.js & React` → `Node · PostgreSQL · Prisma` → `AI / TTS Fine-Tuning` → `Cloudflare Workers`
- One-line positioning statement: *"BCA final-year student building full-stack products, real-time collaborative tools, and fine-tuned speech models."*
- Two CTAs: `View Work` (primary, scrolls to projects with Lenis) and `Download Resume` (outline).
- Social row: GitHub, LinkedIn, Email — icon buttons with a magnetic hover (icon translates ~4px toward cursor).
- Bottom: an animated scroll hint (mouse/chevron with a soft loop).

---

### Section 1 — About

Two-column on desktop (text left, visual right), stacked on mobile.

**Copy (use this, lightly edited if needed):**

> I'm a final-year BCA student at Graphic Era Hill University, Dehradun, with a CGPA of 8.5+. I build full-stack web applications end to end — from Postgres schemas and REST APIs to the interaction details in the browser.
>
> My work spans a multi-role grocery delivery platform, an infinite real-time collaborative whiteboard, and a fine-tuned Hindi text-to-speech model trained on 80+ GB of speech data. I like problems where architecture matters: plugin systems that stay extensible, dashboards that stay fast, and pipelines that stay reproducible.
>
> Right now I'm looking for a role where I can ship real product and keep going deeper on systems and AI.

**Right column — a "terminal card"**: a faux macOS/Linux terminal window (title bar with three dots reading `bhupesh@portfolio: ~`) that, when scrolled into view, **types out** a JSON/JS object about him line by line with syntax highlighting:

```js
const bhupesh = {
  role:      "Full-Stack Developer",
  location:  "Dehradun, Uttarakhand, IN",
  education: "BCA @ Graphic Era Hill University (2023–2026)",
  cgpa:      "8.5+",
  focus:     ["Next.js", "Node.js", "PostgreSQL", "AI/TTS"],
  currently: "Looking for full-time SDE roles",
  open_to:   ["Full-time", "Internship", "Freelance"],
};
```
Type it once on first view (use ScrollTrigger `once: true`), respect reduced-motion by showing it complete.

**Quick-stat row** (count-up animation on enter, `IntersectionObserver`):
`8.5+ CGPA` · `3 Major Projects` · `80GB+ Speech Data Trained` · `10+ Technologies`

**Education timeline** — a vertical line with three nodes that draw in on scroll:
- **Graphic Era Hill University** — BCA, 2023–2026, Dehradun · CGPA 8.5+
- **Govt Inter College, Gorangchaur** — Class XII, 2023, Pithoragarh · 88.2%
- **Govt Inter College, Gorangchaur** — Class X, 2021, Pithoragarh · 83.4%

---

### Section 2 — Skills

Not a boring list. Render as **grouped chip clusters** with a per-chip hover that lifts it and glows the accent. Each group is a labeled card. On scroll-in, chips stagger in with a small scale+fade.

- **Languages** — JavaScript, TypeScript, Python, Java, C++, C
- **Frontend** — React.js, Next.js, HTML, CSS, Tailwind CSS, Bootstrap
- **Backend** — Node.js, Express.js, REST APIs, API Integration
- **Databases** — PostgreSQL, MongoDB, MySQL, Prisma ORM
- **DevOps & Cloud** — Docker, Linux, Cloudflare Workers, Cloudflare Tunnel, Deployment & Hosting
- **Automation & Testing** — Bash Scripting, Python Automation, Selenium, Apache JMeter, Postman
- **AI / ML** — Model Training, Fine-Tuning, Dataset Preparation, F5-TTS
- **Tools** — Git, GitHub, VS Code, Figma
- **Core CS** — DSA, OOP, DBMS, Operating Systems, Computer Networks

Each chip shows its real brand icon (`react-icons/si`) where one exists. **Do not** invent proficiency percentages or star ratings — nobody believes them.

---

### Section 3 — Work (the centerpiece)

Three projects. Layout: full-width alternating rows on desktop (visual one side, detail the other), each pinned briefly with ScrollTrigger so the detail column animates through its bullets while the visual holds. Stack to single-column cards on mobile with no pinning.

Each project card needs: year badge, title, one-line tagline, tech chips, 3–4 bullets, and **Live** + **GitHub** link buttons (external, `target="_blank" rel="noopener noreferrer"`, with an arrow-out icon that translates on hover).

#### 3.1 — Zeplymart · 2026
*Full-Stack Multi-Role Grocery Delivery Platform*
Tech: `Next.js 15` `React 19` `TypeScript` `Tailwind CSS` `PostgreSQL` `Prisma` `Zod` `SWR` `Firebase Auth` `JWT` `bcrypt` `Recharts` `Google Maps API`
- Full-stack, multi-role grocery delivery platform supporting Customer, Admin, Manager, and Delivery Rider workflows.
- Role-based admin and operations dashboards with SWR-powered live data updates and Recharts analytics for orders, delivery activity, and sales performance.
- PostgreSQL + Prisma ORM backend with Zod validation and secure auth via Firebase Auth, JWT, and bcrypt.
- Integrated Google Maps, Places, and Distance Matrix APIs for address selection, live location tracking, driving-distance calculation, and delivery ETA estimation.

Links: Live → `<<TODO: Zeplymart live URL>>` · Code → `<<TODO: Zeplymart repo URL>>`

#### 3.2 — CanvasX · 2026
*Real-Time Collaborative Infinite Whiteboard*
Tech: `TypeScript` `React` `Canvas2D` `Cloudflare Workers` `Durable Objects` `WebSockets`
- Infinite collaborative whiteboard supporting drawing, shapes, arrows, text, images, sticky notes, tables, code blocks, search, and export.
- Extensible plugin-based architecture — new canvas elements inherit move, resize, rotate, undo, export, grouping, and real-time collaboration without touching core editor logic.
- Deployed on Cloudflare Workers and Durable Objects, serving both the app and the collaboration relay from a single secure origin.

Links: Live → `<<TODO: CanvasX live URL>>` · Code → `<<TODO: CanvasX repo URL>>`

**Bonus interaction:** on hover of the CanvasX visual, let the visitor actually scribble a few strokes on a tiny embedded canvas that clears on mouse-leave. Small, delightful, on-theme.

#### 3.3 — F5-TTS Hindi Speech Synthesis · 2025
*Fine-Tuned Hindi Text-to-Speech Model*
Tech: `Python` `F5-TTS` `PyTorch` `Audio Preprocessing` `Dataset Pipelines`
- Trained and fine-tuned an F5-TTS Hindi text-to-speech model on 80+ GB of Hindi speech data for natural, intelligible synthesis.
- Built the full speech-data preprocessing pipeline: audio cleaning, normalization, dataset filtering, text processing, alignment, and training-data preparation.
- Optimized training and inference to improve Hindi pronunciation accuracy, naturalness, speaker consistency, and generation quality.
- Designed for integration with AI voice assistants, accessibility systems, content generation, and speech-enabled applications.

Visual: an **animated audio waveform** (canvas bars reacting to a subtle sine loop, or real bars if a sample clip is provided). If Bhupesh supplies a sample WAV/MP3, add a play button that drives a real Web Audio `AnalyserNode` waveform — that would be the single most impressive interaction on the site.

Links: Code → `<<TODO: F5-TTS repo URL>>` · Sample audio → `<<TODO: optional audio file>>`

---

### Section 4 — Achievements

Two clean cards, icon + title + detail, fade-up stagger.
- **Merit-Based Scholarship — ₹80,000** · Awarded for outstanding performance in Class XII.
- **Cyber Security Certification — FutureLearn** · Foundational cybersecurity concepts and digital security practices.

---

### Section 5 — Contact

Big, confident closer. Headline: **"Let's build something."** Subline: *"Open to full-time roles, internships, and freelance work. Usually reply within a day."*

- Primary: a large mailto button → `patnibhupesh2@gmail.com`, with a copy-to-clipboard icon that shows a "Copied" toast.
- Secondary links: GitHub `github.com/Patni05` · LinkedIn `linkedin.com/in/bhupeshpatni` · Location `Dehradun, Uttarakhand, India`
- **Optional contact form:** only build it if a backend is wired (Resend / Formspree / a Cloudflare Worker + Turnstile). A form that silently does nothing is worse than no form. If unwired, skip it.
- Footer: `Built with Next.js, three.js & too much coffee — © 2026 Bhupesh Patni` + a tiny live clock in IST for personality.

---

## 7. Reusable pieces to build

- `useScrollProgress()` — normalized 0→1 page progress, rAF-throttled, Lenis-aware.
- `useTypewriter(strings, opts)` — type/delete loop with configurable speed, pause, and jitter; reduced-motion aware.
- `useMagneticHover(ref, strength)` — element translates toward cursor.
- `<Reveal>` — wraps children, fades/slides up on first intersection with a stagger prop.
- `<SectionLabel index label />` — the `// 01 — about` kicker.
- `<TechChip name />` — auto-resolves the brand icon by name.
- `<CountUp to />` — for the stat row.
- `<Terminal lines />` — the faux terminal with syntax-highlighted typed output.
- `<ProjectRow project />` — driven by a typed `Project[]` in `src/data/projects.ts`.

**All content lives in typed data files** under `src/data/` (`profile.ts`, `skills.ts`, `projects.ts`, `education.ts`, `achievements.ts`). Zero hardcoded copy inside components — so updating the portfolio is editing one object.

---

## 8. Accessibility

- Real semantic landmarks: `<header> <nav> <main> <section aria-labelledby> <footer>`. One `<h1>` (the hero name), logical `h2`/`h3` order.
- Every interactive element keyboard-reachable with a **visible focus ring** in the accent color. Tab order follows visual order.
- Canvas gets `aria-hidden="true"` — it's decoration and must never trap focus.
- Contrast: all text ≥ 4.5:1 against its actual background (check the dim text over the grain overlay — this is where it usually fails).
- A "skip to content" link as the first focusable element.
- Reduced-motion path is a first-class experience, not a broken one.

---

## 9. SEO & meta

- `metadata` export: title `Bhupesh Patni — Full-Stack Developer`, a real description, canonical URL.
- OpenGraph + Twitter card with a generated image (use `next/og` / `ImageResponse` — dark card, name, role, accent line).
- `JSON-LD` `Person` schema with name, jobTitle, alumniOf, sameAs (GitHub/LinkedIn), email.
- `robots.txt`, `sitemap.xml`, favicon set, `manifest.json`.
- `public/resume.pdf` — the actual resume, linked from nav and hero.

---

## 10. Deliverables

```
D:\newClaude\
├─ src/
│  ├─ app/            layout.tsx, page.tsx, globals.css, opengraph-image.tsx
│  ├─ components/     hero/, about/, skills/, work/, contact/, ui/
│  ├─ three/          Scene.tsx, Particles.tsx, HeroObject.tsx, CodeGlyphs.tsx, Effects.tsx
│  ├─ hooks/          useScrollProgress, useTypewriter, useMagneticHover, useReducedMotion
│  ├─ data/           profile.ts, skills.ts, projects.ts, education.ts, achievements.ts
│  └─ lib/            lenis.ts, gsap.ts, device.ts (capability detection)
├─ public/            resume.pdf, project screenshots, favicons
├─ README.md          setup, scripts, how to edit content, deploy steps
└─ package.json       pinned versions
```

Also deliver in the README: a **"How to update your portfolio"** section written for Bhupesh — which file to edit to add a project, change the tagline, or swap the accent color.

---

## 11. Definition of done

- [ ] `npm run build` passes clean. `tsc --noEmit` passes. No ESLint errors.
- [ ] Zero console errors or React warnings on load and through a full scroll.
- [ ] Scrolls smoothly top-to-bottom at 60fps on a mid-range laptop; verified in DevTools Performance.
- [ ] Every one of the three projects shows correct bullets, tech chips, and working external links (or a clearly-marked TODO if the URL wasn't supplied).
- [ ] Works at 320px, 768px, 1440px, and 2560px wide — no horizontal page scroll at any width.
- [ ] Light and dark themes both complete; toggle persists across reload.
- [ ] `prefers-reduced-motion` path verified: no scroll hijack, all content visible.
- [ ] Mobile fallback verified: no WebGL scene, page still looks intentional.
- [ ] Lighthouse: Perf ≥ 90 desktop, A11y ≥ 95, Best Practices ≥ 95, SEO 100.
- [ ] Keyboard-only pass reaches every link and button with a visible focus ring.

---

## 12. Things NOT to do

- No fake metrics, invented job titles, made-up company names, or skill percentage bars.
- No `<<TODO>>` left silently in the UI — render a disabled "Coming soon" state or omit the button, and list every unfilled TODO in the README.
- No scroll-jacking that fights the user's input or breaks `Ctrl+F` / `End` / anchor links.
- No 3D-first loading — text and content must be readable before WebGL initializes.
- No autoplaying audio.
- No 8-second intro animation before the visitor can read anything. Cap the hero intro at ~1.2s total.
- No heavy 3D model files (`.glb` over ~1MB); everything here is procedural geometry.

---

## 13. Open items for Bhupesh

1. Live + repo URLs for **Zeplymart**, **CanvasX**, and **F5-TTS**.
2. Screenshots or short screen-recordings of Zeplymart and CanvasX for the project visuals.
3. A sample audio clip from the F5-TTS model (unlocks the real waveform interaction).
4. `resume.pdf` to drop into `public/`.
5. Confirm: is the accent electric blue `#4F8DFF`, or would he prefer mint / violet as primary?
6. Optional: phone number for the contact section, and target domain for deploy.
