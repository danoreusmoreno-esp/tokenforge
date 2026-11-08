// Brand architecture: one design system, a master brand and up to four sub-brands.
// A sub-brand overrides identity (primary, secondary, tertiary, neutral, fonts, logo); everything
// structural (status colours, spacing, radius, shadow, motion, components) is shared.

export const MAX_SUBBRANDS = 4;
export const SUB_FIELDS = ['primary', 'secondary', 'tertiary', 'neutral'];

export function slug(name = '') {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'brand';
}

/** The brand as the system sees it when a sub-brand is active. Pure. */
export function effectiveBrand(brand, subId = brand.activeSub) {
  const sub = (brand.subbrands ?? []).find((s) => s.id === subId);
  if (!sub) return brand;
  const own = pickColors(sub.colors);
  // Dark seeds were tuned for the master's colours: drop them for families the sub-brand replaces.
  const darkColors = { ...(brand.darkColors ?? {}) };
  for (const k of Object.keys(own)) delete darkColors[k];
  if (own.primary) for (const k of ['secondary', 'tertiary']) if (!own[k] && !brand.colors[k]) delete darkColors[k];
  for (const [k, v] of Object.entries(sub.darkColors ?? {})) if (v && SUB_FIELDS.includes(k)) darkColors[k] = v;
  return {
    ...brand,
    colors: { ...brand.colors, ...own },
    darkColors,
    font: sub.font || brand.font,
    headingFont: sub.headingFont || brand.headingFont,
    logo: sub.logo || brand.logo,
    subName: sub.name,
  };
}

function pickColors(c = {}) {
  const out = {};
  for (const k of SUB_FIELDS) if (c[k]) out[k] = c[k];
  return out;
}

export function newSubbrand(brand, n) {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name: `Submarca ${n}`,
    colors: { primary: brand.colors.primary, secondary: '', tertiary: '', neutral: brand.colors.neutral },
    font: '',
    headingFont: '',
    logo: null,
  };
}

/** Every font family the system uses, across master and sub-brands. */
export function allFonts(brand) {
  const set = new Set([brand.font, brand.headingFont, brand.monoFont]);
  for (const s of brand.subbrands ?? []) { if (s.font) set.add(s.font); if (s.headingFont) set.add(s.headingFont); }
  return [...set].filter(Boolean);
}

export function fontFormat(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  return { woff2: 'woff2', woff: 'woff', ttf: 'truetype', otf: 'opentype' }[ext] ?? null;
}

/** "Acme-Grotesk_Bold.woff2" → "Acme Grotesk" (the user can rename it). */
export function familyFromFile(fileName) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_](thin|light|regular|book|medium|semibold|bold|black|italic|variable|vf|webfont)+/gi, '').replace(/[-_]+/g, ' ').trim() || 'Mi fuente';
}
