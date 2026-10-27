# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A [Docusaurus](https://docusaurus.io/) 3.9 site (React 19) that serves as Alok Xavier's personal portfolio plus a blog ("Weekly learning log"), deployed to GitHub Pages at `alok-xavier.github.io`. The homepage is about Alok first (photo, bio, interests, AI hackathon builds, favourite repos); his TCS / Avis Budget Group job is a secondary "Day job" section.

## Commands

Package manager: npm.

```bash
npm install          # install dependencies
npm start            # local dev server with live reload
npm run build        # static output to ./build (fails on broken links)
npm run serve        # serve the built site locally
npm run clear        # clear Docusaurus cache
```

There is no test suite, linter, or typecheck script configured.

## Architecture

- **Design system.** Concept is "keeping the lights on": night indigo (`--ax-night`) frames the page, sodium amber (`--ax-sodium`) is the only accent. Tokens are `--ax-*` custom properties at the top of `src/css/custom.css`, which also overrides Infima for blog pages. Light mode only.
- **Type.** Archivo variable font (weight + width axes), self-hosted via `@fontsource-variable/archivo` and loaded through `customCss` in `docusaurus.config.js`. Display text uses `font-stretch` 112–125%. JetBrains Mono for code.
- **Interactivity libraries.** `framer-motion` (entrances, hover, tilt, count-ups), `three` + `@react-three/fiber` (hero city and F1 car). Keep `framer-motion` and its `motion-dom` dependency on matching versions — a mismatch breaks the build with "is not exported from 'motion-dom'".
- **Homepage** is a scroll-driven story in `src/pages/index.js` + `index.module.css`. Order: Intro (first visit per session) → Hero → Note → Gallery → ChapterCards → On call (OnCallIntro, Hackathon builds, Day job, On my shelf, Certified) → Off the clock (OffClockIntro, interests) → Say hello. Copy for the day job, certs and toolbox lives in arrays at the top of `index.js`; other copy lives with its component.
- **Motion stack.** `src/lib/motion.js` lazy-loads GSAP + ScrollTrigger in the browser (`useGsap(scopeRef, setup)` wraps setup in a `gsap.context` that is reverted on unmount) and runs Lenis smooth scrolling on the homepage (`useSmoothScroll`), wired to ScrollTrigger. Use `scrollToId(id)` for in-page jumps so Lenis stays in sync. Pinned sections: the Gallery (horizontal reel, desktop only) and On call (giant type + 3D city). framer-motion is still used for smaller hover/enter animations.
- **Intro** (`src/components/Intro/`): a ~2.5 s "kubectl rollout" boot screen with the signature, skippable with any key/click, shown once per session. An inline script in `docusaurus.config.js` adds `html.ax-no-intro` before first paint on repeat visits or reduced motion so it never flashes.
- **Signature** (`src/components/Signature/`): centreline strokes traced from Alok's handwritten signature (`paths.js`), drawn with stroke-dash animation on load or when scrolled into view.
- **Photos** live in `static/img/photos/` as `NAME-900.webp` and `NAME-480.webp`. The hero uses `hills`; the Gallery reel uses the rest. To add a photo, export both sizes and replace a `{type: 'slot'}` entry in `REEL` in `src/components/Gallery/index.js` (slots render as "Photo coming soon" frames until then). Captions have optional `place` and `year`.
- **Layering.** `TechBackground` is a `position: fixed` canvas at `z-index: 0`; every top-level `header`/`section` in `.page` is `z-index: 1`. Light sections are transparent so the canvas shows through; dark sections and the hero are opaque and hide it.
- **Components** (`src/components/`):
  - `Hero/` — `index.js` is the photo-first hero (full-height photo, giant name split per letter, signature, résumé/email buttons; name lines drift apart on scroll). `CityScene.js` is the r3f night city of 1,500 instanced lights in 23 districts, now rendered inside the pinned On call section (`Chapters/`).
  - `Chapters/` — `ChapterCards` (On call / Off the clock doors), `OnCallIntro` (pinned giant type + 3D city + stats), `OffClockIntro` (giant type + scroll-velocity ticker).
  - `Note/` — "A note from Alok": words light up as you scroll; wrap phrases in `*asterisks*` to highlight them.
  - `Gallery/` — horizontal photo reel with one-liners and photo slots.
  - `TechBackground/` — fixed canvas of drifting tool names/commands that link up like a service mesh, carry "traffic" packets, react to the pointer and parallax on scroll. Edit `TOKENS` to change the words.
  - `Interests/` — `F1Car.js` + `F1Scene.js` (original F1-style car in an "AX" livery — racing red, night indigo, white; no team branding. Bodywork is extruded/lathed from 2D profiles; paint is clearcoat with a RoomEnvironment reflection map; a fake soft shadow replaces shadow maps for performance. Idle: steering sweep and suspension bob. "Fire it up" runs a 3.2 s sequence — wheel spin, rear-wing flap opens, rain light blinks, exhaust glow, shake, speed streaks. "Explode" slides parts out with projected labels. Part notes live in `F1Car.js`; explode offsets/anchors in `PARTS` in `F1Scene.js`), `Barbell`, `RainRide`, `AimTrainer`.
  - `Projects/` — Covenant Radar (`RadarSweep`) and SentinelIQ (`PlantFloor`). Demos are labelled illustrative; numbers in the project copy come from the repos' READMEs and eval reports.
  - `Repos/` — "On my shelf": two lists, `FAVOURITES` and `STUDY`, at the top of `index.js`. Star counts and language come live from the GitHub API, cached in localStorage for 12 hours; if the API fails the cards render without them.
  - `FleetMap/` — seeded 2D map of 1,500 lights; used in Day job and as the no-WebGL hero fallback.
  - `CommandPalette/` — Ctrl/⌘+K menu; commands are defined in `src/pages/index.js`.
- **`src/lib/hooks.js`** — `useReducedMotion`, `useInView` (pause loops off-screen), `hasWebGL`, and `safeStore` (localStorage wrapped in try/catch).
- **Motion rules.** Every continuous animation must pause off-screen and respect `prefers-reduced-motion`. Browser-only APIs go in `useEffect` or `<BrowserOnly>` (pages are pre-rendered at build).
- **Docs are disabled** (`docs: false` in config). To add "Deep dives" back: create `docs/`, a `sidebars.js`, restore the `docs` preset block and a navbar item.
- **Blog**: author key `alok` in `blog/authors.yml`; tags must exist in `blog/tags.yml`; put `<!-- truncate -->` in each post.
- **Static assets** in `static/`: résumé `files/resume.pdf`, photo `img/alok-portrait.{webp,jpg}` (640×800, shown as a circle), logo/favicons, `img/social-card.png` (1200×630 Open Graph image, a capture of the hero).
- **Deployment**: `.github/workflows/deploy.yml` builds on every push to `main` (`npm ci && npm run build`) and publishes `./build` to GitHub Pages. CI is the production deploy path.
