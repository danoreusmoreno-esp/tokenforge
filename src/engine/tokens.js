import { buildRamp, solveSolid, wcag, apca } from './color.js';

export const FAMILIES = ['accent', 'neutral', 'success', 'critical', 'warning', 'info'];

export const FONTS = [
  { name: 'Inter', category: 'sans-serif' },
  { name: 'DM Sans', category: 'sans-serif' },
  { name: 'Manrope', category: 'sans-serif' },
  { name: 'Space Grotesk', category: 'sans-serif' },
  { name: 'IBM Plex Sans', category: 'sans-serif' },
  { name: 'Outfit', category: 'sans-serif' },
  { name: 'Sora', category: 'sans-serif' },
  { name: 'Plus Jakarta Sans', category: 'sans-serif' },
  { name: 'Fraunces', category: 'serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Source Serif 4', category: 'serif' },
  { name: 'JetBrains Mono', category: 'monospace' },
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

export const SPACING_PRESETS = {
  tight: 3,
  quiet: 4,
  roomy: 5,
};

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
    accent: '#7c5cff',
    neutral: '#64616b',
    success: '#079455',
    critical: '#d92d20',
    warning: '#dc6803',
    info: '#1570ef',
  },
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

function typeScale(density, viewport = 'desktop') {
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
    const s = n >= 2 ? step(n) * vScale : step(n);
    const size = Math.round(s);
    out[name] = {
      size,
      lineHeight: Math.round(size * lh / 2) * 2 / size,
      lineHeightPx: Math.round(size * lh / 2) * 2,
      weight,
      tracking,
    };
  }
  return out;
}

function spacingScale(preset) {
  const unit = SPACING_PRESETS[preset] ?? 4;
  const steps = { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '8': 8, '10': 10, '12': 12, '16': 16, '20': 20, '24': 24 };
  const out = {};
  for (const [k, v] of Object.entries(steps)) out[k] = v * unit;
  return { unit, scale: out };
}

function layoutSpacing(unit) {
  const out = {};
  for (const vp of VIEWPORTS) {
    const s = VIEWPORT_SCALE[vp];
    out[vp] = {
      'component-gap': Math.round(unit * 2 * Math.max(s, 0.85)),
      'component-padding': Math.round(unit * 4 * Math.max(s, 0.8)),
      'section-gap': Math.round(unit * 6 * s),
      'layout-gutter': Math.round(unit * 6 * s),
      'layout-margin': Math.round(unit * 16 * s),
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
function roles(ramps, appearance) {
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
    'text-secondary': n[10],
    'text-tertiary': firstPassing(n, 8, surface, 4.5),
    'text-disabled': n[7],
    'focus-ring': ramps.accent[7],
  };
  for (const fam of ['accent', 'success', 'critical', 'warning', 'info']) {
    const ramp = ramps[fam];
    const solved = solveSolid(ramp[8]);
    const hover = solveSolid(ramp[9]);
    r[`${fam}-solid`] = solved.solid;
    r[`${fam}-solid-hover`] = hover.solid;
    r[`${fam}-on-solid`] = solved.ink;
    r[`${fam}-subtle`] = ramp[2];
    r[`${fam}-subtle-hover`] = ramp[3];
    r[`${fam}-border`] = ramp[6];
    r[`${fam}-text`] = pickReadable(ramp, r['bg-surface']);
  }
  return r;
}

/** First ramp step from `start` upward that reaches `min` contrast on `bg`. */
function firstPassing(ramp, start, bg, min) {
  for (let i = start; i < ramp.length; i++) if (wcag(ramp[i], bg) >= min) return ramp[i];
  return ramp[ramp.length - 1];
}

/** Choose step 11, falling back to 12, so text clears AA on the surface. */
function pickReadable(ramp, surface) {
  return wcag(ramp[10], surface) >= 4.5 ? ramp[10] : ramp[11];
}

/** Compute the whole system from a brand payload. Pure. */
export function computeSystem(brand) {
  const out = { brand, appearances: {} };
  for (const appearance of ['light', 'dark']) {
    const ramps = {};
    for (const fam of FAMILIES) ramps[fam] = buildRamp(brand.colors[fam], appearance);
    out.appearances[appearance] = {
      ramps,
      roles: roles(ramps, appearance),
      shadow: shadowTokens(brand.shadow, appearance),
    };
  }
  const sp = spacingScale(brand.spacing);
  out.spacing = sp.scale;
  out.spacingUnit = sp.unit;
  out.layout = layoutSpacing(sp.unit);
  out.type = {};
  for (const vp of VIEWPORTS) out.type[vp] = typeScale(brand.density, vp);
  out.radius = {
    boxes: RADIUS_PRESETS[brand.radius.boxes] ?? 8,
    fields: RADIUS_PRESETS[brand.radius.fields] ?? 8,
    selectors: RADIUS_PRESETS[brand.radius.selectors] ?? 8,
  };
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
      ['accent-on-solid', 'accent-solid', 'Primary button label'],
      ['accent-text', 'bg-surface', 'Link text'],
      ['critical-on-solid', 'critical-solid', 'Destructive button label'],
      ['success-text', 'success-subtle', 'Success badge'],
      ['warning-text', 'warning-subtle', 'Warning badge'],
      ['critical-text', 'critical-subtle', 'Critical badge'],
      ['info-text', 'info-subtle', 'Info badge'],
      ['border-strong', 'bg-surface', 'Field border (non-text, 3:1)'],
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
    FAMILIES.length * 12 +
    Object.keys(ap.roles).length +
    Object.keys(sys.spacing).length +
    Object.keys(sys.type.desktop).length * 4 +
    3 + 3 + 3 + 5
  );
}
