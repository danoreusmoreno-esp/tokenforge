# Tokenforge

Build a design system from scratch — foundations, components and exports — in the browser.

## What it does

**0. Bases** — a six-step questionnaire before any pixel: why a design system, success measures, team and product scope, platforms, starting approach (scratch, audit or adopt), existing assets, people and stack, up to three principles, personality sliders, accessibility target and dark mode. Answers generate the first foundations and component set, a brief and a roadmap (`BRIEF.md`).

**1. Foundations**
- 6 colour families (accent, neutral, success, critical, warning, info) → 12-step OKLCH ramps, each with a dark twin. Step 9 is the colour you typed.
- ~50 semantic roles (`bg-*`, `border-*`, `text-*`, `{accent,success,…}-{solid,subtle,text,border,on-solid}`) solved for WCAG AA in light and dark. Solids that can't carry a readable label get nudged.
- Contrast audit with WCAG 2 and APCA side by side.
- Type scale with five densities; headings step down on tablet/mobile.
- Spacing from one base unit, plus layout tokens per viewport.
- Radius on three axes (boxes, fields, selectors), elevation, motion.

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
