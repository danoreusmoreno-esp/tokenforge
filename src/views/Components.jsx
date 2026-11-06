import { useState } from 'react';
import { COMPONENTS, CATEGORIES, SYSTEMS, FEATURED, CORE_IDS, systemLabel } from '../engine/catalog.js';
import { componentTokens } from '../engine/exporters.js';
import { Preview } from '../components/previews.jsx';
import { Icon } from '../components/Icons.jsx';

const TOTAL = FEATURED.length;

// Display labels for variant, size and state ids (the ids stay in English: they are props).
const VAL_ES = {
  primary: 'principal', secondary: 'secundario', outline: 'contorno', ghost: 'fantasma', destructive: 'destructivo',
  solid: 'sólido', attached: 'unidos', spaced: 'separados', inline: 'en línea', standalone: 'independiente', subtle: 'sutil',
  regular: 'normal', extended: 'extendido', floating: 'flotante', filled: 'relleno', single: 'simple', multi: 'múltiple',
  dropzone: 'zona de arrastre', button: 'botón', range: 'rango', card: 'tarjeta', filter: 'filtro', input: 'entrada', static: 'estático',
  display: 'solo lectura', line: 'línea', pill: 'píldora', numbered: 'numerada', simple: 'simple', collapsed: 'contraída',
  horizontal: 'horizontal', vertical: 'vertical', neutral: 'neutro', accent: 'acento', success: 'éxito', warning: 'aviso',
  critical: 'crítico', info: 'info', linear: 'lineal', circular: 'circular', text: 'texto', block: 'bloque', avatar: 'avatar',
  right: 'derecha', bottom: 'inferior', elevated: 'elevada', zebra: 'cebra', image: 'imagen', initials: 'iniciales',
  default: 'por defecto', hover: 'hover', focus: 'foco', disabled: 'deshabilitado', loading: 'cargando', selected: 'seleccionado',
  visited: 'visitado', error: 'error', 'read-only': 'solo lectura', open: 'abierto', idle: 'en reposo', dragging: 'arrastrando',
  uploading: 'subiendo', unchecked: 'sin marcar', checked: 'marcado', indeterminate: 'indeterminado', off: 'apagado', on: 'encendido',
  removable: 'eliminable', current: 'actual', active: 'activo', badge: 'con badge', complete: 'completado', upcoming: 'pendiente',
  dismissible: 'descartable', saving: 'guardando', today: 'hoy', interactive: 'interactiva', up: 'sube', down: 'baja',
  expanded: 'expandido', compact: 'compacta', sm: 'S', md: 'M', lg: 'L',
};
const tv = (x) => VAL_ES[x] ?? x;

function Coverage({ refs }) {
  return (
    <span className="coverage" title={refs.map(systemLabel).join(', ')} aria-label={`In ${refs.length} of ${TOTAL} systems`}>
      {FEATURED.map((k) => <i key={k} className={refs.includes(k) ? 'on' : ''} />)}
    </span>
  );
}

function NamesTable({ c }) {
  return (
    <div className="names">
      {FEATURED.map((k) => (
        <a key={k} className={`name-row ${c.names[k] ? '' : 'none'}`} href={SYSTEMS[k].url} target="_blank" rel="noreferrer">
          <span className="sys"><b>{systemLabel(k)}</b><span className="t-caption faint">{SYSTEMS[k].org}</span></span>
          <span className="mono t-caption">{c.names[k] ?? 'Sin equivalente directo'}</span>
        </a>
      ))}
    </div>
  );
}

