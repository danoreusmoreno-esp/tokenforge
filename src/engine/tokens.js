import { buildRamp, solveSolid, wcag, apca, deriveSecondary, deriveTertiary, harmonize, normalizeHex } from './color.js';

// Colour architecture: brand key colours (primary, secondary, tertiary), one neutral,
// and semantic/status colours. Every family gets a 12-step ramp per appearance.
export const BRAND_FAMILIES = ['primary', 'secondary', 'tertiary'];
export const SEMANTIC_FAMILIES = ['success', 'warning', 'critical', 'info'];
export const FAMILIES = [...BRAND_FAMILIES, 'neutral', ...SEMANTIC_FAMILIES];
/** Families that derive from the primary when the user leaves them empty. */
export const DERIVED = { secondary: deriveSecondary, tertiary: deriveTertiary };

// Custom semantic colours: the team adds its own meanings (e.g. "premium", "beta", "pending").
export const MAX_CUSTOM_SEMANTICS = 6;
// Names a custom semantic cannot take: they would collide with existing families or role prefixes.
const RESERVED = new Set([...FAMILIES, 'bg', 'border', 'text', 'focus', 'color', 'space', 'radius', 'shadow', 'font', 'duration', 'ease', 'layout', 'component', 'section', 'spring', 'brand', 'accent']);

export function semanticKey(name = '') {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'semantic';
}

/** A key that is valid, not reserved and not used by another custom semantic. */
export function uniqueSemanticKey(name, taken = []) {
  const base = semanticKey(name);
  let key = RESERVED.has(base) ? `${base}-custom` : base;
  for (let n = 2; taken.includes(key); n++) key = `${base}-${n}`;
  return key;
}

export function customSemantics(brand) {
  return (brand.customSemantics ?? []).filter((c) => c && c.key && c.color).slice(0, MAX_CUSTOM_SEMANTICS);
}
/** Every family of this brand: fixed families plus its custom semantics. */
export function familiesOf(brand) {
  return [...FAMILIES, ...customSemantics(brand).map((c) => c.key)];
}
/** Semantic families of this brand: the four standard ones plus custom ones. */
export function semanticsOf(brand) {
  return [...SEMANTIC_FAMILIES, ...customSemantics(brand).map((c) => c.key)];
}

const valid = (hex) => (hex ? normalizeHex(hex) : null);

/**
 * Seed colour of every family for one appearance.
 * Light: the colour the user chose, or derived from primary when empty; semantics optionally harmonized.
 * Dark: an explicit dark seed when the user set one, otherwise the light seed (the ramp adapts it).
 * Returns { seeds, auto } where auto[fam] says the seed was derived rather than chosen.
 */
export function resolveSeeds(brand, appearance = 'light') {
  const c = brand.colors ?? {};
  const primary = valid(c.primary) ?? DEFAULT_BRAND.colors.primary;
  const seeds = {}, auto = {};
  const custom = Object.fromEntries(customSemantics(brand).map((x) => [x.key, x.color]));
  const semantic = semanticsOf(brand);
  for (const fam of familiesOf(brand)) {
    let hex = fam === 'primary' ? primary : valid(custom[fam] ?? c[fam]);
    if (!hex && DERIVED[fam]) { hex = DERIVED[fam](primary); auto[fam] = true; }
    if (!hex) hex = DEFAULT_BRAND.colors[fam];
    if (!hex) hex = '#808080';
    if (brand.harmonize && semantic.includes(fam)) hex = harmonize(hex, primary);
    seeds[fam] = hex;
  }
  if (appearance === 'dark') {
    for (const fam of familiesOf(brand)) {
      const d = valid(brand.darkColors?.[fam]);
      if (d) seeds[fam] = d; else auto[`dark:${fam}`] = true;
    }
  }
  return { seeds, auto };
}

export const FONTS = [
  { name: 'Inter', category: 'sans-serif' },
  { name: 'DM Sans', category: 'sans-serif' },
  { name: 'Manrope', category: 'sans-serif' },
  { name: 'Space Grotesk', category: 'sans-serif' },
  { name: 'IBM Plex Sans', category: 'sans-serif' },
  { name: 'Outfit', category: 'sans-serif' },
  { name: 'Sora', category: 'sans-serif' },
  { name: 'Plus Jakarta Sans', category: 'sans-serif' },
  { name: 'Roboto Flex', category: 'sans-serif' },
  { name: 'Geist', category: 'sans-serif' },
  { name: 'Source Sans 3', category: 'sans-serif' },
  { name: 'Fraunces', category: 'serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Source Serif 4', category: 'serif' },
  { name: 'JetBrains Mono', category: 'monospace' },
  { name: 'IBM Plex Mono', category: 'monospace' },
  { name: 'Geist Mono', category: 'monospace' },
];

