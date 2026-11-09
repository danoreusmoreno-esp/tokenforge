import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EXPORTS, brandAssets } from '../engine/exporters.js';
import { toReactPackage } from '../engine/react.js';
import { zip } from '../engine/zip.js';
import { slug } from '../engine/brands.js';
import dsCss from '../ds.css?raw';
import { toDocsSite } from '../engine/docs.js';
import DocsCapture from '../components/DocsCapture.jsx';
import { Icon } from '../components/Icons.jsx';
import { encodeBrand } from '../store.js';

// The hosted single-file build runs in a sandbox that blocks downloads and hash links.
const HOSTED = import.meta.env.MODE === 'single';

function download(name, data, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// What each file is for, in one line (so nobody has to know the formats beforehand).
const WHY = {
  css: 'Variables CSS con claro, oscuro, móvil, submarcas y movimiento. Lo necesita cualquier web.',
  json: 'Formato estándar W3C para pipelines como Style Dictionary o para otras herramientas.',
  figma: 'Para Figma: impórtalo con el plugin Tokens Studio y se crean las Variables con modos.',
  tailwind: 'Configuración de Tailwind que apunta a tus variables CSS.',
  motion: 'Presets de movimiento para la librería Motion en React.',
  agents: 'Guía para agentes de IA (Claude Code, Cursor…) para que usen tus tokens y no inventen.',
  brief: 'Objetivos, principios y hoja de ruta para compartir con el equipo.',
  readme: 'Índice de los archivos y cómo usarlos.',
  changes: 'Qué ha cambiado desde que importaste tu sistema: tokens añadidos, cambiados y eliminados, en claro y en oscuro. Compártelo con el equipo en cada versión.',
  docs: 'Sitio web de documentación con tu marca: foundations, y por cada componente ejemplos, anatomía con medidas, comportamiento, uso, accesibilidad, tokens y código. Es HTML estático: publícalo en GitHub Pages, Netlify o tu intranet.',
  react: 'Componentes React con TypeScript, uno por cada componente de tu sistema, con sus estilos y tus tokens. Copia la carpeta en tu app y envuélvela en DesignSystemProvider.',
};

/** Files to start with, from the stack chosen in Bases. */
function recommended(brand) {
  const stack = new Set(brand.brief?.stack ?? []);
  const ids = new Set(['css', 'figma', 'agents']);
  if (stack.has('tailwind')) ids.add('tailwind');
  if (stack.has('react')) { ids.add('motion'); ids.add('react'); }
  if (stack.has('swiftui') || stack.has('compose') || stack.has('angular') || stack.has('vue') || stack.has('svelte')) ids.add('json');
  if (brand.brief?.done) ids.add('brief');
  return ids;
}

export default function Code({ sys, brand, go }) {
  const rec = recommended(brand);
  const [tab, setTab] = useState('css');
  const [copied, setCopied] = useState('');
  const files = useMemo(() => EXPORTS.filter((e) => !e.when || e.when(sys)).map((e) => ({ ...e, text: e.fn(sys) })), [sys]);
  const pkg = useMemo(() => toReactPackage(sys, { componentsCss: dsCss, tokensCss: files.find((f) => f.id === 'css').text }), [sys, files]);
  const [pkgFile, setPkgFile] = useState('README.md');
  const pkgName = `${slug(sys.brand.__master?.name ?? sys.brand.name)}-react`;
  const pkgCur = pkg.find((f) => f.file === pkgFile) ?? pkg[0];
  const pkgComponents = pkg.filter((f) => f.file.startsWith('components/')).length;
  const downloadZip = () => download(`${pkgName}.zip`, zip(pkg.map((f) => ({ path: `${pkgName}/${f.file}`, text: f.text }))), 'application/zip');
  // Documentation: measured from the real components while this tab is open.
  const [captures, setCaptures] = useState(null);
  const onCaptured = useCallback((c) => setCaptures(c), []);
  const docIds = useMemo(() => brand.components ?? [], [brand.components]);
  const docs = useMemo(() => (captures ? toDocsSite(sys, {
    captures,
    tokensCss: files.find((f) => f.id === 'css').text,
    componentsCss: pkg.find((f) => f.file === 'components.css').text,
    assets: brandAssets(sys),
  }) : null), [captures, sys, files, pkg]);
  const [docPage, setDocPage] = useState('index.html');
  const docCur = docs?.files.find((f) => f.file === docPage) ?? docs?.files[0];
  const docPages = docs ? docs.files.filter((f) => f.file.endsWith('.html')) : [];
  useEffect(() => {
    const onMsg = (e) => { if (e.data?.tfDoc && docs?.files.some((f) => f.file === e.data.tfDoc)) setDocPage(e.data.tfDoc); };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [docs]);
  const downloadDocs = () => {
    if (!docs) return;
    const bytes = (f) => {
      if (f.text != null) return f.text;
      const b64 = f.dataUrl.slice(f.dataUrl.indexOf(',') + 1);
      return Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
    };
    download(`${docs.name}.zip`, zip(docs.files.map((f) => ({ path: `${docs.name}/${f.file}`, text: bytes(f) }))), 'application/zip');
  };
  const cur = tab === 'docs'
    ? { id: 'docs', file: docs ? `${docs.name}/${docCur.file}` : 'Documentación', text: docCur?.text ?? '' }
    : tab === 'react'
    ? { id: 'react', file: `${pkgName}/${pkgCur.file}`, text: pkgCur.text }
    : files.find((f) => f.id === tab);
  const flash = (m) => { setCopied(m); setTimeout(() => setCopied(''), 1600); };
  const copy = (t, m) => navigator.clipboard?.writeText(t).then(() => flash(m)).catch(() => flash('No se pudo copiar'));
  const shareUrl = `${location.origin}${location.pathname}#b=${encodeBrand(brand)}`;

  return (
    <div className="page">
      <header className="page-hd">
        <div>
          <h1 className="t-h2">Exportar</h1>
          <p className="muted t-small" style={{ marginTop: 8, maxWidth: 620 }}>Un mismo origen, muchos destinos: CSS para la web, JSON W3C para pipelines (Style Dictionary), sets de Tokens Studio para las Variables de Figma, Tailwind, un BRIEF.md con tus objetivos y principios, y un AGENTS.md para que los agentes de IA usen tus tokens reales. Los archivos de código van en inglés, como es habitual.</p>
        </div>
        {!HOSTED && (
          <div className="row">
            <button className="btn outline sm" onClick={() => copy(shareUrl, 'Enlace copiado')}><Icon name="link" size={14} />Copiar enlace para compartir</button>
            <button className="btn primary sm" onClick={() => files.forEach((f, i) => setTimeout(() => download(f.file, f.text), i * 250))}><Icon name="download" size={14} />Descargar todo</button>
          </div>
        )}
      </header>
      <div className="rec-strip">
        <b>{brand.brief?.stack?.length ? 'Recomendado para tu stack' : 'Para empezar'}</b>
        <span className="muted">{[...rec].map((id) => files.find((f) => f.id === id)?.file).filter(Boolean).join(' · ')}</span>
        {!brand.brief?.stack?.length && <button className="link-btn" onClick={() => go('brief')}>Indica tu tecnología en Bases para afinarlo</button>}
      </div>
      <div className="code-wrap">
        <div className="code-tabs">
          {files.map((f) => (
            <button key={f.id} className={f.id === tab ? 'on' : ''} onClick={() => setTab(f.id)}>
              <span className="ct-row">{f.label}{rec.has(f.id) && <em className="rec-badge">Recomendado</em>}</span><span className="mono t-caption faint">{f.file}</span>
            </button>
          ))}
          <button className={tab === 'react' ? 'on' : ''} onClick={() => setTab('react')}>
            <span className="ct-row">React{rec.has('react') && <em className="rec-badge">Recomendado</em>}</span><span className="mono t-caption faint">{pkgName}/ · {pkgComponents} componentes</span>
          </button>
          <button className={tab === 'docs' ? 'on' : ''} onClick={() => setTab('docs')}>
            <span className="ct-row">Documentación<em className="rec-badge">Nuevo</em></span><span className="mono t-caption faint">sitio web · {docIds.length + 6} páginas</span>
          </button>
        </div>
        <div className="code-main">
          <div className="code-bar">
            <span className="mono t-caption">{cur.file} · {cur.text.split('\n').length} líneas</span>
            <div className="row" style={{ gap: 8 }}>
              {copied && <span className="t-caption" style={{ color: 'var(--success-text)' }}>{copied}</span>}
              <button className="btn ghost sm" onClick={() => copy(cur.text, `Copiado: pégalo en ${cur.file}`)}><Icon name="copy" size={14} />Copiar</button>
              {!HOSTED && tab !== 'react' && <button className="btn outline sm" onClick={() => download(cur.file, cur.text)}><Icon name="download" size={14} />Descargar</button>}
              {!HOSTED && tab === 'react' && <button className="btn primary sm" onClick={downloadZip}><Icon name="download" size={14} />Descargar .zip</button>}
              {!HOSTED && tab === 'docs' && <button className="btn primary sm" onClick={downloadDocs} disabled={!docs}><Icon name="download" size={14} />Descargar .zip</button>}
            </div>
          </div>
          <p className="why-file">{WHY[cur.id]}{(tab === 'react' || tab === 'docs') && HOSTED && ' Para descargarlo en .zip, abre la versión web en danoreusmoreno-esp.github.io/tokenforge.'}</p>
          {tab === 'docs' ? (
            docs ? (
              <div className="pkg docs-pkg">
                <nav className="pkg-tree" aria-label="Páginas de la documentación">
                  {docPages.map((f) => (
                    <button key={f.file} className={f.file === docCur.file ? 'on' : ''} aria-current={f.file === docCur.file || undefined} onClick={() => setDocPage(f.file)}
                      style={{ paddingLeft: 8 + (f.file.split('/').length - 1) * 12 }}>
                      <span className="mono">{f.file}</span>
                    </button>
                  ))}
                </nav>
                <DocsFrame title={`Vista previa: ${docCur.file}`} srcDoc={inlineDoc(docs.files, docCur.file)} />
              </div>
            ) : <p className="docs-wait" role="status">Midiendo los componentes de tu sistema…</p>
          ) : tab === 'react' ? (
            <div className="pkg">
              <nav className="pkg-tree" aria-label="Archivos del paquete React">
                {pkg.map((f) => (
                  <button key={f.file} className={f.file === pkgCur.file ? 'on' : ''} aria-current={f.file === pkgCur.file || undefined} onClick={() => setPkgFile(f.file)}
                    style={{ paddingLeft: 8 + (f.file.split('/').length - 1) * 12 }}>
                    <span className="mono">{f.file.split('/').pop()}</span>
                  </button>
                ))}
              </nav>
              <pre className="code big">{cur.text}</pre>
            </div>
          ) : <pre className="code big">{cur.text}</pre>}
        </div>
      </div>
      {tab === 'figma' && (
        <div className="alert info" style={{ marginTop: 16 }}><Icon name="info" size={16} /><div><b>Llevarlo a Figma</b>Instala el plugin Tokens Studio → Tools → Load from file → elige figma-tokens.json → Styles &amp; Variables → Export to Figma. Tendrás un modo claro y uno oscuro para cada color.</div></div>
      )}
      {tab === 'docs' && !captures && <DocsCapture sys={sys} ids={docIds} onDone={onCaptured} />}
      {tab === 'docs' && captures && <DocsRecapture sys={sys} ids={docIds} onDone={onCaptured} />}
      <AssetsCard sys={sys} />
      <nav className="next-step done-step" aria-label="Final">
        <div className="ns-txt"><span className="muted small">Último paso</span><b>Tu sistema está listo para entregar</b><span className="muted">Copia los archivos recomendados. Si cambias algo, vuelve aquí: los archivos se regeneran solos.</span></div>
        <button className="pill" onClick={() => go('home')}>Volver al inicio</button>
      </nav>
    </div>
  );
}

function AssetsCard({ sys }) {
  const assets = brandAssets(sys);
  return (
    <section className="fd-sec assets" aria-labelledby="h-assets">
      <h2 id="h-assets">Recursos de marca</h2>
      <p>{assets.length ? `Logos y fuentes propias del sistema. El CSS ya referencia las fuentes en ./fonts/.${HOSTED ? ' Para descargarlos, abre la versión web en danoreusmoreno-esp.github.io/tokenforge.' : ''}` : 'Aún no hay logos ni fuentes propias. Súbelos desde el inspector, en Marcas y Tipografía.'}</p>
      {assets.length > 0 && (
        <ul className="asset-list">
          {assets.map((a) => (
            <li key={a.file}>
              <span className="asset-prev">{a.kind === 'Logo' ? <img src={a.dataUrl} alt={`Logo de ${a.name}`} /> : <span style={{ fontFamily: `'${a.name}'` }}>Aa</span>}</span>
              <span className="asset-txt"><b>{a.name}</b><span className="muted small">{a.kind} · {a.file}</span></span>
              {!HOSTED && <a className="pill sm" href={a.dataUrl} download={a.file.split('/').pop()}>Descargar</a>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Re-measures in the background when the system changes, keeping the last result on screen. */
function DocsRecapture({ sys, ids, onDone }) {
  const [key, setKey] = useState(0);
  useEffect(() => { const t = setTimeout(() => setKey((k) => k + 1), 600); return () => clearTimeout(t); }, [sys, ids]);
  return key ? <DocsCapture key={key} sys={sys} ids={ids} onDone={onDone} /> : null;
}

/** One page of the docs, self-contained for the preview frame: styles inlined, links routed to the parent. */
function inlineDoc(files, page) {
  const get = (name) => files.find((f) => f.file === name);
  const html = get(page)?.text ?? '';
  const dir = page.includes('/') ? page.slice(0, page.lastIndexOf('/') + 1) : '';
  const resolve = (href) => {
    const parts = (dir + href).split('/');
    const out = [];
    for (const p of parts) { if (p === '..') out.pop(); else if (p !== '.') out.push(p); }
    return out.join('/');
  };
  const router = `<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href');if(/^#/.test(h))return;if(/^https?:/.test(h)){a.target='_blank';return;}e.preventDefault();parent.postMessage({tfDoc:${JSON.stringify(dir)}+h.split('#')[0]},'*');});<\/script>`;
  return html
    .replace(/<link rel="stylesheet" href="([^"]*assets\/[^"]+\.css)">/g, (_, href) => `<style>${get(resolve(href))?.text ?? ''}</style>`)
    .replace(/<script src="([^"]*assets\/docs\.js)"><\/script>/, (_, href) => `<script>${get(resolve(href))?.text ?? ''}<\/script>${router}`)
    .replace(/src="([^"]*assets\/[^"]+\.(?:png|jpg|svg|webp))"/g, (m, href) => { const f = get(resolve(href)); return f?.dataUrl ? `src="${f.dataUrl}"` : m; });
}

/** The docs page laid out at a desktop width and scaled to fit, like a device preview. "Ampliar" opens it large. */
const DOC_W = 960;
const DOC_H = 680;
function DocsFrame({ title, srcDoc }) {
  const box = useRef(null);
  const [scale, setScale] = useState(0.5);
  const [big, setBig] = useState(false);
  const [h, setH] = useState(DOC_H);
  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => { setScale(Math.min(1, el.clientWidth / DOC_W)); setH(el.clientHeight); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [big]);
  useEffect(() => {
    if (!big) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setBig(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [big]);
  const frame = (
    <div className={`docs-viewport ${big ? 'big' : ''}`} ref={box} style={big ? undefined : { height: DOC_H }}>
      <iframe className="docs-frame" title={title} sandbox="allow-scripts allow-popups" srcDoc={srcDoc}
        style={big ? { width: '100%', height: '100%' } : { width: DOC_W, height: h / scale, transform: `scale(${scale})`, transformOrigin: '0 0' }} />
    </div>
  );
  return (
    <div className="docs-preview">
      <button className="btn outline sm docs-expand" onClick={() => setBig(true)}><Icon name="search" size={14} />Ampliar</button>
      {!big && frame}
      {big && (
        <div className="docs-overlay" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => { if (e.target === e.currentTarget) setBig(false); }}>
          <button className="btn primary sm docs-close" onClick={() => setBig(false)} autoFocus><Icon name="x" size={14} />Cerrar</button>
          {frame}
        </div>
      )}
    </div>
  );
}
