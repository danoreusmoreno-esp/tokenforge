// Import an existing design system: Tokens Studio (Figma), W3C DTCG JSON or CSS custom properties.
// Pure functions: parse → resolve references per mode → classify → propose a mapping → build a brand.
import { converter, formatHex, parse } from 'culori';
import { buildRamp } from './color.js';
import { DENSITIES, RADIUS_PRESETS, SHADOW_PRESETS, SPACING_PRESETS } from './tokens.js';

const toOklch = converter('oklch');
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

// ---------------------------------------------------------------------------
// 1. Parse the file into sets of raw token trees

/** Turns a file's text into { format, sets: { name: tree }, themes: [{ name, mode, sets }] }. */
export function parseSource(text, fileName = '') {
  const trimmed = text.trim();
  let json = null;
  try { json = JSON.parse(trimmed); } catch { /* not JSON */ }
  if (!json) {
    if (/--[\w-]+\s*:/.test(trimmed)) return parseCss(trimmed);
    throw new Error('El archivo no es JSON válido ni contiene variables CSS.');
  }
  if (!isObj(json)) throw new Error('El JSON debe ser un objeto con tokens.');
  const leaves = countLeaves(json);
  if (!leaves.studio && !leaves.dtcg) throw new Error('No he encontrado tokens: cada token necesita "value" (Tokens Studio) o "$value" (W3C).');
  const format = leaves.dtcg >= leaves.studio ? 'dtcg' : 'tokens-studio';
  const meta = json.$metadata;
  const themes = Array.isArray(json.$themes) ? json.$themes : [];
  const topKeys = Object.keys(json).filter((k) => !k.startsWith('$'));
  // Multi-set Tokens Studio files list their sets in $metadata or have sets as top-level objects referenced by $themes.
  const setNames = meta?.tokenSetOrder?.length ? meta.tokenSetOrder.filter((k) => isObj(json[k]))
    : themes.length ? topKeys.filter((k) => isObj(json[k]))
    : looksLikeSets(json, topKeys) ? topKeys : null;
  const sets = setNames ? Object.fromEntries(setNames.map((k) => [k, json[k]])) : { tokens: json };
  return { format, fileName, sets, themes: normaliseThemes(themes, Object.keys(sets)) };
}

function countLeaves(node, acc = { studio: 0, dtcg: 0 }) {
  if (!isObj(node)) return acc;
  if ('$value' in node) { acc.dtcg++; return acc; }
  if ('value' in node && ('type' in node || typeof node.value !== 'object' || Array.isArray(node.value))) { acc.studio++; return acc; }
  for (const [k, v] of Object.entries(node)) if (!k.startsWith('$')) countLeaves(v, acc);
  return acc;
}

/** Top-level keys are token sets when their names read like sets (global, core, light/dark, brand/…). */
function looksLikeSets(json, keys) {
  if (keys.length < 2) return false;
  const setish = keys.filter((k) => /^(global|core|base|primitives?|semantic|theme|tokens|light|dark|brand|components?|alias|ref|sys)\b|\//i.test(k));
  return setish.length >= Math.ceil(keys.length / 2);
}

function normaliseThemes(themes, setNames) {
  const modeOf = (name = '') => (/dark|night|oscuro|noche/i.test(name) ? 'dark' : 'light');
  if (themes.length) {
    return themes.map((t) => ({
      name: t.name ?? t.id ?? 'Tema',
      mode: modeOf(`${t.name ?? ''} ${t.id ?? ''} ${t.group ?? ''}`),
      sets: Object.entries(t.selectedTokenSets ?? {}).filter(([, st]) => st !== 'disabled').map(([k]) => k).filter((k) => setNames.includes(k)),
    }));
  }
  const dark = setNames.filter((k) => /dark|night|oscuro/i.test(k));
  const base = setNames.filter((k) => !/dark|night|oscuro|light/i.test(k));
  const light = setNames.filter((k) => /light/i.test(k));
  const out = [{ name: 'Claro', mode: 'light', sets: [...base, ...light] }];
  if (dark.length) out.push({ name: 'Oscuro', mode: 'dark', sets: [...base, ...dark] });
  return out;
}

/** CSS custom properties: :root (and light selectors) is light; dark selectors and prefers-color-scheme: dark are dark. */
function parseCss(text) {
  const light = {};
  const dark = {};
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const darkMedia = /@media[^{]*prefers-color-scheme\s*:\s*dark[^{]*\{([\s\S]*?\})\s*\}/g;
  let m;
  const darkBlocks = [];
  while ((m = darkMedia.exec(clean))) darkBlocks.push(m[1]);
  // Other @media blocks (tablet, mobile, print) would override the desktop values: skip them.
  const rest = clean.replace(darkMedia, '').replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  const take = (body, into) => { for (const d of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);?/g)) into[d[1]] = d[2].trim(); };
  while ((m = blockRe.exec(rest))) {
    const sel = m[1];
    if (/@media|data-brand/.test(sel)) continue;
    take(m[2], /dark/i.test(sel) ? dark : light);
  }
  for (const b of darkBlocks) for (const x of b.matchAll(/\{([^{}]*)\}/g)) take(x[1], dark);
  // "color-primary-9" becomes the path "color-primary.9" so numbered steps form a ramp.
  const key = (name) => name.replace(/-(\d{1,4})$/, '.$1');
  const tree = (vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => [key(k), { value: v.replace(/var\(--([\w-]+)\)/g, (m0, ref) => `{${key(ref)}}`) }]));
  const sets = { light: tree(light) };
  const themes = [{ name: 'Claro', mode: 'light', sets: ['light'] }];
  if (Object.keys(dark).length) { sets.dark = tree(dark); themes.push({ name: 'Oscuro', mode: 'dark', sets: ['light', 'dark'] }); }
  return { format: 'css', fileName: '', sets, themes, flat: true };
}