export const DENSITIES = {
  compact: { base: 14, ratio: 1.2, lh: 1.4 },
  snug: { base: 15, ratio: 1.22, lh: 1.45 },
  default: { base: 16, ratio: 1.25, lh: 1.5 },
  comfortable: { base: 17, ratio: 1.27, lh: 1.55 },
  spacious: { base: 18, ratio: 1.3, lh: 1.6 },
};

export const RADIUS_PRESETS = {
  none: 0,
  subtle: 4,
  soft: 8,
  rounded: 12,
  large: 18,
  pill: 999,
};

export const SHADOW_PRESETS = {
  none: { y: 0, blur: 0, alpha: 0 },
  subtle: { y: 1, blur: 3, alpha: 0.08 },
  medium: { y: 4, blur: 12, alpha: 0.12 },
  strong: { y: 10, blur: 30, alpha: 0.2 },
};

// Spacing is always on a 4px base. Presets change density (how far apart things sit), never the unit.
export const BASE_UNIT = 4;
export const SPACING_PRESETS = {
  tight: 0.75,
  quiet: 1,
  roomy: 1.25,
};
const r4 = (n) => Math.max(BASE_UNIT, Math.round(n / BASE_UNIT) * BASE_UNIT);

export const MOTION_PRESETS = {
  none: { fast: 0, base: 0, slow: 0, ease: 'linear' },
  snappy: { fast: 90, base: 140, slow: 220, ease: 'cubic-bezier(0.2, 0, 0, 1)' },
  standard: { fast: 120, base: 200, slow: 320, ease: 'cubic-bezier(0.2, 0, 0, 1)' },
  expressive: { fast: 160, base: 280, slow: 480, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
};

export const DEFAULT_BRAND = {
  id: 'default',
  name: 'Forge',
  colors: {
    primary: '#7c5cff',
    secondary: '',
    tertiary: '',
    neutral: '#64616b',
    success: '#079455',
    critical: '#d92d20',
    warning: '#dc6803',
    info: '#1570ef',
  },
  // Optional per-family seeds for dark mode; empty means "adapt the light colour".
  darkColors: {},
  harmonize: false,
  font: 'Inter',
  headingFont: 'Inter',
  monoFont: 'JetBrains Mono',
  density: 'default',
  radius: { boxes: 'rounded', fields: 'soft', selectors: 'soft' },
  shadow: 'subtle',
  spacing: 'quiet',
  motion: 'standard',
};

const VIEWPORTS = ['desktop', 'tablet', 'mobile'];
const VIEWPORT_SCALE = { desktop: 1, tablet: 0.85, mobile: 0.7 };

function round(n, p = 2) {
  return Math.round(n * 10 ** p) / 10 ** p;
}

/** locked: exact sizes imported from another system ({ body: { size, lineHeightPx, weight } }), desktop values. */
function typeScale(density, viewport = 'desktop', locked = {}) {
  const d = DENSITIES[density] ?? DENSITIES.default;
  const vScale = viewport === 'mobile' ? 0.88 : viewport === 'tablet' ? 0.94 : 1;
  const step = (n) => d.base * Math.pow(d.ratio, n);
  const def = [
    ['caption', -2, 1.4, 400, 0.01],
    ['small', -1, d.lh, 400, 0],
    ['body', 0, d.lh, 400, 0],
    ['lead', 1, d.lh, 400, 0],
    ['h4', 2, 1.3, 600, -0.005],
    ['h3', 3, 1.25, 600, -0.01],
    ['h2', 4, 1.2, 650, -0.015],
    ['h1', 5, 1.12, 700, -0.02],
    ['display', 7, 1.04, 750, -0.03],
  ];
  const out = {};
  for (const [name, n, lh, weight, tracking] of def) {
    // Only headings shrink on smaller viewports; body text keeps its size.
    const own = locked[name];
    const baseSize = own?.size ?? step(n);
    const s = n >= 2 ? baseSize * vScale : baseSize;
    const size = Math.round(s);
    // An imported line height is kept as a ratio, so it scales with the size on smaller screens.
    const ratio = own?.lineHeightPx && own?.size ? own.lineHeightPx / own.size : lh;
    const lineHeightPx = own?.lineHeightPx && viewport === 'desktop' ? Math.round(own.lineHeightPx) : Math.round(size * ratio / 4) * 4;
    out[name] = {
      size,
      lineHeight: lineHeightPx / size,
      lineHeightPx,
      weight: own?.weight ?? weight,
      tracking: own?.tracking ?? tracking,
    };
  }
  return out;
}

function spacingScale() {
  const unit = BASE_UNIT;
  const steps = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '8': 8, '10': 10, '12': 12, '16': 16, '20': 20, '24': 24 };
  const out = {};
  for (const [k, v] of Object.entries(steps)) out[k] = v * unit;
  return { unit, scale: out };
}

