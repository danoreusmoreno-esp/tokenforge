// Documentation site generator. Pure: it receives the system, the HTML of every
// variant and the measured anatomy (both captured in the browser from the real
// components) and returns the files of a static site.
import { COMPONENTS, CATEGORIES, SYSTEMS, FEATURED, systemLabel } from './catalog.js';
import { BRAND_FAMILIES, SEMANTIC_FAMILIES } from './tokens.js';
import { componentTokens, family } from './exporters.js';
import { GUIDE, BEHAVIOR, FOUNDATION_GUIDE } from './guide.js';
import { EXAMPLES, reactName } from './react.js';
import { valueLabel } from './labels.js';
import { motionFor, spring, SPRINGS, ENTER, HOVER, TAP, EFFECTS } from './motion.js';
import { slug } from './brands.js';
import { QUESTIONS } from './brief.js';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FAM_ES = { primary: 'Primario', secondary: 'Secundario', tertiary: 'Terciario', neutral: 'Neutro', success: 'Éxito', warning: 'Aviso', critical: 'Crítico', info: 'Info' };
const FOUNDATIONS = [
  ['color', 'Color'], ['typography', 'Tipografía'], ['spacing', 'Espaciado y layout'], ['shape', 'Forma y elevación'], ['motion', 'Movimiento'],
];

// ---------------------------------------------------------------------------
// Measurements → readable values tied to tokens

function rgbToHex(c) {
  const m = /rgba?\(([^)]+)\)/.exec(c || '');
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  if (a === 0) return 'transparent';
  if (a < 1) return null;
  return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
}

/** Lookup tables from values to token names for one system. Values can match several tokens. */
export function tokenIndex(sys) {
  const ap = sys.appearances.light;
  const add = (map, k, v) => { if (!map.has(k)) map.set(k, []); if (!map.get(k).includes(v)) map.get(k).push(v); };
  const color = new Map();
  for (const [k, h] of Object.entries(ap.roles)) add(color, h.toLowerCase(), `--${k}`);
  for (const [fam, ramp] of Object.entries(ap.ramps)) ramp.forEach((h, i) => add(color, h.toLowerCase(), `--color-${fam}-${i + 1}`));
  const space = new Map();
  for (const [k, v] of Object.entries(sys.spacing)) if (v > 0) add(space, v, `--space-${k}`);
  const radius = new Map();
  for (const [k, v] of Object.entries(sys.radius)) add(radius, v, `--radius-${k}`);
  const text = new Map();
  for (const [name, t] of Object.entries(sys.type.desktop)) add(text, t.size, `--text-${name}-size`);
  return { color, space, radius, text };
}

// Which roles fit each property, best first.
const PREFER = {
  bg: [/^--bg-/, /-(solid|subtle)(-hover)?$/, /^--color-/],
  text: [/^--text-/, /-(text|on-solid)$/, /^--color-/],
  border: [/^--border-/, /-(border|solid)$/, /^--color-/],
};

/** Best token for a colour used as a given property; a family (from the background) wins ties. */
function colorToken(idx, hex, kind, family = '') {
  const list = idx.color.get(hex);
  if (!list) return hex;
  if (family) { const own = list.find((t) => t.startsWith(`--${family}-`) && PREFER[kind].slice(0, 2).some((re) => re.test(t))); if (own) return own; }
  for (const re of PREFER[kind]) { const hit = list.find((t) => re.test(t)); if (hit) return hit; }
  return list[0];
}

const px = (n) => `${Math.round(n * 10) / 10} px`;
const many = (map, v) => (map.get(Math.round(v)) ?? []).join(' = ');

