import { DEFAULT_BRAND, FONTS, DENSITIES, RADIUS_PRESETS, SHADOW_PRESETS, SPACING_PRESETS, MOTION_PRESETS } from './engine/tokens.js';
import { randomHex, tintedNeutral } from './engine/color.js';
import { CORE_IDS } from './engine/catalog.js';

const KEY = 'tf-brands-v1';
const ACTIVE = 'tf-active-v1';

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function newBrand(over = {}) {
  return { ...structuredClone(DEFAULT_BRAND), id: uid(), components: [...CORE_IDS], componentTokens: {}, updatedAt: Date.now(), ...over };
}

export function loadBrands() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (Array.isArray(list) && list.length) return list.map(migrate);
  } catch { /* storage unavailable */ }
  return [newBrand()];
}

function migrate(b) {
  const base = newBrand();
  return { ...base, ...b, colors: { ...base.colors, ...b.colors }, radius: { ...base.radius, ...b.radius }, components: b.components ?? base.components, componentTokens: b.componentTokens ?? {} };
}

export function saveBrands(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
}
export function loadActive() {
  try { return localStorage.getItem(ACTIVE); } catch { return null; }
}
export function saveActive(id) {
  try { localStorage.setItem(ACTIVE, id); } catch { /* ignore */ }
}

const pick = (o) => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; };
const NAMES = ['Nova', 'Atlas', 'Ember', 'Fjord', 'Lumen', 'Orbit', 'Quill', 'Sable', 'Tide', 'Verde', 'Zinc', 'Harbor', 'Kite', 'Mesa'];

export function randomize(brand) {
  const accent = randomHex();
  const radiusKey = pick(RADIUS_PRESETS);
  return {
    ...brand,
    name: brand.name,
    colors: { ...brand.colors, accent, neutral: tintedNeutral(accent, Math.random() * 0.02) },
    font: FONTS[Math.floor(Math.random() * 8)].name,
    headingFont: FONTS[Math.floor(Math.random() * (FONTS.length - 1))].name,
    density: pick(DENSITIES),
    radius: { boxes: radiusKey === 'pill' ? 'large' : radiusKey, fields: pick(RADIUS_PRESETS), selectors: pick(RADIUS_PRESETS) },
    shadow: pick(SHADOW_PRESETS),
    spacing: pick(SPACING_PRESETS),
    motion: pick(MOTION_PRESETS),
  };
}

export function randomName() {
  return NAMES[Math.floor(Math.random() * NAMES.length)];
}

/** Starting points inspired by the general character of well-known systems (values are our own). */
export const STARTERS = [
  { id: 'saas', name: 'Product SaaS', note: 'Clean, neutral, compact — app-first', brand: { colors: { accent: '#4f46e5', neutral: '#64748b' }, font: 'Inter', headingFont: 'Inter', density: 'snug', radius: { boxes: 'rounded', fields: 'soft', selectors: 'subtle' }, shadow: 'subtle', spacing: 'quiet', motion: 'snappy' } },
  { id: 'enterprise', name: 'Enterprise', note: 'Square corners, dense data, strong contrast', brand: { colors: { accent: '#0f62fe', neutral: '#6f6f6f' }, font: 'IBM Plex Sans', headingFont: 'IBM Plex Sans', density: 'compact', radius: { boxes: 'none', fields: 'none', selectors: 'none' }, shadow: 'none', spacing: 'quiet', motion: 'standard' } },
  { id: 'expressive', name: 'Expressive', note: 'Rounded, tonal, friendly motion', brand: { colors: { accent: '#6750a4', neutral: '#79747e' }, font: 'DM Sans', headingFont: 'DM Sans', density: 'comfortable', radius: { boxes: 'large', fields: 'pill', selectors: 'pill' }, shadow: 'medium', spacing: 'roomy', motion: 'expressive' } },
  { id: 'commerce', name: 'Commerce', note: 'Warm, approachable, merchant-style admin', brand: { colors: { accent: '#008060', neutral: '#6d7175' }, font: 'Plus Jakarta Sans', headingFont: 'Plus Jakarta Sans', density: 'default', radius: { boxes: 'rounded', fields: 'soft', selectors: 'soft' }, shadow: 'medium', spacing: 'quiet', motion: 'standard' } },
  { id: 'editorial', name: 'Editorial', note: 'Serif headings, generous rhythm', brand: { colors: { accent: '#b4441e', neutral: '#6b655e' }, font: 'Source Serif 4', headingFont: 'Fraunces', density: 'spacious', radius: { boxes: 'subtle', fields: 'subtle', selectors: 'subtle' }, shadow: 'none', spacing: 'roomy', motion: 'standard' } },
  { id: 'dev', name: 'Developer tool', note: 'Mono accents, crisp borders', brand: { colors: { accent: '#1f883d', neutral: '#656d76' }, font: 'Inter', headingFont: 'Space Grotesk', monoFont: 'JetBrains Mono', density: 'compact', radius: { boxes: 'soft', fields: 'soft', selectors: 'subtle' }, shadow: 'subtle', spacing: 'tight', motion: 'snappy' } },
];

export function applyStarter(brand, starter) {
  const s = starter.brand;
  return { ...brand, ...s, colors: { ...brand.colors, ...s.colors }, radius: { ...brand.radius, ...s.radius } };
}

// Share link: brand encoded in the URL hash.
export function encodeBrand(b) {
  const { id, updatedAt, ...rest } = b;
  void id; void updatedAt;
  return btoa(unescape(encodeURIComponent(JSON.stringify(rest))));
}
export function decodeBrand(s) {
  try { return migrate({ ...JSON.parse(decodeURIComponent(escape(atob(s)))), id: uid() }); } catch { return null; }
}