// ---------------------------------------------------------------------------
// 2. Flatten and resolve references for each mode

function flatten(tree, set, out, prefix = [], inherited = '') {
  for (const [k, v] of Object.entries(tree ?? {})) {
    if (k.startsWith('$') || !isObj(v)) continue;
    const type = v.$type ?? v.type ?? inherited;
    if ('$value' in v || 'value' in v) {
      out.push({ path: [...prefix, k].join('.'), set, type: String(type || ''), raw: '$value' in v ? v.$value : v.value, ext: v.$extensions, description: v.$description ?? v.description });
    } else {
      flatten(v, set, out, [...prefix, k], v.$type ?? inherited);
    }
  }
  return out;
}

const REF = /\{([^{}]+)\}/g;

/** A tiny arithmetic evaluator for Tokens Studio math ("16 * 1.5", "(8 + 4) / 2"). No eval. */
function calc(expr) {
  const src = expr.replace(/px|rem/g, (u) => (u === 'rem' ? '*16' : ''));
  if (!/^[\d.\s+\-*/()]+$/.test(src)) return null;
  const toks = src.match(/\d*\.?\d+|[+\-*/()]/g) ?? [];
  let i = 0;
  const peek = () => toks[i];
  const num = () => {
    const t = toks[i++];
    if (t === '(') { const v = sum(); i++; return v; }
    if (t === '-') return -num();
    return parseFloat(t);
  };
  const prod = () => { let v = num(); while (peek() === '*' || peek() === '/') { const op = toks[i++]; const r = num(); v = op === '*' ? v * r : v / r; } return v; };
  const sum = () => { let v = prod(); while (peek() === '+' || peek() === '-') { const op = toks[i++]; const r = prod(); v = op === '+' ? v + r : v - r; } return v; };
  const v = sum();
  return Number.isFinite(v) ? v : null;
}

/** Resolves every token for the sets of one mode. Returns Map(path → { ...token, value, aliasOf }). */
function resolveMode(tokens, setOrder) {
  const byPath = new Map();
  for (const set of setOrder) for (const t of tokens.filter((x) => x.set === set)) byPath.set(t.path, t);
  const find = (ref) => byPath.get(ref) ?? [...byPath.values()].find((t) => t.path.endsWith(`.${ref}`) || t.path.replace(/-/g, '.') === ref.replace(/-/g, '.'));
  const cache = new Map();
  const resolveValue = (raw, depth) => {
    if (depth > 12) return raw;
    if (typeof raw === 'string') {
      const whole = /^\{([^{}]+)\}$/.exec(raw.trim());
      if (whole) { const t = find(whole[1]); return t ? resolveToken(t, depth + 1).value : raw; }
      if (!REF.test(raw)) return raw;
      REF.lastIndex = 0;
      const sub = raw.replace(REF, (m0, ref) => { const t = find(ref); const v = t ? resolveToken(t, depth + 1).value : m0; return typeof v === 'object' ? m0 : String(v); });
      const math = /[*/+]|\s-\s/.test(sub) && !/[a-z#(]/i.test(sub.replace(/px|rem/g, '')) ? calc(sub) : null;
      return math ?? sub;
    }
    if (Array.isArray(raw)) return raw.map((x) => resolveValue(x, depth + 1));
    if (isObj(raw)) return Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, resolveValue(v, depth + 1)]));
    return raw;
  };
  const resolveToken = (t, depth = 0) => {
    if (cache.has(t.path)) return cache.get(t.path);
    const whole = typeof t.raw === 'string' ? /^\{([^{}]+)\}$/.exec(t.raw.trim()) : null;
    const target = whole ? find(whole[1]) : null;
    const r = { ...t, value: resolveValue(t.raw, depth), aliasOf: target?.path ?? null, type: t.type || target?.type || '' };
    cache.set(t.path, r);
    return r;
  };
  const out = new Map();
  for (const t of byPath.values()) out.set(t.path, resolveToken(t));
  return out;
}

