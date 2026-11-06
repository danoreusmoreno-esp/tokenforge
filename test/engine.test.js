import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSystem, DEFAULT_BRAND, FAMILIES, RADIUS_PRESETS, DENSITIES } from '../src/engine/tokens.js';
import { buildRamp, wcag, apca, solveSolid, randomHex } from '../src/engine/color.js';
import { EXPORTS, toDTCG, toFigma } from '../src/engine/exporters.js';
import { COMPONENTS, CORE_IDS } from '../src/engine/catalog.js';

const brand = { ...DEFAULT_BRAND, components: CORE_IDS, componentTokens: {} };

test('ramps have 12 steps and keep the typed colour at step 9 (light)', () => {
  const r = buildRamp('#7c5cff', 'light');
  assert.equal(r.length, 12);
  assert.equal(r[8], '#7c5cff');
  for (const h of r) assert.match(h, /^#[0-9a-f]{6}$/);
});

test('contrast maths matches known values', () => {
  assert.ok(Math.abs(wcag('#000000', '#ffffff') - 21) < 0.01);
  assert.ok(Math.abs(wcag('#777777', '#ffffff') - 4.48) < 0.02);
  assert.ok(Math.abs(apca('#000000', '#ffffff') - 106) < 1.5);
});

test('solveSolid always yields an AA label', () => {
  for (const h of ['#ffff00', '#00ff00', '#7c5cff', '#ff9900', '#00bcd4', '#999999']) {
    assert.ok(solveSolid(h).ratio >= 4.5, h);
  }
});

test('every audited pair passes WCAG for 200 random brands', () => {
  const radius = Object.keys(RADIUS_PRESETS);
  for (let i = 0; i < 200; i++) {
    const accent = randomHex();
    const sys = computeSystem({ ...brand, colors: { ...brand.colors, accent }, density: Object.keys(DENSITIES)[i % 5], radius: { boxes: radius[i % 6], fields: radius[(i + 1) % 6], selectors: radius[(i + 2) % 6] } });
    const fails = sys.audit.filter((r) => !r.wcagPass);
    assert.deepEqual(fails.map((f) => `${f.appearance} ${f.label} ${f.ratio.toFixed(2)}`), [], `accent ${accent}`);
  }
});

test('all exports render and JSON exports parse', () => {
  const sys = computeSystem(brand);
  for (const e of EXPORTS) assert.ok(e.fn(sys).length > 100, e.id);
  const dtcg = JSON.parse(toDTCG(sys));
  assert.equal(Object.keys(dtcg.color).length, FAMILIES.length);
  assert.ok(dtcg.component.button);
  const fig = JSON.parse(toFigma(sys));
  assert.deepEqual(fig.$metadata.tokenSetOrder, ['global', 'light', 'dark']);
});

test('catalogue ids are unique', () => {
  const ids = COMPONENTS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

import { recommend, EMPTY_BRIEF, toBrief } from '../src/engine/brief.js';

test('brief answers shape the generated system', () => {
  const brief = { ...structuredClone(EMPTY_BRIEF), productType: ['mobile', 'commerce'], platforms: ['ios'], brandColor: '#0f62fe', principles: ['accessible', 'clear'], personality: { tone: 10, energy: 10, density: 5, shape: 0 } };
  const b = recommend(brief, { ...brand });
  assert.equal(b.colors.accent, '#0f62fe');
  assert.equal(b.density, 'compact');
  assert.equal(b.radius.boxes, 'none');
  assert.ok(b.components.includes('nav-bar') && b.components.includes('rating'));
  assert.ok(b.brief.done);
  const md = toBrief(computeSystem(b));
  assert.match(md, /## Principios[\s\S]*Accesible/);
});

test('exports include BRIEF.md and principles reach AGENTS.md', () => {
  const b = recommend({ ...structuredClone(EMPTY_BRIEF), principles: ['predictable'] }, { ...brand });
  const sys = computeSystem(b);
  assert.ok(EXPORTS.some((e) => e.file === 'BRIEF.md'));
  assert.match(EXPORTS.find((e) => e.id === 'agents').fn(sys), /Predictable/);
});

import { effectiveBrand, newSubbrand, slug } from '../src/engine/brands.js';
import { toCSS as css2, toFigma as fig2, toDTCG as dtcg2, toAgents as ag2 } from '../src/engine/exporters.js';

test('sub-brands override identity and export as data-brand themes', () => {
  const master = { ...brand, name: 'Grupo Sol', subbrands: [], customFonts: [{ id: 'f1', name: 'Sol Sans', file: 'SolSans.woff2', format: 'woff2', size: 1000, dataUrl: 'data:font/woff2;base64,AA==' }] };
  const s1 = { ...newSubbrand(master, 1), name: 'Sol Playa', colors: { accent: '#0e7490', neutral: '' }, font: 'Sol Sans' };
  master.subbrands = [s1];
  const eff = effectiveBrand(master, s1.id);
  assert.equal(eff.colors.accent, '#0e7490');
  assert.equal(eff.colors.neutral, master.colors.neutral);
  assert.equal(eff.font, 'Sol Sans');
  assert.equal(eff.density, master.density);
  const sys = computeSystem({ ...eff, __master: master });
  const css = css2(sys);
  assert.match(css, /@font-face \{\n  font-family: 'Sol Sans';/);
  assert.match(css, new RegExp(`\\[data-brand="${slug('Sol Playa')}"\\]`));
  assert.match(css, /:root \{[\s\S]*--color-accent-9: #7c5cff/);
  const fig = JSON.parse(fig2(sys));
  assert.ok(fig['light-sol-playa'] && fig.$themes.some((t) => t.id === 'dark-sol-playa'));
  assert.ok(JSON.parse(dtcg2(sys)).brand['sol-playa'].role['accent-solid']);
  assert.match(ag2(sys), /data-brand="sol-playa"/);
});

import { spring, motionFor, toMotionJS } from '../src/engine/motion.js';

test('springs compile to a linear() easing that ends at 1 and overshoots when bouncy', () => {
  const s = spring(0.3, 0.4);
  const pts = s.easing.slice(7, -1).split(', ').map(Number);
  assert.equal(pts.at(-1), 1);
  assert.ok(Math.max(...pts) > 1, 'bouncy spring overshoots');
  assert.ok(s.ms >= 400);
  const flat = spring(0, 0.3).easing.slice(7, -1).split(', ').map(Number);
  assert.ok(Math.max(...flat) <= 1.0001, 'no bounce, no overshoot');
  assert.equal(motionFor({ ...brand }, 'dialog').enter, 'scale');
  assert.equal(motionFor({ ...brand, componentMotion: { button: { tap: 'bounce' } } }, 'button').tap, 'bounce');
  assert.match(toMotionJS(computeSystem(brand)), /visualDuration/);
});

test('spacing, layout and line heights sit on a 4px base for every preset', () => {
  for (const spacing of ['tight', 'quiet', 'roomy']) {
    for (const density of ['compact', 'default', 'spacious']) {
      const sys = computeSystem({ ...brand, spacing, density });
      assert.equal(sys.spacingUnit, 4);
      for (const v of Object.values(sys.spacing)) assert.equal(v % 4, 0, `space ${v}`);
      for (const vp of Object.values(sys.layout)) for (const [k, v] of Object.entries(vp)) assert.equal(v % 4, 0, `${spacing} ${k} ${v}`);
      for (const vp of Object.values(sys.type)) for (const [k, t] of Object.entries(vp)) assert.equal(t.lineHeightPx % 4, 0, `${density} ${k} lh ${t.lineHeightPx}`);
    }
  }
});
