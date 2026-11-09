// Analysis of an imported design system: what works, what to improve, and fixes that can be applied.
// It reads the source as it is (model), the mapping, and the system Tokenforge builds from it (sys).
import { converter, parse } from 'culori';
import { wcag } from './color.js';
import { toHex, toPx, colorGroups, COLOR_SLOTS, colorOptions } from './importer.js';
import { COMPONENTS, CORE_IDS } from './catalog.js';

const toOklab = converter('oklab');
const toOklch = converter('oklch');
const words = (p) => p.toLowerCase().replace(/[._/-]+/g, ' ');
const dist = (a, b) => { const x = toOklab(parse(a)); const y = toOklab(parse(b)); return Math.hypot(x.l - y.l, x.a - y.a, x.b - y.b); };

export const CATEGORIES = [
  { id: 'contrast', name: 'Contraste', weight: 30 },
  { id: 'color', name: 'Color', weight: 20 },
  { id: 'type', name: 'Tipografía', weight: 15 },
  { id: 'space', name: 'Espaciado y forma', weight: 10 },
  { id: 'structure', name: 'Estructura y nombres', weight: 15 },
  { id: 'dark', name: 'Modo oscuro', weight: 10 },
];
const PENALTY = { alta: 30, media: 12, baja: 5, info: 0 };
export const SEVERITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja', info: 'Nota' };

const TEXTISH = /\b(text|fg|foreground|content|label|heading|body|title|link|on ?brand|on ?primary|on ?solid|onbrand|onprimary)\b/;
const BGISH = /\b(bg|background|surface|canvas|page|fill)\b/;
const SKIP_CONTRAST = /\b(disabled|placeholder|inverse|inverted|on ?dark|on ?light)\b/;

/** The page background of one mode: a token named bg/surface default, else white (light) or the darkest neutral (dark). */
function mainBackground(colors, mode) {
  const named = colors.find((c) => BGISH.test(words(c.path)) && /\b(default|primary|base|page|canvas|main)\b|^bg$|background$/.test(words(c.path)));
  if (named) return named;
  const any = colors.find((c) => BGISH.test(words(c.path)));
  if (any) return any;
  return { path: mode === 'light' ? '(blanco)' : '(fondo oscuro)', hex: mode === 'light' ? '#ffffff' : '#111111' };
}