// ---------------------------------------------------------------------------
// 3. Interpret values

export function toHex(v) {
  if (typeof v !== 'string') return null;
  let s = v.trim();
  // Only text written as a colour: "#…", a colour function or a CSS colour name (never "400").
  if (!/^#[0-9a-f]{3,8}$/i.test(s) && !/^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(s) && !/^[a-z]{3,20}$/i.test(s)) return null;
  const rgbaHex = /^rgba?\(\s*(#[0-9a-f]{3,8})\s*,\s*([\d.]+%?)\s*\)$/i.exec(s);
  if (rgbaHex) {
    const a = rgbaHex[2].endsWith('%') ? parseFloat(rgbaHex[2]) / 100 : parseFloat(rgbaHex[2]);
    if (a < 1) return null;
    s = rgbaHex[1];
  }
  const c = parse(s);
  if (!c || (c.alpha != null && c.alpha < 1)) return null;
  return formatHex(c);
}

export function toPx(v) {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return null;
  const s = v.trim();
  const m = /^(-?\d*\.?\d+)\s*(px|rem|em|pt)?$/i.exec(s);
  if (m) return parseFloat(m[1]) * ({ rem: 16, em: 16, pt: 1.333 }[m[2]?.toLowerCase()] ?? 1);
  return calc(s);
}

const WEIGHTS = { thin: 100, hairline: 100, extralight: 200, ultralight: 200, light: 300, regular: 400, normal: 400, book: 400, medium: 500, semibold: 600, demibold: 600, bold: 700, extrabold: 800, heavy: 800, black: 900 };
export function toWeight(v) {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').toLowerCase().replace(/[\s_-]/g, '');
  if (/^\d+$/.test(s)) return Number(s);
  for (const [k, n] of Object.entries(WEIGHTS)) if (s.includes(k)) return n;
  return null;
}

/** Line height to px for a font size: "150%", 1.5, "24px", "24". */
function lineHeightPx(v, size) {
  if (v == null || v === '' || !size) return null;
  const s = String(v).trim();
  if (s.endsWith('%')) return (parseFloat(s) / 100) * size;
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return null;
  if (/px$/i.test(s) || n > 4) return n;
  return n * size;
}

function shadowCss(v) {
  if (typeof v === 'string') return v;
  const one = (x) => {
    if (!isObj(x)) return null;
    const px = (n) => `${toPx(n) ?? 0}px`;
    const inset = x.type === 'innerShadow' || x.inset ? 'inset ' : '';
    return `${inset}${px(x.x ?? x.offsetX)} ${px(x.y ?? x.offsetY)} ${px(x.blur)} ${px(x.spread ?? 0)} ${x.color ?? 'rgba(0,0,0,.2)'}`;
  };
  if (Array.isArray(v)) return v.map(one).filter(Boolean).join(', ') || null;
  return one(v);
}

/** What a token is, from its declared type or, failing that, from its path and value. */
function classify(t) {
  const type = t.type.toLowerCase();
  const p = t.path.toLowerCase();
  if (type === 'color' || (!type && toHex(t.value))) return 'color';
  if (type === 'typography') return 'typography';
  if (type === 'boxshadow' || type === 'shadow' || (!type && /shadow|elevation/.test(p))) return 'shadow';
  if (type === 'fontfamilies' || type === 'fontfamily' || (!type && /font-?famil/.test(p))) return 'fontFamily';
  if (type === 'fontweights' || type === 'fontweight') return 'fontWeight';
  if (type === 'fontsizes' || type === 'fontsize' || /font-?size|text-?size|^text-[\w-]+-size$/.test(p)) return 'fontSize';
  if (type === 'lineheights' || type === 'lineheight' || /line-?height|leading/.test(p)) return 'lineHeight';
  if (type === 'borderradius' || /radius|rounded|corner/.test(p)) return 'radius';
  if (type === 'spacing' || /spac|gap|padding|margin|inset|gutter|stack/.test(p)) return 'spacing';
  if (type === 'sizing' || type === 'dimension' || type === 'borderwidth') return 'dimension';
  if (typeof t.value === 'string' && /^['"]?[A-Z][\w\s]+['"]?(,\s*[\w\s-]+)*$/.test(t.value) && /font|family|typeface/.test(p)) return 'fontFamily';
  return 'other';
}

/**
 * Reads a file and returns the resolved model:
 * { format, name, hasDark, tokens: [{ path, set, kind, light, dark, aliasOf, raw }], stats }
 */
export function readSystem(text, fileName = '') {
  const src = parseSource(text, fileName);
  const all = Object.entries(src.sets).flatMap(([set, tree]) => flatten(tree, set, []));
  if (!all.length) throw new Error('El archivo no contiene tokens.');
  const lightTheme = src.themes.find((t) => t.mode === 'light') ?? src.themes[0];
  const darkTheme = src.themes.find((t) => t.mode === 'dark');
  const setOrder = (theme) => (theme?.sets?.length ? theme.sets : Object.keys(src.sets));
  const light = resolveMode(all, setOrder(lightTheme));
  const dark = darkTheme ? resolveMode(all, setOrder(darkTheme)) : null;
  // DTCG files can carry both modes on one token ($extensions.modes, as Tokenforge and some plugins export).
  const modeExt = (t, mode) => t.ext?.modes?.[mode] ?? t.ext?.['com.figma']?.modes?.[mode];
  const paths = [...new Set([...light.keys(), ...(dark?.keys() ?? [])])];
  const tokens = paths.map((path) => {
    const l = light.get(path) ?? dark.get(path);
    const d = dark?.get(path);
    const kind = classify(l);
    const lv = modeExt(l, 'light') ?? l.value;
    const dv = modeExt(l, 'dark') ?? d?.value;
    return { path, set: l.set, kind, light: lv, dark: dv ?? null, aliasOf: l.aliasOf, raw: l.raw, inDarkSet: !!d && d.set !== l.set };
  });
  const hasDark = !!dark || tokens.some((t) => t.dark != null && t.dark !== t.light);
  const stats = tokens.reduce((acc, t) => ({ ...acc, [t.kind]: (acc[t.kind] ?? 0) + 1 }), {});
  const name = (fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b(tokens?|figma|studio|export|design system)\b/gi, '').trim()) || 'Sistema importado';
  return { format: src.format, name: name[0].toUpperCase() + name.slice(1), hasDark, themes: src.themes, sets: Object.keys(src.sets), tokens, stats };
}

// ---------------------------------------------------------------------------
// 4. Propose a mapping to Tokenforge's slots

const SLOT_WORDS = {
  primary: [/\bprimary\b/, /\bbrand\b/, /\baccent\b/, /\bmain\b/, /\binteractive\b/, /\baction\b/],
  secondary: [/\bsecondary\b/],
  tertiary: [/\btertiary\b/],
  neutral: [/\bneutral\b/, /\bgr[ae]ys?\b/, /\b(slate|zinc|stone|sand|ink|mono|charcoal)\b/],
  success: [/\b(success|positive|valid|ok)\b/, /\bgreen\b/],
  warning: [/\b(warning|caution|attention|notice)\b/, /\b(yellow|amber|orange)\b/],
  critical: [/\b(critical|danger|error|negative|destructive|alert)\b/, /\bred\b/],
  info: [/\b(info|informative|information)\b/, /\b(blue|cyan)\b/],
};
const HUES = { success: [120, 170], warning: [40, 95], critical: [0, 35], info: [210, 270] };
export const COLOR_SLOTS = Object.keys(SLOT_WORDS);

const words = (path) => path.toLowerCase().replace(/[._/-]+/g, ' ');
const lch = (hex) => { const o = toOklch(parse(hex)); return { l: o.l, c: o.c ?? 0, h: o.h ?? 0 }; };
const STEP = /^(\d{1,4})$/;

/** Colour groups: ramps (numbered steps under one parent) and single colours. */
export function colorGroups(model, mode = 'light') {
  const cols = model.tokens.filter((t) => t.kind === 'color').map((t) => ({ ...t, hex: toHex(mode === 'dark' ? (t.dark ?? t.light) : t.light) })).filter((t) => t.hex);
  const ramps = new Map();
  const singles = [];
  for (const t of cols) {
    const parts = t.path.split('.');
    const last = parts.at(-1);
    if (STEP.test(last) && parts.length > 1) {
      const key = parts.slice(0, -1).join('.');
      if (!ramps.has(key)) ramps.set(key, []);
      ramps.get(key).push({ step: Number(last), hex: t.hex, path: t.path, aliasOf: t.aliasOf });
    } else singles.push({ path: t.path, hex: t.hex, aliasOf: t.aliasOf });
  }
  const groups = [...ramps.entries()].filter(([, steps]) => steps.length >= 3).map(([path, steps]) => ({ path, kind: 'ramp', steps: steps.sort((a, b) => a.step - b.step) }));
  // Short "ramps" (1–2 steps) are treated as single colours.
  for (const [path, steps] of ramps) if (steps.length < 3) singles.push(...steps.map((s) => ({ path: s.path, hex: s.hex, aliasOf: s.aliasOf })));
  return { groups, singles };
}

/** The colour that best represents a ramp: the most chromatic step in a mid lightness band, else the middle step. */
export function rampSeed(steps, model = null) {
  // 1. The step the system itself uses as its main colour (a solid/default/base role pointing at it).
  if (model) {
    const paths = new Set(steps.map((st) => st.path));
    const main = model.tokens.find((t) => t.kind === 'color' && paths.has(t.aliasOf) && /\b(solid|default|base|main|fill)\b/.test(words(t.path)) && !/hover|active|pressed|subtle|text|border/.test(words(t.path)));
    if (main) return steps.find((st) => st.path === main.aliasOf).hex;
  }
  // 2. A 12-step functional ramp (1–12): step 9 is the solid.
  const nums = steps.map((st) => st.step);
  if (steps.length === 12 && nums[0] === 1 && nums[11] === 12) return steps[8].hex;
  // 3. Otherwise the most chromatic step in a mid lightness band.
  const mids = steps.filter((s) => { const o = lch(s.hex); return o.l > 0.42 && o.l < 0.72; });
  const pool = mids.length ? mids : steps;
  return [...pool].sort((a, b) => lch(b.hex).c - lch(a.hex).c)[0]?.hex ?? steps[Math.floor(steps.length / 2)].hex;
}

function score(path, slot) {
  const w = words(path);
  const list = SLOT_WORDS[slot];
  for (let i = 0; i < list.length; i++) if (list[i].test(w)) return i === 0 ? 3 : 2 - Math.min(1, i - 1) * 0.5;
  return 0;
}

/** Options the user can pick from for colour slots: every ramp and every single colour. */
export function colorOptions(model) {
  const { groups, singles } = colorGroups(model);
  const byStep = new Map(groups.flatMap((g) => g.steps.map((st) => [st.path, g])));
  // Follow an alias chain to the ramp it ends in (brand.primary → color.blue.600 → ramp color.blue).
  const aliasOf = new Map(model.tokens.map((t) => [t.path, t.aliasOf]));
  const rampOf = (path) => { let p = path; for (let i = 0; i < 8 && p; i++) { if (byStep.has(p)) return byStep.get(p); p = aliasOf.get(p); } return null; };
  return [
    ...groups.map((g) => ({ id: g.path, label: `${g.path} (${g.steps.length} pasos)`, hex: rampSeed(g.steps, model), steps: g.steps, ramp: g.path })),
    ...singles.map((s) => { const g = rampOf(s.path); return { id: s.path, label: g ? `${s.path} → ${g.path}` : s.path, hex: s.hex, steps: g?.steps ?? null, ramp: g?.path ?? null }; }),
  ];
}

// Tokens that describe a use (text, background, border…) are not palette colours.
const USAGE = /\b(text|fg|foreground|bg|background|border|surface|label|icon|outline|stroke|shadow|overlay|on ?brand|on ?primary|placeholder|divider)\b/;

/** Proposes which source colour/ramp feeds each slot. Returns { slot: optionId | null }. */
function proposeColors(model) {
  const opts = colorOptions(model);
  const taken = new Set();
  const pick = {};
  const usedRamps = new Set();
  const take = (slot, o) => { pick[slot] = o.id; taken.add(o.id); if (o.ramp) usedRamps.add(o.ramp); };
  const free = (o) => !taken.has(o.id) && !(o.ramp && usedRamps.has(o.ramp)) && !USAGE.test(words(o.id));
  const best = (slot) => {
    const ranked = opts.filter(free).map((o) => { const k = score(o.id, slot); return { o, s: k > 0 ? k + (o.steps ? 0.25 : 0) : 0 }; }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    return ranked[0]?.o ?? null;
  };
  // Keyword pass, most specific slots first.
  for (const slot of ['secondary', 'tertiary', 'success', 'warning', 'critical', 'primary', 'neutral', 'info']) {
    const o = best(slot);
    if (o) take(slot, o);
  }
  const ramps = () => opts.filter((o) => o.steps && o.id === o.ramp && free(o));
  // Hue pass for semantic colours that have no telling name.
  for (const [slot, [a, b]] of Object.entries(HUES)) {
    if (pick[slot]) continue;
    const o = ramps().find((r) => lch(r.hex).c > 0.08 && lch(r.hex).h >= a && lch(r.hex).h <= b);
    if (o) take(slot, o);
  }
  if (!pick.neutral) {
    const o = ramps().sort((x, y) => lch(x.hex).c - lch(y.hex).c)[0];
    if (o && lch(o.hex).c < 0.05) take('neutral', o);
  }
  if (!pick.primary) {
    const o = opts.filter(free).sort((x, y) => lch(y.hex).c - lch(x.hex).c)[0];
    if (o) take('primary', o);
  }
  for (const s of COLOR_SLOTS) pick[s] ??= null;
  return pick;
}

const TYPE_NAMES = ['display', 'h1', 'h2', 'h3', 'h4', 'lead', 'body', 'small', 'caption'];
const TYPE_WORDS = {
  display: /display|hero|jumbo|giant/,
  h1: /\bh1\b|heading ?1\b|heading (xxl|2xl|xl)\b|title (xl|large)|headline large/,
  h2: /\bh2\b|heading ?2\b|heading (lg|large)\b|headline medium|title l\b/,
  h3: /\bh3\b|heading ?3\b|heading (md|medium)\b|headline small|title m\b/,
  h4: /\bh4\b|heading ?4\b|heading (sm|small)\b|title (s|small)\b|subtitle|subheading/,
  lead: /\blead\b|body (lg|large|l)\b|intro|large text/,
  body: /\bbody\b(?! (sm|small|xs|lg|large|s|l)\b)|paragraph|body (md|medium|m|default|base)|text (md|base|default)/,
  small: /body (sm|small|s)\b|\bsmall\b|text sm\b|detail/,
  caption: /caption|overline|body xs|text xs|tiny|footnote|label (sm|small|xs)/,
};

/** Typography: named styles from composite tokens or font-size tokens, matched to the scale names. */
function proposeType(model) {
  const styles = [];
  for (const t of model.tokens) {
    if (t.kind === 'typography' && isObj(t.light)) {
      const size = toPx(t.light.fontSize);
      if (size) styles.push({ path: t.path, size, lineHeightPx: lineHeightPx(t.light.lineHeight, size), weight: toWeight(t.light.fontWeight), family: t.light.fontFamily });
    } else if (t.kind === 'fontSize') {
      const size = toPx(t.light);
      if (size) styles.push({ path: t.path, size, lineHeightPx: null, weight: null });
    }
  }
  const out = {};
  const used = new Set();
  for (const name of TYPE_NAMES) {
    const hit = styles.find((s) => !used.has(s.path) && TYPE_WORDS[name].test(words(s.path)));
    if (hit) { out[name] = hit; used.add(hit.path); }
  }
  // Fill the gaps with sizes that fit between their neighbours (sizes already used are skipped).
  const usedSizes = () => new Set(Object.values(out).map((s) => s.size));
  const pool = () => [...new Map(styles.filter((s) => !used.has(s.path) && !usedSizes().has(s.size)).map((s) => [s.size, s])).values()];
  if (!out.body) {
    const b = pool().sort((x, y) => Math.abs(x.size - 16) - Math.abs(y.size - 16))[0];
    if (b) { out.body = b; used.add(b.path); }
  }
  const order = ['caption', 'small', 'body', 'lead', 'h4', 'h3', 'h2', 'h1', 'display'];
  const bounds = (name) => {
    const i = order.indexOf(name);
    const below = order.slice(0, i).map((n) => out[n]?.size).filter(Boolean);
    const above = order.slice(i + 1).map((n) => out[n]?.size).filter(Boolean);
    return [below.length ? Math.max(...below) : 0, above.length ? Math.min(...above) : Infinity];
  };
  // Upwards from the body, take the smallest size that fits; downwards, the largest.
  for (const name of ['lead', 'h4', 'h3', 'h2', 'h1', 'display']) {
    if (out[name]) continue;
    const [lo, hi] = bounds(name);
    const hit = pool().filter((s) => s.size > lo && s.size < hi).sort((a, b) => a.size - b.size)[0];
    if (hit) { out[name] = hit; used.add(hit.path); }
  }
  for (const name of ['small', 'caption']) {
    if (out[name]) continue;
    const [lo, hi] = bounds(name);
    const hit = pool().filter((s) => s.size > lo && s.size < hi).sort((a, b) => b.size - a.size)[0];
    if (hit) { out[name] = hit; used.add(hit.path); }
  }
  return out;
}

const FONT_WORDS = { body: /body|text|base|paragraph|sans|primary|default|regular/, heading: /heading|display|title|headline|brand/, mono: /mono|code/ };
function fontName(v) {
  if (typeof v !== 'string') return null;
  return v.split(',')[0].replace(/['"]/g, '').trim() || null;
}
function proposeFonts(model, type) {
  const fams = model.tokens.filter((t) => t.kind === 'fontFamily').map((t) => ({ path: t.path, name: fontName(t.light) })).filter((f) => f.name);
  const find = (k) => fams.find((f) => FONT_WORDS[k].test(words(f.path)))?.name;
  const fromType = (names) => names.map((n) => fontName(type[n]?.family)).find(Boolean);
  const body = find('body') ?? fromType(['body', 'small']) ?? fams.find((f) => !/mono|code/i.test(f.path + f.name))?.name ?? null;
  const heading = find('heading') ?? fromType(['h1', 'h2', 'display']) ?? body;
  const mono = find('mono') ?? fams.find((f) => /mono|code/i.test(f.name))?.name ?? null;
  return { body, heading, mono, options: [...new Set(fams.map((f) => f.name))] };
}

// Most telling words first.
const RADIUS_WORDS = {
  boxes: [/card|container|modal|dialog|panel|box|surface|sheet/, /\b(lg|large)\b/, /\b(xl|xxl)\b/],
  fields: [/input|field|control/, /button/, /\b(md|medium|default|base)\b/],
  selectors: [/chip|tag|badge|checkbox|toggle/, /\b(sm|small)\b/, /\bxs\b/],
};
function proposeRadius(model) {
  const list = model.tokens.filter((t) => t.kind === 'radius').map((t) => ({ path: t.path, px: toPx(t.light) })).filter((r) => r.px != null && r.px >= 0);
  const out = {};
  const used = new Set();
  for (const k of ['boxes', 'fields', 'selectors']) {
    for (const re of RADIUS_WORDS[k]) {
      const hit = list.find((r) => !used.has(r.path) && r.px > 0 && r.px < 999 && re.test(words(r.path)));
      if (hit) { out[k] = hit; used.add(hit.path); break; }
    }
  }
  const free = [...new Map(list.filter((r) => !used.has(r.path) && r.px > 0 && r.px < 999).map((r) => [r.px, r])).values()].sort((a, b) => b.px - a.px);
  for (const k of ['boxes', 'fields', 'selectors']) if (!out[k] && free.length) out[k] = k === 'selectors' ? free.pop() : free.shift();
  return { ...out, all: list };
}

function proposeSpacing(model) {
  const values = model.tokens.filter((t) => t.kind === 'spacing').map((t) => ({ path: t.path, px: toPx(t.light) })).filter((s) => s.px != null && s.px > 0);
  const nums = [...new Set(values.map((v) => Math.round(v.px)))].sort((a, b) => a - b);
  // The base most values follow (8 if nearly all are multiples of 8, else 4); the rest are off-grid.
  const share = (n) => (nums.length ? nums.filter((v) => v % n === 0).length / nums.length : 1);
  const unit = share(8) >= 0.8 ? 8 : 4;
  const offGrid = values.filter((v) => Math.round(v.px) % 4 !== 0);
  // Density from the medium step (md/base/default) or the median, against Tokenforge's 16 px padding.
  const named = values.find((v) => /\b(md|medium|base|default|m)\b/.test(words(v.path).split(' ').at(-1)) && v.px > 4);
  const mid = named?.px ?? (nums.length ? nums[Math.floor(nums.length / 2)] : 16);
  const ratio = mid / 16;
  const density = Object.entries(SPACING_PRESETS).sort((a, b) => Math.abs(a[1] - ratio) - Math.abs(b[1] - ratio) || Math.abs(a[1] - 1) - Math.abs(b[1] - 1))[0][0];
  return { values, unit, density, offGrid };
}

function proposeShadows(model) {
  const list = model.tokens.filter((t) => t.kind === 'shadow').map((t) => ({ path: t.path, light: shadowCss(t.light), dark: t.dark != null ? shadowCss(t.dark) : null }))
    .filter((s) => s.light && s.light !== 'none');
  const blur = (css) => { const n = (css.match(/-?\d*\.?\d+px/g) ?? []).map(parseFloat); return n[2] ?? n[1] ?? 0; };
  const sorted = [...list].sort((a, b) => blur(a.light) - blur(b.light));
  if (!sorted.length) return { all: list };
  const at = (f) => sorted[Math.min(sorted.length - 1, Math.round(f * (sorted.length - 1)))];
  return { sm: at(0), md: at(0.5), lg: at(1), all: list };
}

/** The full proposal the user reviews and edits before importing. */
export function proposeMapping(model) {
  const type = proposeType(model);
  return {
    name: model.name,
    colors: proposeColors(model),
    type,
    fonts: proposeFonts(model, type),
    radius: proposeRadius(model),
    spacing: proposeSpacing(model),
    shadows: proposeShadows(model),
  };
}

// ---------------------------------------------------------------------------
// 5. Build a Tokenforge brand that keeps the source's exact values

/**
 * Places a source ramp's colours into Tokenforge's 12 steps: each source colour goes to the step
 * whose generated lightness is closest (within 0.07), so exact values are kept and gaps are generated.
 */
export function placeRamp(sourceHexes, seed, appearance = 'light') {
  const target = buildRamp(seed, appearance).map((h) => lch(h).l);
  const slots = Array(12).fill(null);
  const seedHex = seed.toLowerCase();
  const items = [...new Set(sourceHexes.map((h) => h.toLowerCase()))].filter((h) => h !== seedHex).map((hex) => ({ hex, l: lch(hex).l })).sort((a, b) => (appearance === 'light' ? b.l - a.l : a.l - b.l));
  for (const it of items) {
    let bestI = -1;
    let bestD = 0.07;
    // Steps 9 and 10 are the solid and its hover: they come from the seed, not from lightness matching.
    target.forEach((l, i) => { const d = Math.abs(l - it.l); if (i !== 8 && i !== 9 && !slots[i] && d < bestD) { bestD = d; bestI = i; } });
    if (bestI >= 0) slots[bestI] = it.hex;
  }
  // The seed always sits at step 9 (the solid), as in a generated ramp.
  slots[8] = seed;
  return slots;
}

const nearest = (obj, v) => Object.entries(obj).sort((a, b) => Math.abs(a[1] - v) - Math.abs(b[1] - v))[0][0];

/** Turns the reviewed mapping into a brand. base is a fresh brand (newBrand()). */
export function buildBrand(model, mapping, base) {
  const opts = colorOptions(model);
  const darkOpts = model.hasDark ? colorOptions({ ...model, tokens: model.tokens.map((t) => ({ ...t, light: t.dark ?? t.light })) }) : [];
  const colors = { ...base.colors, secondary: '', tertiary: '' };
  const darkColors = {};
  const ramps = { light: {}, dark: {} };
  const kept = {};
  for (const slot of COLOR_SLOTS) {
    const id = mapping.colors[slot];
    const o = opts.find((x) => x.id === id);
    if (!o) continue;
    colors[slot] = o.hex;
    if (o.steps) {
      ramps.light[slot] = placeRamp(o.steps.map((s) => s.hex), o.hex, 'light');
      const src = new Set(o.steps.map((st) => st.hex.toLowerCase()));
      kept[slot] = { kept: new Set(ramps.light[slot].filter((h) => h && src.has(h))).size, total: src.size };
    }
    const d = darkOpts.find((x) => x.id === id);
    if (d && d.hex !== o.hex) {
      darkColors[slot] = d.hex;
      if (d.steps) ramps.dark[slot] = placeRamp(d.steps.map((s) => s.hex), d.hex, 'dark');
    }
  }
  const t = mapping.type;
  const type = {};
  for (const name of TYPE_NAMES) if (t[name]?.size) type[name] = { size: Math.round(t[name].size * 10) / 10, ...(t[name].lineHeightPx ? { lineHeightPx: Math.round(t[name].lineHeightPx) } : {}), ...(t[name].weight ? { weight: t[name].weight } : {}) };
  const bodySize = type.body?.size ?? 16;
  const density = nearest(Object.fromEntries(Object.entries(DENSITIES).map(([k, d]) => [k, d.base])), bodySize);
  const r = mapping.radius;
  const radiusPx = {};
  for (const k of ['boxes', 'fields', 'selectors']) if (r[k]?.px != null) radiusPx[k] = Math.round(r[k].px);
  const radius = { ...base.radius };
  for (const k of Object.keys(radiusPx)) radius[k] = nearest(RADIUS_PRESETS, radiusPx[k]);
  const sh = mapping.shadows;
  const shadow = {};
  if (sh.sm) { shadow.light = { sm: sh.sm.light, md: sh.md.light, lg: sh.lg.light }; if (sh.md.dark) shadow.dark = { sm: sh.sm.dark ?? sh.sm.light, md: sh.md.dark, lg: sh.lg.dark ?? sh.lg.light }; }
  const shadowPreset = sh.md ? (() => { const n = (sh.md.light.match(/-?\d*\.?\d+px/g) ?? []).map(parseFloat); const blur = n[2] ?? 0; return nearest(Object.fromEntries(Object.entries(SHADOW_PRESETS).map(([k, p]) => [k, p.blur])), blur); })() : base.shadow;
  const f = mapping.fonts;
  return {
    ...base,
    name: mapping.name || model.name,
    colors,
    darkColors,
    font: f.body || base.font,
    headingFont: f.heading || f.body || base.headingFont,
    monoFont: f.mono || base.monoFont,
    density,
    radius,
    shadow: shadowPreset,
    spacing: mapping.spacing.density ?? base.spacing,
    locked: { ramps, radius: radiusPx, type, ...(shadow.light ? { shadow } : {}) },
    source: { name: mapping.name || model.name, format: model.format, importedAt: Date.now(), tokens: model.tokens.length, hasDark: model.hasDark, kept },
  };
}

export const FORMAT_LABEL = { 'tokens-studio': 'Tokens Studio (Figma)', dtcg: 'W3C Design Tokens (JSON)', css: 'Variables CSS' };
