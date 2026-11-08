import { converter, formatHex, clampChroma, parse } from 'culori';

const toOklch = converter('oklch');
const toRgb = converter('rgb');

export function isValidHex(hex) {
  return /^#([0-9a-f]{6})$/i.test(hex);
}

export function normalizeHex(input) {
  const p = parse(input);
  return p ? formatHex(p) : null;
}

function oklchHex(l, c, h) {
  const col = clampChroma({ mode: 'oklch', l: Math.max(0, Math.min(1, l)), c: Math.max(0, c), h }, 'oklch');
  return formatHex(col);
}

// Lightness targets per step (1..12). Step 9 is the input colour itself.
const LIGHT_L = [0.993, 0.978, 0.948, 0.918, 0.885, 0.845, 0.79, 0.715, null, null, 0.5, 0.27];
const DARK_L = [0.165, 0.198, 0.245, 0.285, 0.325, 0.37, 0.43, 0.52, null, null, 0.83, 0.95];
// Chroma multiplier per step relative to the base chroma.
const LIGHT_C = [0.06, 0.12, 0.25, 0.36, 0.46, 0.56, 0.66, 0.82, 1, 1, 0.9, 0.55];
const DARK_C = [0.12, 0.16, 0.3, 0.42, 0.52, 0.6, 0.7, 0.85, 1, 1, 0.75, 0.3];

/**
 * Build a 12-step ramp for one appearance.
 * Steps 1-2 backgrounds, 3-5 component fills, 6-8 borders, 9-10 solid, 11-12 text.
 */
export function buildRamp(hex, appearance = 'light') {
  const base = toOklch(parse(hex));
  const h = base.h ?? 0;
  const c = base.c ?? 0;
  const L = appearance === 'light' ? LIGHT_L : DARK_L;
  const C = appearance === 'light' ? LIGHT_C : DARK_C;
  let l9 = base.l;
  if (appearance === 'dark') l9 = Math.max(l9, 0.55); // keep step 9 visible on dark surfaces
  const l10 = l9 > 0.6 ? l9 - 0.045 : l9 + 0.05;
  const steps = [];
  for (let i = 0; i < 12; i++) {
    if (i === 8) {
      steps.push(appearance === 'light' || base.l >= 0.55 ? formatHex(parse(hex)) : oklchHex(l9, c, h));
      continue;
    }
    const l = i === 9 ? l10 : L[i];
    // Text steps must contrast against step 1/2; nudge them away from low-contrast zones.
    steps.push(oklchHex(l, c * C[i], h));
  }
  return steps;
}

// ---------- Contrast ----------
function channel(v) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
export function luminance(hex) {
  const { r, g, b } = toRgb(parse(hex));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function wcag(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// APCA-W3 0.0.98G (simplified, sRGB). Returns Lc (signed). Use Math.abs for thresholds.
export function apca(textHex, bgHex) {
  const y = (hex) => {
    const { r, g, b } = toRgb(parse(hex));
    const f = (v) => Math.pow(Math.max(0, v), 2.4);
    return 0.2126729 * f(r) + 0.7151522 * f(g) + 0.072175 * f(b);
  };
  const clamp = (Y) => (Y > 0.022 ? Y : Y + Math.pow(0.022 - Y, 1.414));
  const Yt = clamp(y(textHex));
  const Yb = clamp(y(bgHex));
  let S;
  if (Yb > Yt) {
    S = (Math.pow(Yb, 0.56) - Math.pow(Yt, 0.57)) * 1.14;
    if (S < 0.1) return 0;
    return (S - 0.027) * 100;
  }
  S = (Math.pow(Yb, 0.65) - Math.pow(Yt, 0.62)) * 1.14;
  if (S > -0.1) return 0;
  return (S + 0.027) * 100;
}

export function wcagLevel(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

/** Pick the label ink (white or near-black) that reads best on a solid. */
export function bestInk(bgHex, dark = '#0b0b0f') {
  const w = wcag('#ffffff', bgHex);
  const d = wcag(dark, bgHex);
  return w >= d ? { ink: '#ffffff', ratio: w } : { ink: dark, ratio: d };
}

/**
 * Ensure a solid can carry a readable label (AA 4.5:1). If neither ink clears AA,
 * nudge lightness until one does. Returns { solid, ink, ratio, adjusted }.
 */
export function solveSolid(hex) {
  let { ink, ratio } = bestInk(hex);
  if (ratio >= 4.5) return { solid: hex, ink, ratio, adjusted: false };
  const o = toOklch(parse(hex));
  // Try darkening (for white ink) and lightening (for dark ink); keep the smaller move.
  let best = null;
  for (let d = 0.01; d <= 0.4; d += 0.01) {
    for (const dir of [-1, 1]) {
      const cand = oklchHex(o.l + dir * d, o.c, o.h ?? 0);
      const r = bestInk(cand);
      if (r.ratio >= 4.5) {
        best = { solid: cand, ink: r.ink, ratio: r.ratio, adjusted: true };
        break;
      }
    }
    if (best) break;
  }
  return best ?? { solid: hex, ink, ratio, adjusted: false };
}

export function randomHex() {
  const h = Math.random() * 360;
  const l = 0.5 + Math.random() * 0.2;
  const c = 0.12 + Math.random() * 0.12;
  return oklchHex(l, c, h);
}

export function hueOf(hex) {
  return toOklch(parse(hex)).h ?? 0;
}

/** Neutral derived from accent hue with very low chroma. */
export function tintedNeutral(accentHex, tint = 0.012) {
  return oklchHex(0.55, tint, hueOf(accentHex));
}

// ---------- Brand palette derivation (Material 3 style key colours) ----------
const okl = (hex) => { const o = toOklch(parse(hex)); return { l: o.l, c: o.c ?? 0, h: o.h ?? 0 }; };

/** Secondary: same hue as the primary, much quieter. For tonal fills, chips, selected states. */
export function deriveSecondary(primaryHex) {
  const p = okl(primaryHex);
  return oklchHex(Math.min(0.62, Math.max(0.45, p.l)), Math.min(0.06, p.c * 0.35), p.h);
}

/** Tertiary: a contrasting hue (+60°) at similar strength. For highlights that must not compete with primary. */
export function deriveTertiary(primaryHex) {
  const p = okl(primaryHex);
  return oklchHex(Math.min(0.66, Math.max(0.5, p.l)), Math.max(0.08, Math.min(0.16, p.c * 0.85)), (p.h + 60) % 360);
}

/**
 * Harmonize: rotate a colour's hue toward the primary by at most 15° (half the distance),
 * so status colours feel related to the brand while keeping their meaning (red stays red).
 */
export function harmonize(hex, sourceHex, max = 15) {
  const a = okl(hex), s = okl(sourceHex);
  if (a.c < 0.02 || s.c < 0.02) return formatHex(parse(hex));
  let d = ((s.h - a.h + 540) % 360) - 180;
  const rot = Math.sign(d) * Math.min(Math.abs(d) * 0.5, max);
  return oklchHex(a.l, a.c, (a.h + rot + 360) % 360);
}