function contrastChecks(model, sys, out) {
  const fails = [];
  let checked = 0;
  for (const mode of ['light', 'dark']) {
    if (mode === 'dark' && !model.hasDark) continue;
    const colors = model.tokens.filter((t) => t.kind === 'color').map((t) => ({ path: t.path, hex: toHex(mode === 'dark' ? (t.dark ?? t.light) : t.light), set: t.set, inDarkSet: t.inDarkSet })).filter((c) => c.hex);
    const bg = mainBackground(colors, mode);
    // Text tokens against the page background.
    for (const c of colors) {
      const w = words(c.path);
      if (!TEXTISH.test(w) || BGISH.test(w) || SKIP_CONTRAST.test(w) || /\bon ?(brand|primary|solid)\b|onbrand|onprimary|label/.test(w)) continue;
      checked++;
      const r = wcag(c.hex, bg.hex);
      if (r < 4.5) fails.push({ mode, fg: c.path, bg: bg.path, fgHex: c.hex, bgHex: bg.hex, ratio: r });
    }
    // Sibling pairs inside a component or role group: label/text on background/fill.
    const byParent = new Map();
    for (const c of colors) { const k = c.path.split('.').slice(0, -1).join('.'); if (!byParent.has(k)) byParent.set(k, []); byParent.get(k).push(c); }
    for (const [, list] of byParent) {
      const fill = list.find((c) => /\b(background|bg|fill)\b/.test(words(c.path.split('.').at(-1))));
      const ink = list.find((c) => /\b(label|text|foreground|fg|content|icon)\b/.test(words(c.path.split('.').at(-1))));
      if (!fill || !ink) continue;
      checked++;
      const r = wcag(ink.hex, fill.hex);
      if (r < 4.5) fails.push({ mode, fg: ink.path, bg: fill.path, fgHex: ink.hex, bgHex: fill.hex, ratio: r });
    }
  }
  if (fails.length) {
    // What the same roles become once Tokenforge solves them for AA.
    const r = sys.appearances.light.roles;
    out.push({
      id: 'contrast-fails', cat: 'contrast', severity: fails.some((f) => f.ratio < 3) ? 'alta' : 'media',
      title: `${fails.length} ${fails.length === 1 ? 'par de texto no cumple' : 'pares de texto no cumplen'} el contraste mínimo (WCAG AA 4,5:1)`,
      detail: 'Texto difícil de leer para personas con baja visión o en pantallas con reflejos. Es el problema que más afecta a la accesibilidad.',
      items: fails.slice(0, 12).map((f) => `${f.mode === 'dark' ? '[oscuro] ' : ''}${f.fg} (${f.fgHex}) sobre ${f.bg} (${f.bgHex}): ${f.ratio.toFixed(2)}:1`),
      note: `Al importar, los roles de texto se resuelven para cumplir AA. Por ejemplo, el texto secundario queda en ${r['text-secondary']} (${wcag(r['text-secondary'], r['bg-surface']).toFixed(1)}:1) y el terciario en ${r['text-tertiary']} (${wcag(r['text-tertiary'], r['bg-surface']).toFixed(1)}:1).`,
    });
  } else if (checked) {
    out.push({ id: 'contrast-ok', cat: 'contrast', severity: 'ok', title: `Los ${checked} pares de texto revisados cumplen AA`, detail: '' });
  } else {
    out.push({ id: 'contrast-unknown', cat: 'contrast', severity: 'media', title: 'No hay tokens de texto y fondo para comprobar el contraste', detail: 'Sin roles como text.primary o bg.default no se puede saber qué colores van juntos, y cada pantalla decide por su cuenta. Al importar se crean roles de texto, fondo y borde ya resueltos para AA.' });
  }
}