function Catalogue({ brand, setComponents, open }) {
  const [filter, setFilter] = useState('all');
  const [sys, setSys] = useState('all');
  const enabled = new Set(brand.components);
  const toggle = (id) => setComponents(enabled.has(id) ? brand.components.filter((x) => x !== id) : [...brand.components, id]);
  const cats = CATEGORIES.filter((c) => filter === 'all' || c.id === filter);
  const visible = (c) => sys === 'all' || c.refs.includes(sys);
  return (
    <div className="page">
      <header className="page-hd">
        <div>
          <h1 className="t-h2">Librería de componentes</h1>
          <p className="muted t-small" style={{ maxWidth: 640, marginTop: 6 }}>
            {COMPONENTS.length} componentes basados en {TOTAL} sistemas de diseño de referencia. Cada uno indica cómo lo llaman Material 3, Apple HIG, Polaris, Carbon, Fluent 2 y el resto. Elige los que necesita tu sistema: todos se pintan con tus tokens y traen sus propios tokens de componente.
          </p>
        </div>
        <div className="row">
          <span className="badge accent">{brand.components.length} en el sistema</span>
          <button className="btn outline sm" onClick={() => setComponents([...CORE_IDS])}>Set básico</button>
          <button className="btn outline sm" onClick={() => setComponents(COMPONENTS.map((c) => c.id))}>Añadir todos</button>
          <button className="btn ghost sm" onClick={() => setComponents([])}>Quitar todos</button>
        </div>
      </header>
      <div className="seg-tabs" role="group" aria-label="Categorías">
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>Todos</button>
        {CATEGORIES.map((c) => <button key={c.id} className={filter === c.id ? 'on' : ''} onClick={() => setFilter(c.id)}>{c.name}</button>)}
      </div>
      <div className="sys-filter" role="group" aria-label="Filtrar por sistema de diseño">
        <span className="filter-label">Presente en</span>
        <button className={sys === 'all' ? 'on' : ''} onClick={() => setSys('all')}>Cualquiera</button>
        {FEATURED.map((k) => <button key={k} className={sys === k ? 'on' : ''} onClick={() => setSys(k)}>{systemLabel(k)}<span className="count">{COMPONENTS.filter((c) => c.refs.includes(k)).length}</span></button>)}
      </div>
      {cats.filter((cat) => COMPONENTS.some((c) => c.cat === cat.id && visible(c))).map((cat) => (
        <section key={cat.id} className="fd-sec">
          <h2 className="t-h4">{cat.name}</h2>
          <div className="cat-grid">
            {COMPONENTS.filter((c) => c.cat === cat.id && visible(c)).map((c) => (
              <div key={c.id} className={`cat-card ${enabled.has(c.id) ? 'in' : ''}`}>
                <div className="cat-prev" onClick={() => open(c.id)}><div className="cat-prev-inner"><Preview id={c.id} /></div></div>
                <div className="cat-meta">
                  <div style={{ minWidth: 0 }}>
                    <button className="cat-name" onClick={() => open(c.id)}>{c.name}</button>
                    <div className="t-caption faint row" style={{ gap: 6 }}><Coverage refs={c.refs} />{sys !== 'all' && c.names[sys] ? <span className="mono">{c.names[sys]}</span> : <span>{c.refs.length}/{TOTAL}{c.core ? ' · básico' : ''}</span>}</div>
                  </div>
                  <label className="check" title={enabled.has(c.id) ? 'Quitar del sistema' : 'Añadir al sistema'}>
                    <span className={`switch ${enabled.has(c.id) ? 'on' : ''}`} role="switch" aria-checked={enabled.has(c.id)} aria-label={`Incluir ${c.name}`} tabIndex={0}
                      onClick={() => toggle(c.id)} onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), toggle(c.id))} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Detail({ id, sys, brand, setComponents, setComponentToken, back }) {
  const c = COMPONENTS.find((x) => x.id === id);
  const [v, setV] = useState(c.variants[0]);
  const [s, setS] = useState(c.sizes.includes('md') ? 'md' : c.sizes[0]);
  const [st, setSt] = useState(c.states[0]);
  const enabled = brand.components.includes(id);
  const tokens = componentTokens(sys, id);
  const snippet = `/* ${c.name} — uses your tokens */\n.${id} {\n${Object.entries(tokens).map(([k, val]) => `  --${id}-${k}: ${val};`).join('\n')}${Object.keys(tokens).length ? '\n' : ''}  font-family: var(--font-body);\n  border-radius: var(--radius-${['card', 'dialog', 'drawer', 'popover', 'alert', 'toast', 'table'].includes(id) ? 'boxes' : ['checkbox', 'radio', 'chip', 'tabs', 'segmented', 'badge'].includes(id) ? 'selectors' : 'fields'});\n  transition: background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard);\n}`;
  return (
    <div className="page">
      <button className="btn ghost sm" onClick={back} style={{ marginBottom: 12 }}><Icon name="chevLeft" size={14} />Todos los componentes</button>
      <header className="page-hd">
        <div>
          <h1 className="t-h2">{c.name}</h1>
          <p className="muted" style={{ marginTop: 6, maxWidth: 620 }}>{c.desc}</p>
          <div style={{ marginTop: 10 }} className="row"><Coverage refs={c.refs} /><span className="t-caption faint">En {c.refs.length} de {TOTAL} sistemas de referencia</span></div>
        </div>
        <button className={`btn ${enabled ? 'outline' : 'primary'}`} onClick={() => setComponents(enabled ? brand.components.filter((x) => x !== id) : [...brand.components, id])}>
          <Icon name={enabled ? 'check' : 'plus'} size={14} />{enabled ? 'En tu sistema' : 'Añadir al sistema'}
        </button>
      </header>

      <section className="fd-sec">
        <h2 className="t-h4">Zona de pruebas</h2>
        <div className="playground">
          <div className="pg-stage"><Preview id={id} v={v} s={s} st={st} /></div>
          <div className="pg-controls">
            <label className="ins-field"><span>Variante</span><select value={v} onChange={(e) => setV(e.target.value)}>{c.variants.map((x) => <option key={x} value={x}>{tv(x)}</option>)}</select></label>
            <label className="ins-field"><span>Tamaño</span><select value={s} onChange={(e) => setS(e.target.value)}>{c.sizes.map((x) => <option key={x} value={x}>{tv(x)}</option>)}</select></label>
            <label className="ins-field"><span>Estado</span><select value={st} onChange={(e) => setSt(e.target.value)}>{c.states.map((x) => <option key={x} value={x}>{tv(x)}</option>)}</select></label>
          </div>
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h4">Variantes</h2>
        <div className="variant-grid">
          {c.variants.map((x) => (
            <div key={x} className="variant"><span className="t-caption faint">{tv(x)}</span><div className="variant-stage"><Preview id={id} v={x} s={s} st={c.states[0]} /></div></div>
          ))}
        </div>
      </section>

      {c.states.length > 1 && (
        <section className="fd-sec">
          <h2 className="t-h4">Estados</h2>
          <div className="variant-grid">
            {c.states.map((x) => (
              <div key={x} className="variant"><span className="t-caption faint">{tv(x)}</span><div className="variant-stage"><Preview id={id} v={v} s={s} st={x} /></div></div>
            ))}
          </div>
        </section>
      )}

      <section className="fd-sec">
        <h2 className="t-h4">En los sistemas de referencia</h2>
        <p className="muted t-small" style={{ marginBottom: 10 }}>Cómo lo llama cada sistema. Abre una fila para leer su documentación.</p>
        <NamesTable c={c} />
      </section>

      <section className="fd-sec two-col">
        <div>
          <h2 className="t-h4">Tokens de componente</h2>
          <p className="muted t-small" style={{ marginBottom: 10 }}>Se ajustan por componente. Todo lo demás se hereda de las foundations.</p>
          {Object.keys(c.tokens).length === 0 && <p className="t-small faint">Este componente solo usa tokens de las foundations.</p>}
          {Object.entries(c.tokens).map(([k, def]) => {
            const cur = brand.componentTokens?.[id]?.[k] ?? def;
            return (
              <label key={k} className="tok-row">
                <span className="mono t-caption">--{id}-{k}</span>
                <input type="number" value={cur} onChange={(e) => setComponentToken(id, k, e.target.value === '' ? def : Number(e.target.value))} aria-label={`${id} ${k}`} />
                {cur !== def && <button className="btn ghost sm" onClick={() => setComponentToken(id, k, def)}>Restablecer</button>}
              </label>
            );
          })}
          <h2 className="t-h4" style={{ marginTop: 20 }}>Pautas de uso</h2>
          <ul className="t-small muted guide">
            <li>Anillo de foco visible en cada parte interactiva: <code className="inl">--focus-ring</code>.</li>
            <li>El texto sobre sólidos usa su rol <code className="inl">*-on-solid</code> (comprobado AA).</li>
            <li>Respeta <code className="inl">prefers-reduced-motion</code>; las duraciones salen de los tokens de movimiento.</li>
            {c.cat === 'actions' && <li>Una sola acción principal por vista; las acciones destructivas piden confirmación.</li>}
            {c.cat === 'inputs' && <li>Siempre con etiqueta visible; los errores explican cómo corregirlos.</li>}
            {c.cat === 'overlays' && <li>Retén el foco mientras está abierto, cierra con Escape y devuelve el foco al disparador.</li>}
          </ul>
        </div>
        <div>
          <h2 className="t-h4">Código</h2>
          <pre className="code">{snippet}</pre>
        </div>
      </section>
    </div>
  );
}

export default function Components(props) {
  const { detail, setDetail } = props;
  if (detail) return <Detail key={detail} id={detail} {...props} back={() => setDetail(null)} />;
  return <Catalogue {...props} open={setDetail} />;
}
