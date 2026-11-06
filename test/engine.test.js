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