function colorChecks(model, mapping, brand, out) {
  // Near-duplicates among literal palette colours (aliases are the same colour on purpose).
  // Palette colours only: roles (text, bg, subtle, solid…) are meant to sit close to their sources.
  const ROLEISH = /\b(text|fg|foreground|bg|background|surface|canvas|border|subtle|solid|hover|active|muted|focus|ring|on|label|disabled|placeholder)\b/;
  const lits = [...new Map(model.tokens.filter((t) => t.kind === 'color' && !t.aliasOf && !ROLEISH.test(words(t.path))).map((t) => [toHex(t.light), t.path]).filter(([h]) => h && h !== '#ffffff' && h !== '#000000')).entries()];
  // Steps of two different ramps may look alike on purpose (two very light tints); flag the rest.
  const rampOf = (path) => { const parts = path.split('.'); return /^\d{1,4}$/.test(parts.at(-1)) ? parts.slice(0, -1).join('.') : null; };
  const dups = [];
  for (let i = 0; i < lits.length; i++) for (let j = i + 1; j < lits.length; j++) {
    const [ha, pa] = lits[i];
    const [hb, pb] = lits[j];
    const ra = rampOf(pa);
    const rb = rampOf(pb);
    // Tints inside ramps are close on purpose: compare loose colours only.
    if (ra && rb) continue;
    const d = dist(ha, hb);
    if (d > 0 && d < 0.012) dups.push(`${pa} (${ha}) ≈ ${pb} (${hb})`);
  }
  if (dups.length) out.push({ id: 'near-dups', cat: 'color', severity: dups.length > 3 ? 'media' : 'baja', title: `${dups.length} ${dups.length === 1 ? 'pareja de colores casi idénticos' : 'parejas de colores casi idénticos'}`, detail: 'Colores que no se distinguen a simple vista: duplican decisiones y acaban usándose al azar. Quédate con uno y apunta el otro a él.', items: dups.slice(0, 10) });

  // Ramps whose lightness jumps unevenly or goes backwards.
  const { groups } = colorGroups(model);
  const uneven = [];
  const optByRamp = new Map(colorOptions(model).filter((o) => o.ramp).map((o) => [o.id, o.ramp]));
  for (const g of groups.filter((x) => x.steps.length >= 5)) {
    const L = g.steps.map((s) => toOklch(parse(s.hex)).l);
    const deltas = L.slice(1).map((l, i) => L[i] - l);
    // A small step back (a hover tone next to the solid) is fine; a real reversal is not.
    const main = Math.sign(deltas.reduce((a, b) => a + b, 0)) || 1;
    const backwards = deltas.some((d) => d * main < -0.06);
    // Functional ramps space their steps unevenly on purpose (close backgrounds, distant solids).
    // What is wrong is a step that repeats the one before: it adds a name without adding a colour.
    const repeated = g.steps.slice(1).filter((s, i) => dist(s.hex, g.steps[i].hex) < 0.008).map((s) => s.step);
    const jump = repeated.length;
    if (backwards || repeated.length) {
      const slot = COLOR_SLOTS.find((s) => mapping.colors[s] === g.path || optByRamp.get(mapping.colors[s]) === g.path);
      uneven.push({ g, backwards, jump, slot });
    }
  }
  for (const u of uneven) {
    out.push({
      id: `ramp-${u.g.path}`, cat: 'color', severity: u.backwards ? 'media' : 'baja',
      title: `La rampa ${u.g.path} ${u.backwards ? 'cambia de dirección' : `repite ${u.jump === 1 ? 'un paso' : `${u.jump} pasos`}`}`,
      detail: u.backwards
        ? 'La luminosidad sube y baja entre pasos: un paso «más oscuro» puede ser más claro que el anterior, y los estados hover o activo dejan de ser predecibles.'
        : 'Hay pasos prácticamente iguales al anterior: son nombres distintos para el mismo color y obligan a elegir sin criterio.',
      items: u.g.steps.map((s) => `${s.step}: ${s.hex} (L ${(toOklch(parse(s.hex)).l * 100).toFixed(0)})`),
      ...(u.slot && brand.locked?.ramps?.light?.[u.slot] ? { fix: { label: 'Usar una rampa uniforme generada a partir de tu color', apply: (b) => ({ ...b, locked: { ...b.locked, ramps: { ...b.locked.ramps, light: Object.fromEntries(Object.entries(b.locked.ramps.light).filter(([k]) => k !== u.slot)) } } }) } } : {}),
    });
  }

  const missing = ['secondary', 'tertiary', 'info'].filter((s) => !mapping.colors[s]);
  if (missing.length) out.push({ id: 'palette-gaps', cat: 'color', severity: 'info', title: `Sin color ${missing.map((s) => ({ secondary: 'secundario', tertiary: 'terciario', info: 'informativo' }[s])).join(', ')}`, detail: 'Al importar se derivan de tu primario (secundario y terciario) o se usa un azul accesible (info). Puedes cambiarlos después en el panel Color.' });
  const semantic = ['success', 'warning', 'critical'].filter((s) => !mapping.colors[s]);
  if (semantic.length) out.push({ id: 'semantic-gaps', cat: 'color', severity: 'media', title: `Faltan colores de estado: ${semantic.map((s) => ({ success: 'éxito', warning: 'aviso', critical: 'error' }[s])).join(', ')}`, detail: 'Sin ellos, cada equipo improvisa los avisos y los errores. Se añaden con valores accesibles al importar.' });
}

