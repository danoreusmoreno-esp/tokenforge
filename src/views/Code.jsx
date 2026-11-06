import { useMemo, useState } from 'react';
import { EXPORTS, brandAssets } from '../engine/exporters.js';
import { Icon } from '../components/Icons.jsx';
import { encodeBrand } from '../store.js';

// The hosted single-file build runs in a sandbox that blocks downloads and hash links.
const HOSTED = import.meta.env.MODE === 'single';

function download(name, text) {
  const blob = new Blob([text], { type: 'text/plain' });
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
};

/** Files to start with, from the stack chosen in Bases. */
function recommended(brand) {
  const stack = new Set(brand.brief?.stack ?? []);
  const ids = new Set(['css', 'figma', 'agents']);
  if (stack.has('tailwind')) ids.add('tailwind');
  if (stack.has('react')) ids.add('motion');
  if (stack.has('swiftui') || stack.has('compose') || stack.has('angular') || stack.has('vue') || stack.has('svelte')) ids.add('json');
  if (brand.brief?.done) ids.add('brief');
  return ids;
}

export default function Code({ sys, brand, go }) {
  const rec = recommended(brand);
  const [tab, setTab] = useState('css');
  const [copied, setCopied] = useState('');
  const files = useMemo(() => EXPORTS.map((e) => ({ ...e, text: e.fn(sys) })), [sys]);
  const cur = files.find((f) => f.id === tab);
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
        </div>
        <div className="code-main">
          <div className="code-bar">
            <span className="mono t-caption">{cur.file} · {cur.text.split('\n').length} líneas</span>
            <div className="row" style={{ gap: 8 }}>
              {copied && <span className="t-caption" style={{ color: 'var(--success-text)' }}>{copied}</span>}
              <button className="btn ghost sm" onClick={() => copy(cur.text, `Copiado: pégalo en ${cur.file}`)}><Icon name="copy" size={14} />Copiar</button>
              {!HOSTED && <button className="btn outline sm" onClick={() => download(cur.file, cur.text)}><Icon name="download" size={14} />Descargar</button>}
            </div>
          </div>
          <p className="why-file">{WHY[cur.id]}</p>
          <pre className="code big">{cur.text}</pre>
        </div>
      </div>
      {tab === 'figma' && (
        <div className="alert info" style={{ marginTop: 16 }}><Icon name="info" size={16} /><div><b>Llevarlo a Figma</b>Instala el plugin Tokens Studio → Tools → Load from file → elige figma-tokens.json → Styles &amp; Variables → Export to Figma. Tendrás un modo claro y uno oscuro para cada color.</div></div>
      )}
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
