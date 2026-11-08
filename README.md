# Tokenforge

Build a design system from scratch — foundations, components and exports — in the browser.

The interface is in Spanish. Code exports (`tokens.css`, JSON, Tailwind, `AGENTS.md`) stay in English; `BRIEF.md` is written in Spanish for the team.

## What it does

**0. Bases** — a six-step questionnaire before any pixel: why a design system, success measures, team and product scope, platforms, starting approach (scratch, audit or adopt), existing assets, people and stack, up to three principles, personality sliders, accessibility target and dark mode. Answers generate the first foundations and component set, a brief and a roadmap (`BRIEF.md`).

**1. Foundations**
- 8 colour families in three groups: brand key colours (primary, secondary, tertiary), one neutral, and semantic colours (success, warning, critical, info). Secondary and tertiary derive from the primary (Material 3 style: same hue but quieter, and +60° for contrast) until you set them; semantics can be harmonized toward the primary (≤15° hue shift). Each family becomes a 12-step OKLCH ramp per appearance. Dark mode adapts every colour by default, or takes your own dark seed per family.
- ~50 semantic roles (`bg-*`, `border-*`, `text-*`, `{primary,secondary,tertiary,success,…}-{solid,subtle,text,border,on-solid}`) solved for WCAG AA in light and dark. Solids that can't carry a readable label get nudged.
- Contrast audit with WCAG 2 and APCA side by side.
- Type scale with five densities; headings step down on tablet/mobile.
- Spacing from one base unit, plus layout tokens per viewport.
- Radius on three axes (boxes, fields, selectors), elevation, motion.

**Brands, logos and fonts** — upload a logo per brand; add up to 4 sub-brands inside the same system (each with its own primary, secondary, tertiary, neutral (light and dark), fonts and logo; structure, status colours and components are shared). Exports put the master at `:root` and each sub-brand under `[data-brand="…"]`, add per-brand sets to the Figma file and list brands in AGENTS.md. Upload your own font files (WOFF2, WOFF, TTF, OTF) or type any Google Fonts family; uploaded fonts are emitted as `@font-face` pointing to `./fonts/`.

**Motion** — springs in the Motion (motion.dev) model (bounce + visual duration) compiled to CSS `linear()`; per component: entrance, hover, tap and its own effect (sliding background, animated number, drawn check, spring knob, smooth expand, stagger). Exported as keyframes and `data-enter/hover/tap` rules in tokens.css and as presets for `motion/react` in `motion.js`.

**2. Components** — a catalogue of 48 components taken from the shared inventory of Material 3, Carbon, Polaris, Atlassian, Primer, Fluent 2, Spectrum and Radix/shadcn. Pick what goes into your system, see every variant and state, tune component tokens.

**3. Board** — every chosen component on one wall, painted live.

**4. Export** — `tokens.css`, W3C DTCG `tokens.json`, Tokens Studio `figma-tokens.json` (→ Figma Variables, Light/Dark modes), `tailwind.config.js`, `AGENTS.md` for AI coding agents, `README.md`. Share a brand via link.

Brands are stored in the browser (localStorage). Random brand and six starting directions included.

## Develop

```bash
npm install
npm run dev          # local dev server
npm test             # engine tests (contrast on 200 random brands, exports)
npm run build        # dist/
npm run build:single # dist-single/index.html — one self-contained file
```

## Structure

```
src/engine/   color.js (ramps, WCAG, APCA) · tokens.js (system) · catalog.js · exporters.js
src/components/ Inspector, previews (one renderer per catalogue component), icons
src/views/    Home, Foundations, Components, Board, Code
src/ds.css    component library styled only with the generated tokens
```

## Roadmap
- Phase 2: generated documentation site per foundation/component, more components, React component code export.
- Phase 3: accounts and cloud sync, team sharing, native Figma plugin, GitHub push.