function typeChecks(model, mapping, brand, out) {
  const styles = Object.entries(mapping.type).filter(([, s]) => s?.size).sort((a, b) => a[1].size - b[1].size);
  if (styles.length >= 4) {
    const raw = styles.slice(1).map(([, s], i) => s.size / styles[i][1].size).filter((r) => r > 1.001);
    // A size can skip a step of the scale on purpose (display): compare each ratio with the base ratio.
    const base = [...raw].sort((a, b) => a - b)[Math.floor(raw.length / 2)] || 1.2;
    const ratios = raw.map((r) => { const k = Math.max(1, Math.round(Math.log(r) / Math.log(base))); return r ** (1 / k); });
    const mean = ratios.reduce((a, b) => a + b, 0) / (ratios.length || 1);
    const cv = ratios.length ? Math.sqrt(ratios.reduce((a, r) => a + (r - mean) ** 2, 0) / ratios.length) / mean : 0;
    if (cv > 0.06) out.push({
      id: 'type-ratio', cat: 'type', severity: cv > 0.12 ? 'media' : 'baja',
      title: 'La escala tipográfica no sigue una proporción constante',
      detail: `Entre tamaños consecutivos la proporción va de ${Math.min(...ratios).toFixed(2)} a ${Math.max(...ratios).toFixed(2)}. Con una proporción fija (escala modular) la jerarquía se lee de un vistazo y es fácil añadir tamaños.`,
      items: styles.map(([n, s]) => `${n}: ${Math.round(s.size * 10) / 10} px (${s.path})`),
      fix: { label: 'Usar una escala modular a partir de tu tamaño de texto', apply: (b) => ({ ...b, locked: { ...b.locked, type: {} } }) },
    });
  }
  const offLh = Object.entries(brand.locked?.type ?? {}).filter(([, t]) => t.lineHeightPx && t.lineHeightPx % 4 !== 0);
  if (offLh.length) out.push({
    id: 'type-lh', cat: 'type', severity: 'baja', title: `${offLh.length} ${offLh.length === 1 ? 'altura de línea no cae' : 'alturas de línea no caen'} en la rejilla de 4 px`,
    detail: 'Las alturas de línea múltiplos de 4 alinean el texto con el espaciado y los iconos.',
    items: offLh.map(([n, t]) => `${n}: ${t.size}/${t.lineHeightPx} px → ${Math.round(t.lineHeightPx / 4) * 4} px`),
    fix: { label: 'Redondear las alturas de línea a múltiplos de 4', apply: (b) => ({ ...b, locked: { ...b.locked, type: Object.fromEntries(Object.entries(b.locked.type ?? {}).map(([n, t]) => [n, t.lineHeightPx ? { ...t, lineHeightPx: Math.round(t.lineHeightPx / 4) * 4 } : t])) } }) },
  });
  const sizes = new Set(model.tokens.filter((t) => t.kind === 'fontSize').map((t) => toPx(t.light)).filter(Boolean));
  if (sizes.size > 11) out.push({ id: 'type-many', cat: 'type', severity: 'baja', title: `${sizes.size} tamaños de letra distintos`, detail: 'Más de 9–10 tamaños suele indicar estilos creados para un caso puntual. Reúnelos en la escala.' });
  if (!mapping.fonts.body) out.push({ id: 'type-family', cat: 'type', severity: 'media', title: 'No hay familia tipográfica definida', detail: 'Se usará Inter hasta que elijas la tuya en Tipografía.' });
}

function spaceChecks(model, mapping, out) {
  const off = mapping.spacing.offGrid ?? [];
  if (off.length) out.push({
    id: 'space-grid', cat: 'space', severity: off.length > 2 ? 'media' : 'baja',
    title: `${off.length} ${off.length === 1 ? 'espaciado fuera' : 'espaciados fuera'} de la rejilla de 4 px`,
    detail: 'Los valores sueltos rompen el ritmo vertical y multiplican las decisiones. Al importar se usa la escala de base 4; estos valores pasan al paso más cercano.',
    items: off.map((v) => `${v.path}: ${v.px} px → ${Math.max(4, Math.round(v.px / 4) * 4)} px`),
  });
  if (!mapping.spacing.values.length) out.push({ id: 'space-none', cat: 'space', severity: 'media', title: 'No hay tokens de espaciado', detail: 'Se añade una escala de base 4 (--space-1 … --space-24) y espaciados de layout por pantalla.' });
  const radii = [...new Set((mapping.radius.all ?? []).map((r) => r.px).filter((px) => px > 0 && px < 999))];
  if (radii.length > 5) out.push({
    id: 'radius-many', cat: 'space', severity: 'baja', title: `${radii.length} radios distintos`,
    detail: 'Tres radios (cajas, campos y selectores) cubren casi todo. Muchos radios hacen que componentes parecidos se vean distintos.',
    items: [`${radii.sort((a, b) => a - b).join(', ')} px`, `Se usan: cajas ${mapping.radius.boxes?.px ?? '—'} px, campos ${mapping.radius.fields?.px ?? '—'} px, selectores ${mapping.radius.selectors?.px ?? '—'} px`],
  });
}