/** Layout spacing per viewport, scaled by the density preset and snapped to the 4px base. */
function layoutSpacing(unit, density = 1) {
  const out = {};
  for (const vp of VIEWPORTS) {
    const s = VIEWPORT_SCALE[vp] * density;
    out[vp] = {
      'component-gap': r4(unit * 2 * Math.max(s, 0.85)),
      'component-padding': r4(unit * 4 * Math.max(s, 0.8)),
      'section-gap': r4(unit * 6 * s),
      'layout-gutter': r4(unit * 6 * s),
      'layout-margin': r4(unit * 16 * s),
    };
  }
  return out;
}

function shadowTokens(preset, appearance) {
  const p = SHADOW_PRESETS[preset] ?? SHADOW_PRESETS.subtle;
  const k = appearance === 'dark' ? 2.2 : 1;
  const a = (m) => round(Math.min(0.6, p.alpha * m * k), 3);
  if (p.alpha === 0) return { sm: 'none', md: 'none', lg: 'none' };
  return {
    sm: `0 ${Math.max(1, p.y / 2)}px ${Math.max(2, p.blur / 2)}px rgba(0,0,0,${a(0.8)})`,
    md: `0 ${p.y}px ${p.blur}px rgba(0,0,0,${a(1)}), 0 1px 2px rgba(0,0,0,${a(0.5)})`,
    lg: `0 ${p.y * 2.4}px ${p.blur * 2.4}px rgba(0,0,0,${a(1.3)}), 0 2px 6px rgba(0,0,0,${a(0.5)})`,
  };
}

/** Semantic roles for one appearance, solved for contrast. */
function roles(ramps, appearance, families) {
  const n = ramps.neutral;
  const surface = appearance === 'light' ? '#ffffff' : n[1];
  const r = {
    'bg-canvas': n[0],
    'bg-surface': surface,
    'bg-subtle': n[1],
    'bg-muted': n[2],
    'bg-hover': n[3],
    'bg-active': n[4],
    'border-subtle': n[5],
    'border-default': n[6],
    // Form-field borders are non-text UI: they must clear 3:1 (WCAG 1.4.11).
    'border-strong': firstPassing(n, 7, surface, 3),
    'text-primary': n[11],
    // Step 11, or 12 when a very chromatic neutral leaves step 11 short of AA.
    'text-secondary': firstPassing(n, 10, surface, 4.5),
    'text-tertiary': firstPassing(n, 8, surface, 4.5),
    'text-disabled': n[7],
    'focus-ring': ramps.primary[7],
  };
  for (const fam of families.filter((f) => f !== 'neutral')) {
    const ramp = ramps[fam];
    const solved = solveSolid(ramp[8]);
    const hover = solveSolid(ramp[9]);
    r[`${fam}-solid`] = solved.solid;
    r[`${fam}-solid-hover`] = hover.solid;
    r[`${fam}-on-solid`] = solved.ink;
    r[`${fam}-subtle`] = ramp[2];
    r[`${fam}-subtle-hover`] = ramp[3];
    r[`${fam}-border`] = ramp[6];
    // Used on the surface (links, labels) and on its own subtle fill (badges, alerts).
    r[`${fam}-text`] = pickReadable(ramp, [r['bg-surface'], ramp[2]]);
  }
  return r;
}

/** First ramp step from `start` upward that reaches `min` contrast on `bg`. */
function firstPassing(ramp, start, bg, min) {
  for (let i = start; i < ramp.length; i++) if (wcag(ramp[i], bg) >= min) return ramp[i];
  return ramp[ramp.length - 1];
}

/** Step 11, falling back to 12, so the family's text clears AA on every background it is used on. */
function pickReadable(ramp, backgrounds) {
  const list = Array.isArray(backgrounds) ? backgrounds : [backgrounds];
  return list.every((bg) => wcag(ramp[10], bg) >= 4.5) ? ramp[10] : ramp[11];
}

