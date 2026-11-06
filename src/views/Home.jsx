import { useState } from 'react';
import { STARTERS } from '../store.js';
import { Icon } from '../components/Icons.jsx';
import { COMPONENTS, SYSTEMS, FEATURED, systemLabel } from '../engine/catalog.js';
import { tokenCount } from '../engine/tokens.js';

export default function Home({ sys, brands, activeId, go, onStarter, onNew, onSelect, onDelete, onDuplicate }) {
  const [confirmId, setConfirmId] = useState(null);
  const steps = [
    { n: '01', t: 'Bases', d: 'Seis preguntas antes de cualquier píxel: por qué, para quién, por dónde empiezas, quién participa, principios y personalidad. Tus respuestas generan la primera versión de todo lo demás.', to: 'brief', ic: 'book' },
    { n: '02', t: 'Foundations', d: 'Rampas de color en claro y oscuro, roles semánticos con contraste resuelto, escala tipográfica con densidad, espaciado por dispositivo, radio en tres ejes, elevación y movimiento.', to: 'foundations', ic: 'palette' },
    { n: '03', t: 'Componentes', d: `${COMPONENTS.length} componentes del inventario común de los grandes sistemas de diseño. Elige los tuyos, ajusta sus tokens y revisa cada variante y estado.`, to: 'components', ic: 'grid' },
    { n: '04', t: 'Tablero', d: 'Todos los componentes que elegiste, juntos y pintados en vivo con tus foundations.', to: 'board', ic: 'layers' },
    { n: '05', t: 'Exportar', d: 'Variables CSS, JSON W3C, Figma (Tokens Studio → Variables), Tailwind, el BRIEF.md y un AGENTS.md para agentes de IA.', to: 'code', ic: 'code' },
  ];
  return (
    <div className="page home">
      <section className="hero">
        <span className="eyebrow">Constructor de sistemas de diseño</span>
        <h1 className="t-display">De un color de acento a un sistema de diseño completo.</h1>
        <p className="t-lead muted" style={{ maxWidth: 640 }}>Define las bases, crea las foundations desde cero, monta una librería de componentes basada en lo que incluyen los mejores sistemas y expórtalo a código, Figma y tu agente de IA.</p>
        <div className="row" style={{ marginTop: 20 }}>
          <button className="btn primary lg" onClick={() => go('brief')}><Icon name="rocket" size={16} />Empezar</button>
          <button className="btn outline lg" onClick={onNew}><Icon name="plus" size={16} />Nueva marca</button>
        </div>
        <div className="stats">
          <div><b>{tokenCount(sys)}</b><span>tokens generados</span></div>
          <div><b>{COMPONENTS.length}</b><span>componentes en el catálogo</span></div>
          <div><b>{Object.keys(sys.appearances.light.roles).length}</b><span>roles semánticos</span></div>
          <div><b>{sys.audit.filter((r) => r.wcagPass).length}/{sys.audit.length}</b><span>pares de contraste que cumplen</span></div>
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Cómo funciona</h2>
        <div className="steps-grid">
          {steps.map((s) => (
            <button key={s.n} className="card step-card interactive" onClick={() => go(s.to)}>
              <div className="row" style={{ justifyContent: 'space-between' }}><span className="mono t-caption faint">{s.n}</span><Icon name={s.ic} size={18} /></div>
              <h3 className="t-h4">{s.t}</h3>
              <p className="t-small muted">{s.d}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Sistemas de referencia</h2>
        <p className="muted t-small">El catálogo de componentes se basa en estos {FEATURED.length} sistemas. La página de cada componente muestra cómo lo llama cada uno.</p>
        <div className="ref-grid">
          {FEATURED.map((k) => (
            <a key={k} className="card ref-card interactive" href={SYSTEMS[k].url} target="_blank" rel="noreferrer">
              <div className="row"><b className="t-small">{SYSTEMS[k].name}</b><span className="badge accent sm">{COMPONENTS.filter((c) => c.refs.includes(k)).length}</span></div>
              <span className="t-caption faint">{SYSTEMS[k].org}</span>
              <span className="t-small muted">{SYSTEMS[k].noteEs ?? SYSTEMS[k].note}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Parte de una dirección</h2>
        <p className="muted t-small">Puntos de partida que recuerdan el carácter de cada sistema de referencia, con valores propios. Se aplican a la marca actual y luego puedes ajustar todo.</p>
        <div className="starter-grid">
          {STARTERS.map((s) => (
            <button key={s.id} className="card starter interactive" onClick={() => onStarter(s)}>
              <span className="starter-sw" style={{ background: s.brand.colors.accent, borderRadius: { none: 0, subtle: 4, soft: 8, rounded: 12, large: 18, pill: 999 }[s.brand.radius.fields] }} />
              <div><b className="t-small">{s.name}</b><div className="help">{s.note}</div><div className="t-caption faint">Inspirado en {systemLabel(s.system)}</div></div>
            </button>
          ))}
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Tus marcas</h2>
        <div className="brand-list">
          {brands.map((b) => (
            <div key={b.id} className={`card brand-item ${b.id === activeId ? 'on' : ''}`}>
              <div className="brand-sw">{['accent', 'neutral', 'success', 'critical', 'warning', 'info'].map((f) => <i key={f} style={{ background: b.colors[f] }} />)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b className="t-small">{b.name}</b>
                <div className="help">{b.font} · {b.components?.length ?? 0} componentes</div>
              </div>
              {b.id === activeId ? <span className="badge accent">Editando</span> : <button className="btn outline sm" onClick={() => onSelect(b.id)}>Abrir</button>}
              <button className="btn ghost icon sm" aria-label="Duplicar" title="Duplicar" onClick={() => onDuplicate(b.id)}><Icon name="copy" size={14} /></button>
              {brands.length > 1 && (confirmId === b.id
                ? <><button className="btn destructive sm" onClick={() => { onDelete(b.id); setConfirmId(null); }}>Eliminar</button><button className="btn ghost sm" onClick={() => setConfirmId(null)}>Cancelar</button></>
                : <button className="btn ghost icon sm" aria-label="Eliminar" title="Eliminar" onClick={() => setConfirmId(b.id)}><Icon name="trash" size={14} /></button>)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
