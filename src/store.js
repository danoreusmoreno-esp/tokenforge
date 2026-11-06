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

const SANS = FONTS.filter((f) => f.category === 'sans-serif');
const TEXT_FONTS = FONTS.filter((f) => f.category !== 'monospace');
const pick = (o) => { const k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; };
const NAMES = ['Nova', 'Atlas', 'Ember', 'Fjord', 'Lumen', 'Orbit', 'Quill', 'Sable', 'Tide', 'Verde', 'Zinc', 'Harbor', 'Kite', 'Mesa'];

export function randomize(brand) {
  const accent = randomHex();
  const radiusKey = pick(RADIUS_PRESETS);
  return {
    ...brand,
    name: brand.name,
    colors: { ...brand.colors, accent, neutral: tintedNeutral(accent, Math.random() * 0.02) },
    font: SANS[Math.floor(Math.random() * SANS.length)].name,
    headingFont: TEXT_FONTS[Math.floor(Math.random() * TEXT_FONTS.length)].name,
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

/** Starting points that echo the character of the reference systems. Values are our own approximations. */
export const STARTERS = [
  { id: 'material', name: 'Material-style', system: 'm3', note: 'Tonal, rounded, expressive motion', brand: { colors: { accent: '#6750a4', neutral: '#79747e' }, font: 'Roboto Flex', headingFont: 'Roboto Flex', density: 'default', radius: { boxes: 'large', fields: 'pill', selectors: 'soft' }, shadow: 'subtle', spacing: 'quiet', motion: 'expressive' } },
  { id: 'apple', name: 'Apple-style', system: 'hig', note: 'System blue, grouped surfaces, soft corners', brand: { colors: { accent: '#007aff', neutral: '#8e8e93' }, font: 'Inter', headingFont: 'Inter', density: 'comfortable', radius: { boxes: 'large', fields: 'rounded', selectors: 'pill' }, shadow: 'subtle', spacing: 'roomy', motion: 'standard' } },
  { id: 'polaris', name: 'Polaris-style', system: 'polaris', note: 'Merchant admin, calm green, compact cards', brand: { colors: { accent: '#008060', neutral: '#6d7175' }, font: 'Inter', headingFont: 'Inter', density: 'snug', radius: { boxes: 'rounded', fields: 'soft', selectors: 'subtle' }, shadow: 'medium', spacing: 'quiet', motion: 'snappy' } },
  { id: 'carbon', name: 'Carbon-style', system: 'carbon', note: 'Square corners, dense data, strong contrast', brand: { colors: { accent: '#0f62fe', neutral: '#6f6f6f' }, font: 'IBM Plex Sans', headingFont: 'IBM Plex Sans', monoFont: 'IBM Plex Mono', density: 'compact', radius: { boxes: 'none', fields: 'none', selectors: 'none' }, shadow: 'none', spacing: 'quiet', motion: 'standard' } },
  { id: 'fluent', name: 'Fluent-style', system: 'fluent', note: 'Productivity blue, soft depth, small radius', brand: { colors: { accent: '#0f6cbd', neutral: '#707070' }, font: 'Inter', headingFont: 'Inter', density: 'snug', radius: { boxes: 'soft', fields: 'subtle', selectors: 'subtle' }, shadow: 'medium', spacing: 'quiet', motion: 'standard' } },
  { id: 'atlassian', name: 'Atlassian-style', system: 'atlassian', note: 'Collaboration blue, lozenges, light depth', brand: { colors: { accent: '#0c66e4', neutral: '#626f86' }, font: 'Inter', headingFont: 'Inter', density: 'snug', radius: { boxes: 'subtle', fields: 'subtle', selectors: 'subtle' }, shadow: 'subtle', spacing: 'quiet', motion: 'snappy' } },
  { id: 'primer', name: 'Primer-style', system: 'primer', note: 'Developer tool, crisp borders, green action', brand: { colors: { accent: '#1f883d', neutral: '#656d76' }, font: 'Inter', headingFont: 'Inter', monoFont: 'JetBrains Mono', density: 'compact', radius: { boxes: 'soft', fields: 'soft', selectors: 'subtle' }, shadow: 'subtle', spacing: 'tight', motion: 'snappy' } },
  { id: 'spectrum', name: 'Spectrum-style', system: 'spectrum', note: 'Creative tools, rounded, generous targets', brand: { colors: { accent: '#3b63fb', neutral: '#6d6d6d' }, font: 'Source Sans 3', headingFont: 'Source Sans 3', density: 'default', radius: { boxes: 'rounded', fields: 'soft', selectors: 'soft' }, shadow: 'subtle', spacing: 'quiet', motion: 'standard' } },
  { id: 'shadcn', name: 'shadcn-style', system: 'radix', note: 'Neutral black, thin borders, minimal', brand: { colors: { accent: '#18181b', neutral: '#71717a' }, font: 'Geist', headingFont: 'Geist', monoFont: 'Geist Mono', density: 'snug', radius: { boxes: 'rounded', fields: 'soft', selectors: 'soft' }, shadow: 'subtle', spacing: 'quiet', motion: 'snappy' } },
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