/** Compute the whole system from a brand payload. Pure. */
export function computeSystem(brand) {
  const families = familiesOf(brand);
  const out = { brand, families, semantics: semanticsOf(brand), custom: customSemantics(brand), appearances: {} };
  for (const appearance of ['light', 'dark']) {
    const ramps = {};
    const { seeds, auto } = resolveSeeds(brand, appearance);
    const lockedRamps = brand.locked?.ramps?.[appearance] ?? {};
    for (const fam of families) {
      ramps[fam] = buildRamp(seeds[fam], appearance);
      // Imported steps replace the generated ones where the source had a colour at that lightness.
      const own = lockedRamps[fam];
      if (Array.isArray(own)) ramps[fam] = ramps[fam].map((h, i) => (own[i] && /^#[0-9a-f]{6}$/i.test(own[i]) ? own[i].toLowerCase() : h));
    }
    out.appearances[appearance] = {
      seeds,
      auto,
      ramps,
      roles: roles(ramps, appearance, families),
      shadow: { ...shadowTokens(brand.shadow, appearance), ...(brand.locked?.shadow?.[appearance] ?? {}) },
    };
  }
  const sp = spacingScale();
  out.spacing = sp.scale;
  out.spacingUnit = sp.unit;
  out.layout = layoutSpacing(sp.unit, SPACING_PRESETS[brand.spacing] ?? 1);
  out.type = {};
  for (const vp of VIEWPORTS) out.type[vp] = typeScale(brand.density, vp, brand.locked?.type ?? {});
  const lr = brand.locked?.radius ?? {};
  out.radius = {
    boxes: lr.boxes ?? RADIUS_PRESETS[brand.radius.boxes] ?? 8,
    fields: lr.fields ?? RADIUS_PRESETS[brand.radius.fields] ?? 8,
    selectors: lr.selectors ?? RADIUS_PRESETS[brand.radius.selectors] ?? 8,
  };
  out.locked = brand.locked ?? {};
  out.motion = MOTION_PRESETS[brand.motion] ?? MOTION_PRESETS.standard;
  out.fonts = { body: brand.font, heading: brand.headingFont || brand.font, mono: brand.monoFont || 'JetBrains Mono' };
  out.audit = auditContrast(out);
  return out;
}

/** Key pairs checked with WCAG 2 and APCA in both appearances. */
export function auditContrast(sys) {
  const rows = [];
  for (const ap of ['light', 'dark']) {
    const r = sys.appearances[ap].roles;
    const pairs = [
      ['text-primary', 'bg-surface', 'Body text'],
      ['text-secondary', 'bg-surface', 'Secondary text'],
      ['text-tertiary', 'bg-surface', 'Tertiary text'],
      ['primary-on-solid', 'primary-solid', 'Primary button label'],
      ['primary-text', 'bg-surface', 'Link text'],
      ['secondary-on-solid', 'secondary-solid', 'Secondary fill label'],
      ['secondary-text', 'secondary-subtle', 'Secondary tonal text'],
      ['tertiary-on-solid', 'tertiary-solid', 'Tertiary fill label'],
      ['tertiary-text', 'bg-surface', 'Tertiary brand text'],
      ['critical-on-solid', 'critical-solid', 'Destructive button label'],
      ['success-text', 'success-subtle', 'Success badge'],
      ['warning-text', 'warning-subtle', 'Warning badge'],
      ['critical-text', 'critical-subtle', 'Critical badge'],
      ['info-text', 'info-subtle', 'Info badge'],
      ['border-strong', 'bg-surface', 'Field border (non-text, 3:1)'],
      ...(sys.custom ?? []).flatMap((c) => [
        [`${c.key}-text`, `${c.key}-subtle`, `${c.name} badge`],
        [`${c.key}-on-solid`, `${c.key}-solid`, `${c.name} fill label`],
      ]),
    ];
    for (const [fg, bg, label] of pairs) {
      const ratio = wcag(r[fg], r[bg]);
      const lc = Math.abs(apca(r[fg], r[bg]));
      const nonText = label.includes('non-text');
      rows.push({
        appearance: ap,
        fg,
        bg,
        label,
        fgHex: r[fg],
        bgHex: r[bg],
        ratio,
        lc,
        wcagPass: nonText ? ratio >= 3 : ratio >= 4.5,
        apcaPass: nonText ? lc >= 30 : lc >= 60,
      });
    }
  }
  return rows;
}

export function tokenCount(sys) {
  const ap = sys.appearances.light;
  return (
    (sys.families ?? FAMILIES).length * 12 +
    Object.keys(ap.roles).length +
    Object.keys(sys.spacing).length +
    Object.keys(sys.type.desktop).length * 4 +
    3 + 3 + 3 + 5
  );
}
