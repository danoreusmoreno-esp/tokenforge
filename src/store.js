import { DEFAULT_BRAND, FONTS, DENSITIES, RADIUS_PRESETS, SHADOW_PRESETS, SPACING_PRESETS, MOTION_PRESETS } from './engine/tokens.js';
import { randomHex, tintedNeutral } from './engine/color.js';
import { CORE_IDS } from './engine/catalog.js';

const KEY = 'tf-brands-v1';
const ACTIVE = 'tf-active-v1';

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function newBrand(over = {}) {
  return { ...structuredClone(DEFAULT_BRAND), id: uid(), components: [...CORE_IDS], componentTokens: {}, logo: null, subbrands: [], activeSub: null, customFonts: [], updatedAt: Date.now(), ...over };
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
  return { ...base, ...b, colors: { ...base.colors, ...b.colors }, radius: { ...base.radius, ...b.radius }, components: b.components ?? base.components, componentTokens: b.componentTokens ?? {}, subbrands: b.subbrands ?? [], customFonts: b.customFonts ?? [], logo: b.logo ?? null, activeSub: b.activeSub ?? null };
}

/** Returns false when the browser refuses (usually quota: logos and fonts are stored inline). */
export function saveBrands(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
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
  { id: 'material', name: 'Estilo Material', system: 'm3', note: 'Tonal, redondeado, movimiento expresivo', brand: { colors: { accent: '#6750a4', neutral: '#79747e' }, font: 'Roboto Flex', headingFont: 'Roboto Flex', density: 'default', radius: { boxes: 'large', fields: 'pill', selectors: 'soft' }, shadow: 'subtle', spacing: 'quiet', motion: 'expressive' } },
  { id: 'apple', name: 'Estilo Apple', system: 'hig', note: 'Azul de sistema, superficies agrupadas, esquinas suaves', brand: { colors: { accent: '#007aff', neutral: '#8e8e93' }, font: 'Inter', headingFont: 'Inter', density: 'comfortable', radius: { boxes: 'large', fields: 'rounded', selectors: 'pill' }, shadow: 'subtle', spacing: 'roomy', motion: 'standard' } },
  { id: 'polaris', name: 'Estilo Polaris', system: 'polaris', note: 'Panel de comercio, verde sereno, tarjetas compactas', brand: { colors: { accent: '#008060', neutral: '#6d7175' }, font: 'Inter', headingFont: 'Inter', density: 'snug', radius: { boxes: 'rounded', fields: 'soft', selectors: 'subtle' }, shadow: 'medium', spacing: 'quiet', motion: 'snappy' } },
  { id: 'carbon', name: 'Estilo Carbon', system: 'carbon', note: 'Esquinas rectas, datos densos, contraste fuerte', brand: { colors: { accent: '#0f62fe', neutral: '#6f6f6f' }, font: 'IBM Plex Sans', headingFont: 'IBM Plex Sans', monoFont: 'IBM Plex Mono', density: 'compact', radius: { boxes: 'none', fields: 'none', selectors: 'none' }, shadow: 'none', spacing: 'quiet', motion: 'standard' } },
  { id: 'fluent', name: 'Estilo Fluent', system: 'fluent', note: 'Azul de productividad, profundidad suave, radio pequeño', brand: { colors: { accent: '#0f6cbd', neutral: '#707070' }, font: 'Inter', headingFont: 'Inter', density: 'snug', radius: { boxes: 'soft', fields: 'subtle', selectors: 'subtle' }, shadow: 'medium', spacing: 'quiet', motion: 'standard' } },
  { id: 'atlassian', name: 'Estilo Atlassian', system: 'atlassian', note: 'Azul colaborativo, lozenges, profundidad ligera', brand: { colors: { accent: '#0c66e4', neutral: '#626f86' }, font: 'Inter', headingFont: 'Inter', density: 'snug', radius: { boxes: 'subtle', fields: 'subtle', selectors: 'subtle' }, shadow: 'subtle', spacing: 'quiet', motion: 'snappy' } },
  { id: 'primer', name: 'Estilo Primer', system: 'primer', note: 'Herramienta para devs, bordes nítidos, acción verde', brand: { colors: { accent: '#1f883d', neutral: '#656d76' }, font: 'Inter', headingFont: 'Inter', monoFont: 'JetBrains Mono', density: 'compact', radius: { boxes: 'soft', fields: 'soft', selectors: 'subtle' }, shadow: 'subtle', spacing: 'tight', motion: 'snappy' } },
  { id: 'spectrum', name: 'Estilo Spectrum', system: 'spectrum', note: 'Herramientas creativas, redondeado, áreas de toque amplias', brand: { colors: { accent: '#3b63fb', neutral: '#6d6d6d' }, font: 'Source Sans 3', headingFont: 'Source Sans 3', density: 'default', radius: { boxes: 'rounded', fields: 'soft', selectors: 'soft' }, shadow: 'subtle', spacing: 'quiet', motion: 'standard' } },
  { id: 'shadcn', name: 'Estilo shadcn', system: 'radix', note: 'Negro neutro, bordes finos, minimalista', brand: { colors: { accent: '#18181b', neutral: '#71717a' }, font: 'Geist', headingFont: 'Geist', monoFont: 'Geist Mono', density: 'snug', radius: { boxes: 'rounded', fields: 'soft', selectors: 'soft' }, shadow: 'subtle', spacing: 'quiet', motion: 'snappy' } },
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