const COMPONENT_WORDS = COMPONENTS.map((c) => ({ id: c.id, re: new RegExp(`^(components? )?(${[c.id, c.nameEn].map((n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '[ -]?')).join('|')})\\b`) }));

function structureChecks(model, out) {
  const colors = model.tokens.filter((t) => t.kind === 'color');
  const semantic = colors.filter((t) => TEXTISH.test(words(t.path)) || BGISH.test(words(t.path)) || /\b(border|brand|feedback|status|intent)\b/.test(words(t.path)));
  const primitives = colors.filter((t) => !t.aliasOf && !semantic.includes(t));
  if (!semantic.length) out.push({ id: 'tiers', cat: 'structure', severity: 'alta', title: 'Solo hay colores primitivos, sin roles semánticos', detail: 'Con solo azul-500 o gris-900, cada pantalla decide qué color es texto o fondo y el modo oscuro es imposible de mantener. Al importar se crean roles (bg-*, text-*, border-*, primary-solid…) que apuntan a tus colores.' });
  else out.push({ id: 'tiers-ok', cat: 'structure', severity: 'ok', title: `Hay dos niveles: ${primitives.length} primitivos y ${semantic.length} semánticos`, detail: '' });
  const hard = semantic.filter((t) => !t.aliasOf && typeof t.raw === 'string' && /^#|^rgb|^hsl/.test(t.raw.trim()));
  if (hard.length) out.push({ id: 'hardcoded', cat: 'structure', severity: 'media', title: `${hard.length} ${hard.length === 1 ? 'token semántico tiene' : 'tokens semánticos tienen'} el color escrito a mano`, detail: 'Un rol debería apuntar a un primitivo ({color.gray.100}). Escrito a mano, se desincroniza cuando cambias la paleta.', items: hard.slice(0, 10).map((t) => `${t.path}: ${t.raw}`) });
  // Naming conventions mixed across segments.
  // Group names that Tokens Studio itself imposes are not the team's convention.
  const STUDIO = /^(fontFamil(y|ies)|fontWeights?|fontSizes?|lineHeights?|letterSpacing|paragraphSpacing|paragraphIndent|borderRadius|borderWidth|boxShadow|textCase|textDecoration|sizing|spacing|opacity)$/;
  const segs = model.tokens.flatMap((t) => t.path.split('.')).filter((x) => !STUDIO.test(x));
  const camel = segs.filter((s) => /[a-z][A-Z]/.test(s));
  const kebab = segs.filter((s) => /[a-z]-[a-z]/.test(s));
  const snake = segs.filter((s) => /[a-z]_[a-z]/.test(s));
  const styles = [camel, kebab, snake].filter((x) => x.length);
  if (styles.length > 1) out.push({ id: 'naming', cat: 'structure', severity: 'baja', title: 'Nombres con convenciones mezcladas', detail: 'Mezclar camelCase, kebab-case y snake_case hace que los nombres no se puedan adivinar. Elige una (lo habitual es kebab-case).', items: [...new Set([...camel.slice(0, 3), ...kebab.slice(0, 3), ...snake.slice(0, 3)])] });
  // Component tokens and coverage of the essentials.
  const comps = new Set();
  for (const t of model.tokens) { const w = words(t.path); const hit = COMPONENT_WORDS.find((c) => c.re.test(w)); if (hit) comps.add(hit.id); }
  const missingCore = CORE_IDS.filter((id) => !comps.has(id));
  out.push({
    id: 'components', cat: 'structure', severity: 'info',
    title: comps.size ? `${comps.size} ${comps.size === 1 ? 'componente con tokens propios' : 'componentes con tokens propios'}` : 'Sin tokens de componente',
    detail: comps.size ? `Tienes tokens para: ${[...comps].map((id) => COMPONENTS.find((c) => c.id === id).name).join(', ')}. ${missingCore.length} componentes básicos no tienen tokens; al importar usan los del sistema.` : 'Es normal en sistemas pequeños: los componentes usan los roles. Al importar se incluyen los componentes básicos del catálogo.',
  });
  return comps;
}

function darkChecks(model, out) {
  if (!model.hasDark) {
    out.push({ id: 'dark-none', cat: 'dark', severity: 'alta', title: 'No hay modo oscuro', detail: 'Cada vez más gente usa el modo oscuro del sistema. Al importar se genera automáticamente para todos los colores, con contraste AA, y puedes fijar tonos propios en el panel Color.', fix: null });
    return;
  }
  // Semantic tokens defined for light but never redefined for dark.
  // A role whose dark value equals the light one is fine (white labels on solids); a missing one is not.
  const lightOnly = model.tokens.filter((t) => t.kind === 'color' && !t.inDarkSet && t.dark == null && (TEXTISH.test(words(t.path)) || BGISH.test(words(t.path)) || /\bborder\b/.test(words(t.path))));
  const themed = model.tokens.filter((t) => t.kind === 'color' && (t.inDarkSet || (t.dark != null && t.dark !== t.light)));
  if (lightOnly.length) out.push({ id: 'dark-gaps', cat: 'dark', severity: lightOnly.length > 4 ? 'media' : 'baja', title: `${lightOnly.length} ${lightOnly.length === 1 ? 'rol no tiene' : 'roles no tienen'} valor en modo oscuro`, detail: 'En oscuro se quedan con el color claro: fondos blancos o bordes que desaparecen. Al importar, todos los roles tienen su versión oscura.', items: lightOnly.slice(0, 12).map((t) => t.path) });
  else out.push({ id: 'dark-ok', cat: 'dark', severity: 'ok', title: `Modo oscuro completo (${themed.length} tokens con valor propio)`, detail: '' });
}

/** Runs every check. Returns { score, categories: [{ id, name, score }], findings, strengths }. */
export function analyzeSystem(model, mapping, brand, sys) {
  const f = [];
  contrastChecks(model, sys, f);
  colorChecks(model, mapping, brand, f);
  typeChecks(model, mapping, brand, f);
  spaceChecks(model, mapping, f);
  structureChecks(model, f);
  darkChecks(model, f);
  const findings = f.filter((x) => x.severity !== 'ok');
  const strengths = f.filter((x) => x.severity === 'ok');
  const categories = CATEGORIES.map((c) => {
    const pen = findings.filter((x) => x.cat === c.id).reduce((a, x) => a + PENALTY[x.severity], 0);
    return { ...c, score: Math.max(0, 100 - pen) };
  });
  const score = Math.round(categories.reduce((a, c) => a + c.score * c.weight, 0) / categories.reduce((a, c) => a + c.weight, 0));
  const order = { alta: 0, media: 1, baja: 2, info: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  return { score, categories, findings, strengths };
}

/** The report as Markdown, to share with the team. */
export function toAnalysisMd(report, model) {
  const lines = [
    `# Análisis del sistema de diseño «${model.name}»`,
    '',
    `Generado con Tokenforge el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}. ${model.tokens.length} tokens leídos (${model.format}), ${model.hasDark ? 'con' : 'sin'} modo oscuro.`,
    '',
    `**Puntuación: ${report.score}/100**`,
    '',
    '| Área | Puntuación |',
    '|---|---|',
    ...report.categories.map((c) => `| ${c.name} | ${c.score} |`),
    '',
  ];
  if (report.strengths.length) lines.push('## Lo que ya funciona', '', ...report.strengths.map((s) => `- ${s.title}`), '');
  lines.push('## Mejoras, por prioridad', '');
  for (const x of report.findings) {
    lines.push(`### ${SEVERITY_LABEL[x.severity]} · ${x.title}`, '', x.detail);
    if (x.items?.length) lines.push('', ...x.items.map((i) => `- \`${i}\``));
    if (x.note) lines.push('', `> ${x.note}`);
    if (x.fix) lines.push('', `**Mejora disponible en Tokenforge:** ${x.fix.label}.`);
    lines.push('');
  }
  return lines.join('\n');
}
