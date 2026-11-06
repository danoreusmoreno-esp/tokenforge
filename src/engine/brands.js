// Brand architecture: one design system, a master brand and up to four sub-brands.
// A sub-brand overrides identity (accent, neutral, fonts, logo); everything
// structural (status colours, spacing, radius, shadow, motion, components) is shared.

export const MAX_SUBBRANDS = 4;
export const SUB_FIELDS = ['accent', 'neutral'];

export function slug(name = '') {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'brand';
}

/** The brand as the system sees it when a sub-brand is active. Pure. */
export function effectiveBrand(brand, subId = brand.activeSub) {
  const sub = (brand.subbrands ?? []).find((s) => s.id === subId);
  if (!sub) return brand;
  return {
    ...brand,
    colors: { ...brand.colors, ...pickColors(sub.colors) },
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
    colors: { accent: brand.colors.accent, neutral: brand.colors.neutral },
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