/** Human-readable spec items for one measured part. */
export function describePart(p, idx) {
  const out = [];
  const s = p.style;
  const famOf = () => { const h = rgbToHex(s.bg); const t = h && h !== 'transparent' ? colorToken(idx, h, 'bg') : ''; return /^--([a-z0-9-]+?)-(solid|subtle)(-hover)?$/.exec(t)?.[1] ?? ''; };
  if (!p.icon) out.push({ k: 'Tamaño', v: `${Math.round(p.w)} × ${Math.round(p.h)} px` });
  const pads = [s.pt, s.pr, s.pb, s.pl].map((n) => Math.round(n));
  if (pads.some((n) => n > 0)) {
    const sym = pads[0] === pads[2] && pads[1] === pads[3];
    const uniq = [...new Set(pads)];
    const txt = uniq.length === 1 ? px(pads[0]) : sym ? `${pads[0]} × ${pads[1]} px` : pads.join(' ') + ' px';
    const t = (uniq.length === 1 ? [pads[0]] : sym ? [pads[0], pads[1]] : []).map((n) => many(idx.space, n)).filter(Boolean).join(' · ');
    out.push({ k: 'Relleno', v: txt, t });
  }
  if (s.gap > 0) out.push({ k: 'Separación', v: px(s.gap), t: many(idx.space, s.gap) });
  if (s.radius > 0) out.push({ k: 'Radio', v: s.radius >= 999 ? 'píldora' : px(s.radius), t: s.radius >= 999 ? '' : many(idx.radius, s.radius) });
  if (s.bw > 0) {
    const hex = rgbToHex(s.bc);
    out.push({ k: 'Borde', v: px(s.bw), t: hex && hex !== 'transparent' ? colorToken(idx, hex, 'border', famOf()) : '' });
  }
  const bg = rgbToHex(s.bg);
  const bgTok = bg && bg !== 'transparent' ? colorToken(idx, bg, 'bg') : '';
  // The background's family (primary, success…) tells which text and border roles belong with it.
  const fam = /^--([a-z0-9-]+?)-(solid|subtle)(-hover)?$/.exec(bgTok)?.[1] ?? '';
  if (bgTok) out.push({ k: 'Fondo', v: bg, t: bgTok });
  if (p.text) {
    out.push({ k: 'Texto', v: `${px(s.fs)} / ${px(s.lh)} · ${s.fw}`, t: many(idx.text, s.fs) });
    const fg = rgbToHex(s.color);
    if (fg && fg !== 'transparent') out.push({ k: 'Color', v: fg, t: colorToken(idx, fg, 'text', fam) });
  }
  if (p.icon) {
    const fg = rgbToHex(s.color);
    out.push({ k: 'Icono', v: `${Math.round(p.w)} px`, t: fg && fg !== 'transparent' ? colorToken(idx, fg, 'text', fam) : '' });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Page chrome

function layout({ root, title, brand, current, body, nav, fonts, description }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ${esc(brand.name)}</title>
<meta name="description" content="${esc(description ?? `Documentación del sistema de diseño ${brand.name}`)}">
${fonts}
<link rel="stylesheet" href="${root}assets/tokens.css">
<link rel="stylesheet" href="${root}assets/components.css">
<link rel="stylesheet" href="${root}assets/docs.css">
<script>try{var t=localStorage.getItem('doc-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
</head>
<body class="ds doc">
<a class="doc-skip" href="#main">Saltar al contenido</a>
<div class="doc-shell">
${nav(root, current)}
<main id="main" class="doc-main">
${body}
<footer class="doc-foot">${esc(brand.name)} · Documentación generada con Tokenforge el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}. Medidas tomadas del componente real, en escritorio y modo claro.</footer>
</main>
</div>
<script src="${root}assets/docs.js"></script>
</body>
</html>
`;
}

function makeNav(brand, comps, logoFile) {
  return (root, current) => {
    const link = (href, label, id) => `<a href="${root}${href}"${id === current ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
    const groups = CATEGORIES.map((cat) => {
      const list = comps.filter((c) => c.cat === cat.id);
      if (!list.length) return '';
      return `<div class="doc-nav-group"><p>${esc(cat.name)}</p>${list.map((c) => link(`components/${c.id}.html`, c.name, c.id)).join('')}</div>`;
    }).join('');
    return `<aside class="doc-side" aria-label="Navegación de la documentación">
  <div class="doc-brand">
    <a href="${root}index.html" class="doc-brand-link">${logoFile ? `<img src="${root}assets/${logoFile}" alt="">` : '<span class="doc-brand-mark" aria-hidden="true"></span>'}<b>${esc(brand.name)}</b></a>
    <span class="doc-brand-actions">
      <button class="doc-menu" type="button" aria-expanded="false" aria-controls="doc-nav">Menú</button>
      <button class="doc-theme" type="button" aria-label="Cambiar modo claro u oscuro" title="Modo claro u oscuro"><span aria-hidden="true">◐</span></button>
    </span>
  </div>
  <label class="doc-search"><span class="vh">Buscar en la documentación</span><input type="search" placeholder="Buscar…" data-doc-filter></label>
  <nav class="doc-nav" id="doc-nav">
    <div class="doc-nav-group">${link('index.html', 'Inicio', 'index')}</div>
    <div class="doc-nav-group"><p>Foundations</p>${FOUNDATIONS.map(([id, name]) => link(`foundations/${id}.html`, name, `f-${id}`)).join('')}</div>
    ${groups}
  </nav>
</aside>`;
  };
}

const section = (id, title, inner, lead = '') => `<section class="doc-sec" id="${id}" aria-labelledby="h-${id}">
<h2 id="h-${id}">${esc(title)}</h2>${lead ? `<p class="doc-sec-lead">${lead}</p>` : ''}
${inner}
</section>`;

const codeBlock = (code, lang) => `<div class="doc-code"><div class="doc-code-bar"><span>${esc(lang)}</span><button type="button" class="doc-copy">Copiar</button></div><pre><code>${esc(code)}</code></pre></div>`;
const list = (items, cls = '') => `<ul class="doc-list ${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const swatch = (hex, label, sub = '') => `<div class="doc-sw"><span style="background:${hex}"></span><b>${esc(label)}</b><code>${esc(hex)}</code>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;

/** Rough HTML pretty-printer for the HTML tab: one tag per line, indented. */
function prettyHtml(html) {
  let depth = 0;
  const out = [];
  const voids = /^<(br|hr|img|input|meta|link|source|path|circle|line|rect)\b/i;
  for (const raw of html.replace(/>\s*</g, '>\n<').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (/^<\//.test(line)) depth = Math.max(0, depth - 1);
    out.push('  '.repeat(depth) + line);
    if (/^<[a-z]/i.test(line) && !voids.test(line) && !/\/>$/.test(line) && !/^<([a-z0-9-]+)[^>]*>.*<\/\1>$/i.test(line)) depth++;
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Pages

function componentPage(sys, c, cap, idx) {
  const g = GUIDE[c.id] ?? { use: [], avoid: [], a11y: [] };
  const m = motionFor(sys.brand, c.id);
  const sp = SPRINGS[sys.brand.motion] ?? SPRINGS.standard;
  const s = spring(sp.bounce, sp.duration);
  const tokens = componentTokens(sys, c.id);
  const cat = CATEGORIES.find((x) => x.id === c.cat)?.name ?? '';
  const name = reactName(c.id);

  const examples = (cap?.variants ?? []).map((x) => `<figure class="doc-stage"><div class="doc-stage-in">${x.html}</div><figcaption>${esc(valueLabel(x.v))}<code>variant="${esc(x.v)}"</code></figcaption></figure>`).join('') || '<p class="doc-muted">Sin ejemplos.</p>';

  const a = cap?.anatomy;
  // Enlarge small components (up to 2×) and fit wide ones in the column; pins never overlap.
  // Rounded once and used for both the component's zoom and the overlay, so they always line up.
  const Z = a ? Math.round(Math.max(0.5, Math.min(2, 720 / Math.max(a.w, 1), 520 / Math.max(a.h, 1))) * 100) / 100 : 1;
  const pins = [];
  if (a) for (const p of a.parts) {
    let x = p.x * Z, y = p.y * Z;
    while (pins.some((q) => Math.abs(q.x - x) < 22 && Math.abs(q.y - y) < 22)) x += 22;
    pins.push({ x, y });
  }
  const r1 = (n) => Math.round(n * 10) / 10;
  const anatomy = a && a.parts.length ? `<div class="doc-anat">
  <figure class="doc-anat-fig"><div class="doc-anat-scroll"><div class="doc-anat-in" style="width:${Math.ceil(a.w * Z)}px;height:${Math.ceil(a.h * Z)}px"><div class="doc-anat-comp" style="zoom:${Z};width:${Math.ceil(a.w)}px">${a.html}</div>
  ${a.parts.map((p, i) => `<span class="doc-box" style="left:${r1(p.x * Z)}px;top:${r1(p.y * Z)}px;width:${r1(p.w * Z)}px;height:${r1(p.h * Z)}px" aria-hidden="true"></span><span class="doc-pin" style="left:${r1(pins[i].x)}px;top:${r1(pins[i].y)}px" aria-hidden="true">${i + 1}</span>`).join('')}
  </div></div><figcaption>Anatomía de «${esc(c.name)}» (${esc(valueLabel(a.v))})${Z !== 1 ? `, ampliada al ${Math.round(Z * 100)} %` : ''}. Los números corresponden a la tabla; las medidas son a tamaño real.</figcaption></figure>
  <table class="doc-spec"><thead><tr><th scope="col">#</th><th scope="col">Parte</th><th scope="col">Medidas y tokens</th></tr></thead><tbody>
  ${a.parts.map((p, i) => `<tr><td><span class="doc-pin static">${i + 1}</span></td><th scope="row">${esc(p.name)}</th><td>${describePart(p, idx).map((d) => `<span class="doc-measure"><em>${esc(d.k)}</em> ${esc(d.v)}${d.t ? ` <code>${esc(d.t)}</code>` : ''}</span>`).join('')}</td></tr>`).join('')}
  </tbody></table>
</div>` : '<p class="doc-muted">No se pudo medir este componente.</p>';

  const behavior = `${list(BEHAVIOR[c.id] ?? [])}
<h3>Estados</h3>
<div class="doc-chips">${c.states.map((st) => `<span class="doc-chip">${esc(valueLabel(st))}</span>`).join('')}</div>
<h3>Movimiento</h3>
<table class="doc-table"><tbody>
<tr><th scope="row">Entrada</th><td>${esc(ENTER[m.enter] ?? m.enter)}</td></tr>
<tr><th scope="row">Hover</th><td>${esc(HOVER[m.hover] ?? m.hover)}</td></tr>
<tr><th scope="row">Pulsación</th><td>${esc(TAP[m.tap] ?? m.tap)}</td></tr>
<tr><th scope="row">Efecto propio</th><td>${esc(EFFECTS[m.effect] ?? m.effect)}</td></tr>
<tr><th scope="row">Muelle del sistema</th><td>«${esc(sys.brand.motion)}»: rebote ${sp.bounce}, ${s.ms} ms · <code>--spring</code></td></tr>
<tr><th scope="row">Movimiento reducido</th><td>Con <code>prefers-reduced-motion</code> los cambios son instantáneos.</td></tr>
</tbody></table>`;

  const usage = `<div class="doc-dodont">
<div class="doc-do"><h3>Úsalo para</h3>${list(g.use)}</div>
<div class="doc-dont"><h3>Evítalo</h3>${list(g.avoid)}</div>
</div>`;

  const roles = a ? [...new Set(a.parts.flatMap((p) => describePart(p, idx)).map((d) => d.t).filter((t) => t && t.startsWith('--') && !t.startsWith('--space') && !t.startsWith('--text') && !t.startsWith('--radius')))] : [];
  const tokenRows = Object.entries(tokens);
  const tokensHtml = `${tokenRows.length ? `<h3>Tokens del componente</h3><table class="doc-table"><thead><tr><th scope="col">Token</th><th scope="col">Valor</th></tr></thead><tbody>${tokenRows.map(([k, v]) => `<tr><td><code>--${esc(c.id)}-${esc(k)}</code></td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>` : '<p class="doc-muted">Sin tokens propios: usa los tokens globales.</p>'}
${roles.length ? `<h3>Roles de color que usa</h3><div class="doc-chips">${roles.map((r) => `<code class="doc-chip">${esc(r)}</code>`).join('')}</div>` : ''}`;

  const code = `<h3>React</h3>${codeBlock(`import { ${name} } from './design-system';\n\n${EXAMPLES[c.id] ?? ''}`, 'TSX')}
${a ? `<h3>HTML</h3><p class="doc-muted">Marcado que genera el componente, con sus clases. Úsalo en cualquier stack cargando tokens.css y components.css dentro de un contenedor <code>.ds</code>.</p>${codeBlock(prettyHtml(a.html), 'HTML')}` : ''}`;

  const refs = `<table class="doc-table"><thead><tr><th scope="col">Sistema</th><th scope="col">Nombre</th></tr></thead><tbody>
${FEATURED.map((k) => `<tr><td><a href="${esc(SYSTEMS[k].url)}">${esc(systemLabel(k))}</a></td><td>${c.names[k] ? esc(c.names[k]) : '<span class="doc-muted">—</span>'}</td></tr>`).join('')}
</tbody></table>`;

  const toc = [['ejemplos', 'Ejemplos'], ['anatomia', 'Anatomía y medidas'], ['comportamiento', 'Comportamiento'], ['uso', 'Uso'], ['accesibilidad', 'Accesibilidad'], ['tokens', 'Tokens'], ['codigo', 'Código'], ['referencias', 'Referencias']];
  return `<header class="doc-hd">
<p class="doc-eyebrow">${esc(cat)}</p>
<h1>${esc(c.name)}</h1>
<p class="doc-lead">${esc(c.desc)}</p>
<div class="doc-meta"><code>&lt;${name} /&gt;</code><span>En ${c.refs.length} de ${FEATURED.length} sistemas de referencia</span></div>
</header>
<nav class="doc-toc" aria-label="En esta página">${toc.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('')}</nav>
${section('ejemplos', 'Ejemplos', `<div class="doc-stages">${examples}</div>`)}
${section('anatomia', 'Anatomía y medidas', anatomy, 'Cada parte con sus medidas y el token del que salen. Si cambias un token, el componente y esta tabla cambian con él.')}
${section('comportamiento', 'Comportamiento', behavior)}
${section('uso', 'Uso', usage)}
${section('accesibilidad', 'Accesibilidad', list(g.a11y))}
${section('tokens', 'Tokens', tokensHtml)}
${section('codigo', 'Código', code)}
${section('referencias', 'En otros sistemas de diseño', refs)}`;
}

function colorPage(sys) {
  const L = sys.appearances.light, D = sys.appearances.dark;
  const fams = [...BRAND_FAMILIES, 'neutral', ...(sys.semantics ?? SEMANTIC_FAMILIES)];
  const label = (f) => FAM_ES[f] ?? (sys.custom ?? []).find((c) => c.key === f)?.name ?? f;
  const keys = `<div class="doc-grid">${fams.map((f) => `<div class="doc-card"><div class="doc-keypair"><span style="background:${L.ramps[f][8]}"></span><span style="background:${D.ramps[f][8]}"></span></div><b>${esc(label(f))}</b><small><code>${L.ramps[f][8]}</code> claro · <code>${D.ramps[f][8]}</code> oscuro</small></div>`).join('')}</div>`;
  const ramp = (ap) => `<div class="doc-ramps">${fams.map((f) => `<div class="doc-ramp"><span>${esc(label(f))}</span>${ap.ramps[f].map((h, i) => `<i style="background:${h}" title="--color-${f}-${i + 1} ${h}"></i>`).join('')}</div>`).join('')}</div>`;
  const roles = `<table class="doc-table"><thead><tr><th scope="col">Rol</th><th scope="col">Claro</th><th scope="col">Oscuro</th></tr></thead><tbody>${Object.keys(L.roles).map((k) => `<tr><td><code>--${k}</code></td><td><span class="doc-dot" style="background:${L.roles[k]}"></span>${L.roles[k]}</td><td><span class="doc-dot" style="background:${D.roles[k]}"></span>${D.roles[k]}</td></tr>`).join('')}</tbody></table>`;
  const audit = `<table class="doc-table"><thead><tr><th scope="col">Par</th><th scope="col">Modo</th><th scope="col">WCAG</th><th scope="col">APCA</th></tr></thead><tbody>${sys.audit.map((r) => `<tr><td>${esc(r.label)}<br><small><code>--${r.fg}</code> sobre <code>--${r.bg}</code></small></td><td>${r.appearance === 'light' ? 'Claro' : 'Oscuro'}</td><td>${r.ratio.toFixed(2)}:1 ${r.wcagPass ? '✓' : '✗'}</td><td>Lc ${Math.round(r.lc)} ${r.apcaPass ? '✓' : '✗'}</td></tr>`).join('')}</tbody></table>`;
  return `<header class="doc-hd"><p class="doc-eyebrow">Foundations</p><h1>Color</h1><p class="doc-lead">Colores clave, rampas de 12 pasos y roles semánticos, en claro y en oscuro.</p></header>
${section('reglas', 'Reglas', list(FOUNDATION_GUIDE.color))}
${section('clave', 'Colores clave', keys, 'Mitad izquierda: modo claro. Mitad derecha: modo oscuro.')}
${section('rampas-claro', 'Rampas · claro', ramp(L))}
${section('rampas-oscuro', 'Rampas · oscuro', ramp(D))}
${section('roles', 'Roles', roles, 'Usa siempre el rol: el mismo nombre toma el valor correcto en cada modo.')}
${section('contraste', 'Contraste', audit, 'Pares clave comprobados con WCAG 2 y APCA. Texto: 4,5:1 (WCAG) y Lc 60 (APCA). Elementos de interfaz: 3:1.')}`;
}

function typographyPage(sys) {
  const rows = Object.entries(sys.type.desktop).reverse();
  const sample = (name) => (name === 'display' || name.startsWith('h') ? 'Diseña una vez' : 'El texto mantiene su ritmo en cada pantalla.');
  return `<header class="doc-hd"><p class="doc-eyebrow">Foundations</p><h1>Tipografía</h1><p class="doc-lead">Familias, escala y alturas de línea en base 4.</p></header>
${section('reglas', 'Reglas', list(FOUNDATION_GUIDE.typography))}
${section('familias', 'Familias', `<div class="doc-grid">${[['Títulos', sys.fonts.heading, 'var(--font-heading)'], ['Texto', sys.fonts.body, 'var(--font-body)'], ['Código', sys.fonts.mono, 'var(--font-mono)']].map(([r, f, v]) => `<div class="doc-card"><span class="doc-aa" style="font-family:${v}">Aa</span><b>${esc(f)}</b><small>${r} · <code>${v.slice(4, -1)}</code></small></div>`).join('')}</div>`)}
${section('escala', 'Escala', `<div class="doc-type">${rows.map(([name, t]) => `<div class="doc-type-row"><div class="doc-type-meta"><code>--text-${name}</code><small>${t.size}/${t.lineHeightPx} px · ${t.weight}</small><small>Tablet ${sys.type.tablet[name].size} · Móvil ${sys.type.mobile[name].size}</small></div><div class="doc-type-sample t-${name === 'body' || name === 'lead' || name === 'small' || name === 'caption' ? name : name}" style="font-family:${name === 'display' || name.startsWith('h') ? 'var(--font-heading)' : 'var(--font-body)'};font-size:${t.size}px;line-height:${t.lineHeightPx}px;font-weight:${t.weight};letter-spacing:${t.tracking}em">${sample(name)}</div></div>`).join('')}</div>`)}`;
}

function spacingPage(sys) {
  const scale = Object.entries(sys.spacing).filter(([, v]) => v > 0);
  const vps = ['desktop', 'tablet', 'mobile'];
  const VP = { desktop: 'Escritorio', tablet: 'Tablet', mobile: 'Móvil' };
  return `<header class="doc-hd"><p class="doc-eyebrow">Foundations</p><h1>Espaciado y layout</h1><p class="doc-lead">Base de ${sys.spacingUnit} px. Densidad «${esc(sys.brand.spacing)}».</p></header>
${section('reglas', 'Reglas', list(FOUNDATION_GUIDE.spacing))}
${section('escala', 'Escala', `<div class="doc-space">${scale.map(([k, v]) => `<div class="doc-space-row"><code>--space-${k}</code><span>${v} px</span><i style="width:${v}px"></i></div>`).join('')}</div>`)}
${section('layout', 'Layout por pantalla', `<table class="doc-table"><thead><tr><th scope="col">Token</th>${vps.map((v) => `<th scope="col">${VP[v]}</th>`).join('')}</tr></thead><tbody>${Object.keys(sys.layout.desktop).map((k) => `<tr><td><code>--${k}</code></td>${vps.map((v) => `<td>${sys.layout[v][k]} px</td>`).join('')}</tr>`).join('')}</tbody></table>`)}`;
}

function shapePage(sys) {
  const R = { boxes: 'Cajas: tarjetas, diálogos, paneles', fields: 'Campos: inputs, botones', selectors: 'Selectores: chips, pestañas, casillas' };
  const sh = sys.appearances.light.shadow;
  return `<header class="doc-hd"><p class="doc-eyebrow">Foundations</p><h1>Forma y elevación</h1><p class="doc-lead">Radios y sombras del sistema.</p></header>
${section('reglas', 'Reglas', list(FOUNDATION_GUIDE.shape))}
${section('radios', 'Radios', `<div class="doc-grid">${Object.entries(sys.radius).map(([k, v]) => `<div class="doc-card"><span class="doc-shape" style="border-radius:${Math.min(v, 48)}px"></span><b><code>--radius-${k}</code> · ${v >= 999 ? 'píldora' : v + ' px'}</b><small>${esc(R[k])}</small></div>`).join('')}</div>`)}
${section('sombras', 'Sombras', `<div class="doc-grid">${Object.entries(sh).map(([k, v]) => `<div class="doc-card"><span class="doc-shape" style="box-shadow:var(--shadow-${k});border-radius:var(--radius-boxes)"></span><b><code>--shadow-${k}</code></b><small>${esc(v)}</small></div>`).join('')}</div>`)}`;
}

function motionPage(sys) {
  const p = SPRINGS[sys.brand.motion] ?? SPRINGS.standard;
  const s = spring(p.bounce, p.duration);
  let curve = '';
  if (s.ms) {
    const pts = s.easing.slice(7, -1).split(', ').map(Number);
    const W = 520, H = 160, top = 24, base = H - 24;
    const y = (v) => base - (base - top) * (v / 1.2);
    const d = pts.map((v, i) => `${i ? 'L' : 'M'}${((i / (pts.length - 1)) * W).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    curve = `<svg class="doc-curve" viewBox="0 0 ${W} ${H}" role="img" aria-label="Curva del muelle"><line x1="0" x2="${W}" y1="${y(1)}" y2="${y(1)}" class="t"/><path d="${d}"/></svg>`;
  }
  return `<header class="doc-hd"><p class="doc-eyebrow">Foundations</p><h1>Movimiento</h1><p class="doc-lead">Duraciones, curva y muelle «${esc(sys.brand.motion)}».</p></header>
${section('reglas', 'Reglas', list(FOUNDATION_GUIDE.motion))}
${section('tokens', 'Tokens', `<table class="doc-table"><tbody>
<tr><td><code>--duration-fast</code></td><td>${sys.motion.fast} ms</td><td>Hover, cambios pequeños</td></tr>
<tr><td><code>--duration-base</code></td><td>${sys.motion.base} ms</td><td>Abrir menús y paneles</td></tr>
<tr><td><code>--duration-slow</code></td><td>${sys.motion.slow} ms</td><td>Transiciones grandes</td></tr>
<tr><td><code>--ease-standard</code></td><td colspan="2"><code>${esc(sys.motion.ease)}</code></td></tr>
<tr><td><code>--spring</code></td><td colspan="2">Rebote ${p.bounce} · ${s.ms} ms (CSS <code>linear()</code>)</td></tr>
</tbody></table>`)}
${curve ? section('muelle', 'Curva del muelle', curve) : ''}`;
}

function indexPage(sys, comps, subs) {
  const b = sys.brand;
  const brief = b.brief ?? {};
  const opt = (key, id) => QUESTIONS[key]?.find((q) => q.id === id);
  const cards = (key) => (brief[key] ?? []).map((id) => opt(key, id)).filter(Boolean)
    .map((q) => `<div class="doc-card"><b>${esc(q.label)}</b>${q.hint ? `<small>${esc(q.hint)}</small>` : ''}</div>`).join('');
  const principles = cards('principles') ? `<div class="doc-grid">${cards('principles')}</div>` : '<p class="doc-muted">Define los principios en Bases y aparecerán aquí.</p>';
  const goals = cards('goals');
  const counts = CATEGORIES.map((c) => [c, comps.filter((x) => x.cat === c.id)]).filter(([, l]) => l.length);
  return `<header class="doc-hd doc-home">
<p class="doc-eyebrow">Sistema de diseño</p>
<h1>${esc(b.name)}</h1>
<p class="doc-lead">${comps.length} componentes, 5 foundations y ${subs.length + 1} ${subs.length ? 'marcas' : 'marca'}. Todo sale de los mismos tokens: lo que ves aquí es lo que reciben diseño y código.</p>
</header>
${section('empezar', 'Empezar', `<div class="doc-dodont">
<div class="doc-card"><h3>Diseño</h3>${list(['Importa figma-tokens.json con Tokens Studio: crea las Variables con modo claro y oscuro.', 'Usa los roles de color, no los pasos de la rampa.'])}</div>
<div class="doc-card"><h3>Desarrollo</h3>${list(['Carga tokens.css y components.css.', 'En React, copia el paquete y envuelve la app en DesignSystemProvider.'])}</div>
</div>
${codeBlock(`import './design-system/tokens.css';\nimport './design-system/components.css';\nimport { DesignSystemProvider } from './design-system';\n\n<DesignSystemProvider theme="light">\n  <App />\n</DesignSystemProvider>`, 'TSX')}`)}
${section('principios', 'Principios', principles)}
${goals ? section('problemas', 'Qué resuelve', `<div class="doc-grid">${goals}</div>`) : ''}
${section('foundations', 'Foundations', `<div class="doc-grid">${FOUNDATIONS.map(([id, name]) => `<a class="doc-card doc-link-card" href="foundations/${id}.html"><b>${name}</b><small>${esc(FOUNDATION_GUIDE[id][0])}</small></a>`).join('')}</div>`)}
${section('componentes', 'Componentes', counts.map(([cat, l]) => `<h3>${esc(cat.name)}</h3><div class="doc-grid">${l.map((c) => `<a class="doc-card doc-link-card" href="components/${c.id}.html"><b>${esc(c.name)}</b><small>${esc(c.desc)}</small></a>`).join('')}</div>`).join(''))}
${subs.length ? section('marcas', 'Marcas', `<table class="doc-table"><thead><tr><th scope="col">Marca</th><th scope="col">Activar con</th></tr></thead><tbody><tr><td>${esc(b.name)} (principal)</td><td><code>:root</code></td></tr>${subs.map(({ sub, slug: s }) => `<tr><td>${esc(sub.name)}</td><td><code>data-brand="${s}"</code></td></tr>`).join('')}</tbody></table>`) : ''}`;
}

// ---------------------------------------------------------------------------
// Assets

const DOCS_CSS = `/* Documentation chrome. Painted with the system's own tokens. */
html { scroll-behavior: smooth; }
body.doc { margin: 0; min-height: 100vh; }
.doc *:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.doc .vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.doc-skip { position: absolute; left: 16px; top: -48px; z-index: 10; padding: 8px 16px; border-radius: var(--radius-fields); background: var(--primary-solid); color: var(--primary-on-solid) !important; text-decoration: none !important; }
.doc-skip:focus { top: 16px; }
.doc-shell { display: grid; grid-template-columns: 272px minmax(0, 1fr); min-height: 100vh; }
.doc-side { position: sticky; top: 0; height: 100vh; overflow: auto; padding: 24px 16px; border-right: 1px solid var(--border-subtle); background: var(--bg-subtle); display: flex; flex-direction: column; gap: 16px; }
.doc-brand { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.doc-brand-link { display: flex; align-items: center; gap: 12px; color: var(--text-primary) !important; text-decoration: none !important; min-width: 0; }
.doc-brand-link img { height: 28px; width: auto; max-width: 120px; }
.doc-brand-mark { width: 28px; height: 28px; border-radius: 8px; background: var(--primary-solid); flex: none; }
.doc-brand-actions { display: flex; gap: 8px; align-items: center; }
.doc-menu { all: unset; display: none; padding: 0 16px; height: 36px; border-radius: 999px; background: var(--bg-muted); font-size: var(--text-small-size); font-weight: 600; cursor: pointer; }
.doc-theme { all: unset; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: var(--text-secondary); background: var(--bg-muted); }
.doc-theme:hover { background: var(--bg-hover); }
.doc-search input { width: 100%; box-sizing: border-box; height: 36px; padding: 0 12px; border-radius: var(--radius-fields); border: 1px solid var(--border-default); background: var(--bg-surface); color: var(--text-primary); font: inherit; font-size: var(--text-small-size); }
.doc-nav { display: flex; flex-direction: column; gap: 16px; }
.doc-nav-group { display: flex; flex-direction: column; gap: 2px; }
.doc-nav-group p { margin: 0 0 4px; padding: 0 8px; font-size: var(--text-caption-size); font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--text-tertiary); }
.doc-nav a { display: block; padding: 6px 8px; border-radius: var(--radius-selectors); color: var(--text-secondary); text-decoration: none; font-size: var(--text-small-size); }
.doc-nav a:hover { background: var(--bg-hover); color: var(--text-primary); }
.doc-nav a[aria-current="page"] { background: var(--secondary-subtle); color: var(--secondary-text); font-weight: 600; }
.doc-nav a[hidden] { display: none; }
.doc-main { padding: 48px clamp(16px, 5vw, 64px) 64px; max-width: 1040px; min-width: 0; }
.doc-hd { display: flex; flex-direction: column; gap: 12px; padding-bottom: 24px; }
.doc-hd h1 { font: var(--text-h1-weight) var(--text-h1-size)/var(--text-h1-line-height) var(--font-heading); letter-spacing: var(--text-h1-tracking); }
.doc-home h1 { font: var(--text-display-weight) clamp(var(--text-h1-size), 6vw, var(--text-display-size))/1.05 var(--font-heading); letter-spacing: var(--text-display-tracking); }
.doc-eyebrow { font-size: var(--text-caption-size); font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--primary-text); }
.doc-lead { font-size: var(--text-lead-size); line-height: var(--text-lead-line-height); color: var(--text-secondary); max-width: 64ch; }
.doc-meta { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: var(--text-small-size); color: var(--text-tertiary); }
.doc code { font-family: var(--font-mono); font-size: .88em; background: var(--bg-muted); padding: 1px 6px; border-radius: 4px; color: var(--text-primary); }
.doc-toc { position: sticky; top: 0; z-index: 5; display: flex; gap: 4px; flex-wrap: wrap; padding: 12px 0; margin-bottom: 8px; background: var(--bg-canvas); border-bottom: 1px solid var(--border-subtle); }
.doc-toc a { padding: 4px 12px; border-radius: 999px; font-size: var(--text-small-size); color: var(--text-secondary); text-decoration: none; }
.doc-toc a:hover { background: var(--bg-hover); color: var(--text-primary); }
.doc-sec { padding: 40px 0 8px; scroll-margin-top: 64px; display: flex; flex-direction: column; gap: 16px; }
.doc-sec h2 { font: var(--text-h2-weight) var(--text-h2-size)/var(--text-h2-line-height) var(--font-heading); letter-spacing: var(--text-h2-tracking); }
.doc-sec h3 { font: var(--text-h4-weight) var(--text-h4-size)/var(--text-h4-line-height) var(--font-heading); margin-top: 8px; }
.doc-sec-lead, .doc-muted { color: var(--text-secondary); font-size: var(--text-small-size); }
.doc-list { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
.doc-list li { line-height: var(--text-body-line-height); }
.doc-stages { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr)); gap: 16px; }
.doc-stage { margin: 0; border: 1px solid var(--border-subtle); border-radius: var(--radius-boxes); overflow: hidden; background: var(--bg-surface); display: flex; flex-direction: column; }
.doc-stage-in { padding: 32px 24px; display: flex; align-items: center; justify-content: center; min-height: 140px; overflow: auto; background-image: radial-gradient(var(--border-subtle) 1px, transparent 1px); background-size: 16px 16px; }
.doc-stage-in > * { max-width: 100%; }
.doc-stage figcaption { display: flex; justify-content: space-between; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border-subtle); font-size: var(--text-small-size); color: var(--text-secondary); }
.doc-anat { display: flex; flex-direction: column; gap: 16px; }
.doc-anat-fig { margin: 0; border: 1px solid var(--border-subtle); border-radius: var(--radius-boxes); background: var(--bg-surface); overflow: hidden; }
.doc-anat-scroll { overflow: auto; padding: 40px; display: flex; justify-content: center; background-image: radial-gradient(var(--border-subtle) 1px, transparent 1px); background-size: 16px 16px; }
.doc-anat-in { position: relative; flex: none; }
.doc-anat-comp > :first-child { margin: 0; }
.doc-anat-fig figcaption { padding: 12px 16px; border-top: 1px solid var(--border-subtle); font-size: var(--text-small-size); color: var(--text-secondary); }
.doc-box { position: absolute; border: 1px dashed var(--critical-solid); pointer-events: none; border-radius: 2px; }
.doc-pin { position: absolute; transform: translate(-50%, -50%); min-width: 20px; height: 20px; padding: 0 4px; box-sizing: border-box; border-radius: 999px; background: var(--critical-solid); color: var(--critical-on-solid); font: 600 11px/20px var(--font-body); text-align: center; pointer-events: none; z-index: 2; }
.doc-pin.static { position: static; transform: none; display: inline-block; }
.doc-spec, .doc-table { width: 100%; border-collapse: collapse; font-size: var(--text-small-size); }
.doc-spec th, .doc-spec td, .doc-table th, .doc-table td { text-align: left; vertical-align: top; padding: 12px; border-bottom: 1px solid var(--border-subtle); }
.doc-spec thead th, .doc-table thead th { font-size: var(--text-caption-size); color: var(--text-tertiary); font-weight: 600; background: var(--bg-subtle); }
.doc-spec tbody th { font-weight: 600; white-space: nowrap; }
.doc-measure { display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 4px; margin: 0 16px 6px 0; }
.doc-measure em { font-style: normal; color: var(--text-tertiary); }
.doc-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.doc-chip { display: inline-flex; align-items: center; height: 28px; padding: 0 12px; border-radius: 999px; background: var(--bg-muted); font-size: var(--text-small-size); }
.doc-dodont { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 16px; }
.doc-do, .doc-dont { padding: 20px; border-radius: var(--radius-boxes); border-top: 4px solid; background: var(--bg-surface); }
.doc-do { border-color: var(--success-solid); }
.doc-dont { border-color: var(--critical-solid); }
.doc-code { border-radius: var(--radius-boxes); overflow: hidden; background: var(--color-neutral-12); }
.doc-code-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px 8px 16px; color: var(--color-neutral-8); font-size: var(--text-caption-size); }
.doc-copy { all: unset; cursor: pointer; padding: 4px 12px; border-radius: 999px; color: var(--color-neutral-2); background: color-mix(in srgb, var(--color-neutral-1) 12%, transparent); }
.doc-code pre { margin: 0; padding: 0 16px 16px; overflow: auto; max-height: 480px; font-family: var(--font-mono); font-size: var(--text-caption-size); line-height: 1.6; }
.doc-code code { background: none; padding: 0; color: var(--color-neutral-2); font-size: inherit; line-height: inherit; }
.doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: 12px; }
.doc-card { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid var(--border-subtle); border-radius: var(--radius-boxes); background: var(--bg-surface); }
.doc-card small { color: var(--text-secondary); font-size: var(--text-small-size); line-height: var(--text-small-line-height); }
.doc-link-card { text-decoration: none !important; color: var(--text-primary) !important; transition: border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard); }
.doc-link-card:hover { border-color: var(--border-default); box-shadow: var(--shadow-md); }
.doc-keypair { display: grid; grid-template-columns: 1fr 1fr; height: 72px; border-radius: var(--radius-fields); overflow: hidden; }
.doc-ramps { display: flex; flex-direction: column; gap: 4px; overflow-x: auto; }
.doc-ramp { display: grid; grid-template-columns: 96px repeat(12, minmax(28px, 1fr)); gap: 4px; align-items: center; font-size: var(--text-small-size); }
.doc-ramp i { height: 32px; border-radius: 6px; }
.doc-dot { display: inline-block; width: 14px; height: 14px; border-radius: 4px; margin-right: 8px; vertical-align: -2px; box-shadow: inset 0 0 0 1px rgba(127,127,127,.3); }
.doc-aa { font-size: 48px; line-height: 1; }
.doc-type { display: flex; flex-direction: column; }
.doc-type-row { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 24px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-subtle); }
.doc-type-meta { display: flex; flex-direction: column; gap: 4px; }
.doc-type-meta small { color: var(--text-tertiary); font-size: var(--text-caption-size); }
.doc-type-sample { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.doc-space { display: flex; flex-direction: column; gap: 8px; }
.doc-space-row { display: grid; grid-template-columns: 120px 64px 1fr; align-items: center; gap: 12px; font-size: var(--text-small-size); }
.doc-space-row i { display: block; height: 16px; border-radius: 4px; background: var(--primary-subtle); box-shadow: inset 0 0 0 1px var(--primary-border); }
.doc-shape { display: block; height: 72px; background: var(--bg-muted); border: 2px solid var(--primary-solid); }
.doc-curve { width: 100%; max-width: 560px; height: auto; }
.doc-curve path { fill: none; stroke: var(--primary-solid); stroke-width: 3; }
.doc-curve .t { stroke: var(--border-default); stroke-dasharray: 4 4; }
.doc-foot { margin-top: 64px; padding-top: 24px; border-top: 1px solid var(--border-subtle); font-size: var(--text-caption-size); color: var(--text-tertiary); }
@media (max-width: 860px) {
  .doc-shell { grid-template-columns: minmax(0, 1fr); }
  .doc-side { position: static; height: auto; max-height: none; border-right: 0; border-bottom: 1px solid var(--border-subtle); }
  .doc-menu { display: inline-flex; align-items: center; }
  .doc-nav, .doc-search { display: none; }
  .doc-side.open .doc-nav { display: flex; }
  .doc-side.open .doc-search { display: block; }
  .doc-main { padding-top: 32px; }
  .doc-type-row { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .doc-anat-scroll { padding: 24px; justify-content: flex-start; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
`;

const DOCS_JS = `// Documentation helpers: theme toggle, navigation filter, copy buttons.
(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.doc-theme');
  if (btn) btn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('doc-theme', next); } catch (e) {}
  });
  var menu = document.querySelector('.doc-menu');
  if (menu) menu.addEventListener('click', function () {
    var side = document.querySelector('.doc-side');
    var open = side.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  var filter = document.querySelector('[data-doc-filter]');
  if (filter) filter.addEventListener('input', function () {
    var q = filter.value.trim().toLowerCase();
    document.querySelectorAll('.doc-nav a').forEach(function (a) { a.hidden = q && a.textContent.toLowerCase().indexOf(q) < 0; });
  });
  document.querySelectorAll('.doc-copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var code = b.closest('.doc-code').querySelector('code').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(function () {
        b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar'; }, 1500);
      }, function () { b.textContent = 'Selecciona y copia'; });
    });
  });
})();
`;

function fontLinks(sys, customNames) {
  const fams = [...new Set([sys.fonts.body, sys.fonts.heading, sys.fonts.mono])].filter((f) => f && !customNames.has(f));
  if (!fams.length) return '';
  const q = fams.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`).join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${q}&display=swap">`;
}

/**
 * The documentation site as files. text files have `text`; binary assets carry `dataUrl`.
 * captures: { [id]: { variants: [{ v, html }], anatomy: { v, w, h, html, parts: [{ name, x, y, w, h, text, icon, style }] } } }
 */
export function toDocsSite(sys0, { captures = {}, tokensCss = '', componentsCss = '', assets = [] } = {}) {
  const { master, m: sys, subs } = family(sys0);
  const comps = COMPONENTS.filter((c) => (master.components ?? []).includes(c.id));
  const idx = tokenIndex(sys);
  const logo = assets.find((a) => a.kind === 'Logo' && a.name === master.name);
  const nav = makeNav(master, comps, logo?.file);
  const fonts = fontLinks(sys, new Set((master.customFonts ?? []).map((f) => f.name)));
  const page = (file, title, current, body, description) => ({
    file,
    text: layout({ root: file.includes('/') ? '../' : '', title, brand: master, current, body, nav, fonts, description }),
  });
  const files = [
    page('index.html', 'Inicio', 'index', indexPage(sys, comps, subs)),
    page('foundations/color.html', 'Color', 'f-color', colorPage(sys)),
    page('foundations/typography.html', 'Tipografía', 'f-typography', typographyPage(sys)),
    page('foundations/spacing.html', 'Espaciado y layout', 'f-spacing', spacingPage(sys)),
    page('foundations/shape.html', 'Forma y elevación', 'f-shape', shapePage(sys)),
    page('foundations/motion.html', 'Movimiento', 'f-motion', motionPage(sys)),
    ...comps.map((c) => page(`components/${c.id}.html`, c.name, c.id, componentPage(sys, c, captures[c.id], idx), c.desc)),
    { file: 'assets/tokens.css', text: tokensCss },
    { file: 'assets/components.css', text: componentsCss },
    { file: 'assets/docs.css', text: DOCS_CSS },
    { file: 'assets/docs.js', text: DOCS_JS },
    ...assets.map((a) => ({ file: `assets/${a.file}`, dataUrl: a.dataUrl })),
  ];
  return { name: `${slug(master.name)}-docs`, files };
}
