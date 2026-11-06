import { useState } from 'react';
import { STARTERS } from '../store.js';
import { Icon } from '../components/Icons.jsx';
import { Live } from '../components/Live.jsx';
import { COMPONENTS, SYSTEMS, FEATURED, systemLabel } from '../engine/catalog.js';
import { tokenCount } from '../engine/tokens.js';

const RADIUS = { none: 0, subtle: 4, soft: 8, rounded: 12, large: 18, pill: 999 };

/** The brand as it stands: ramp, type and a few live parts. The biggest thing on the screen. */
function BrandStage({ sys, brand, appearance }) {
  const ramp = sys.appearances[appearance].ramps;
  const t = sys.type.desktop;
  return (
    <Live className="stage" aria-label={`Vista de la marca ${brand.name}`}>
      <div className="stage-ramp" role="img" aria-label="Rampa de acento, 12 pasos">
        {ramp.accent.map((h, i) => <span key={i} style={{ background: h }} />)}
      </div>
      <div className="stage-ramp neutral" role="img" aria-label="Rampa neutra, 12 pasos">
        {ramp.neutral.map((h, i) => <span key={i} style={{ background: h }} />)}
      </div>
      <div className="stage-body">
        <div className="stage-type">
          <span className="stage-aa">Aa</span>
          <div>
            <b className="t-h3">{sys.fonts.heading}</b>
            <span className="t-small muted">Texto en {sys.fonts.body} · {t.body.size}/{t.body.lineHeightPx} px · títulos hasta {t.display.size} px</span>
          </div>
        </div>
        <div className="stage-parts">
          <div className="row">
            <button className="btn primary"><Icon name="check" size={14} />Guardar cambios</button>
            <button className="btn outline">Cancelar</button>
          </div>
          <div className="row">
            <span className="badge success"><i />Publicado</span>
            <span className="badge warning"><i />En revisión</span>
            <span className="badge info"><i />Nuevo</span>
            <span className="switch on" aria-hidden="true" />
          </div>
          <div className="input" style={{ maxWidth: 300 }}><Icon name="search" size={15} /><span className="faint">Buscar tokens…</span></div>
        </div>
      </div>
    </Live>
  );
}

export default function Home({ sys, brand, appearance, brands, activeId, go, onStarter, onNew, onSelect, onDelete, onDuplicate }) {
  const [confirmId, setConfirmId] = useState(null);
  const passing = sys.audit.filter((r) => r.wcagPass).length;
  const briefDone = !!brand.brief?.done;
  const steps = [
    { id: 'brief', t: 'Bases', state: briefDone ? 'Brief completado' : 'Sin responder', done: briefDone, action: briefDone ? 'Revisar' : 'Responder' },
    { id: 'foundations', t: 'Foundations', state: `${tokenCount(sys)} tokens · ${passing} de ${sys.audit.length} pares de contraste cumplen`, done: passing === sys.audit.length, action: 'Ajustar' },
    { id: 'components', t: 'Componentes', state: `${brand.components?.length ?? 0} de ${COMPONENTS.length} en tu sistema`, done: (brand.components?.length ?? 0) > 0, action: 'Elegir' },
    { id: 'board', t: 'Tablero', state: 'Todo junto, en claro y en oscuro', done: false, action: 'Abrir' },
    { id: 'code', t: 'Exportar', state: 'CSS, JSON W3C, Figma, Tailwind, BRIEF.md y AGENTS.md', done: false, action: 'Exportar' },
  ];
  const next = steps.find((s) => !s.done) ?? steps[4];

  return (
    <div className="page home">
      <header className="page-hd">
        <div>
          <h1 className="t-h2">{brand.name}</h1>
          <p className="t-small muted">
            {briefDone ? `${brand.components?.length ?? 0} componentes · ${passing} de ${sys.audit.length} pares de contraste cumplen WCAG AA` : 'Empieza por las bases: seis preguntas que generan la primera versión del sistema.'}
          </p>
        </div>
        <div className="row">
          <button className="btn outline sm" onClick={onNew}><Icon name="plus" size={14} />Nueva marca</button>
          <button className="btn primary sm" onClick={() => go(next.id)}>Siguiente: {next.t}<Icon name="chevRight" size={14} /></button>
        </div>
      </header>

      <div className="home-grid">
        <BrandStage sys={sys} brand={brand} appearance={appearance} />

        <section className="panel panel-progress" aria-labelledby="h-progress">
          <h2 id="h-progress" className="panel-t">Progreso</h2>
          <ol className="steps-list">
            {steps.map((s) => (
              <li key={s.id} className={s.done ? 'done' : ''}>
                <span className="dot" aria-hidden="true">{s.done && <Icon name="check" size={11} stroke={3} />}</span>
                <div className="st">
                  <b>{s.t}</b>
                  <span className="t-caption muted">{s.state}</span>
                </div>
                <button className="btn ghost sm" onClick={() => go(s.id)}>{s.action}</button>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel starters" aria-labelledby="h-start">
        <div className="panel-hd"><h2 id="h-start" className="panel-t">Parte de una dirección</h2><span className="t-caption muted">Se aplica a {brand.name}</span></div>
        <ul className="starter-list">
          {STARTERS.map((s) => (
            <li key={s.id}>
              <button onClick={() => onStarter(s)}>
                <span className="starter-sw" style={{ background: s.brand.colors.accent, borderRadius: Math.min(RADIUS[s.brand.radius.fields], 10) }} />
                <span className="bl-txt"><b>{s.name}</b><span className="t-caption muted">{s.note}</span></span>
                <Icon name="chevRight" size={14} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="home-cols">
        <section className="panel" aria-labelledby="h-brands">
          <div className="panel-hd"><h2 id="h-brands" className="panel-t">Tus marcas</h2><span className="t-caption muted tnum">{brands.length}</span></div>
          <ul className="brand-list">
            {brands.map((b) => (
              <li key={b.id} className={b.id === activeId ? 'on' : ''}>
                <span className="brand-sw">{['accent', 'neutral', 'success', 'critical', 'warning', 'info'].map((f) => <i key={f} style={{ background: b.colors[f] }} />)}</span>
                <div className="bl-txt">
                  <b>{b.name}</b>
                  <span className="t-caption muted">{b.font} · {b.components?.length ?? 0} componentes</span>
                </div>
                {b.id === activeId ? <span className="badge">Editando</span> : <button className="btn outline sm" onClick={() => onSelect(b.id)}>Abrir</button>}
                <button className="btn ghost icon sm" aria-label={`Duplicar ${b.name}`} title="Duplicar" onClick={() => onDuplicate(b.id)}><Icon name="copy" size={14} /></button>
                {brands.length > 1 && (confirmId === b.id
                  ? <><button className="btn destructive sm" onClick={() => { onDelete(b.id); setConfirmId(null); }}>Eliminar</button><button className="btn ghost sm" onClick={() => setConfirmId(null)}>Cancelar</button></>
                  : <button className="btn ghost icon sm" aria-label={`Eliminar ${b.name}`} title="Eliminar" onClick={() => setConfirmId(b.id)}><Icon name="trash" size={14} /></button>)}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel refs" aria-labelledby="h-refs">
          <div className="panel-hd"><h2 id="h-refs" className="panel-t">Sistemas de referencia</h2><span className="t-caption muted">El catálogo indica cómo llama cada uno a sus componentes</span></div>
          <table className="tbl">
            <thead><tr><th>Sistema</th><th>Empresa</th><th className="hide-sm">Carácter</th><th className="tnum">Componentes</th><th aria-label="Documentación" /></tr></thead>
            <tbody>
              {FEATURED.map((k) => (
                <tr key={k}>
                  <td><b>{systemLabel(k)}</b></td>
                  <td className="muted">{SYSTEMS[k].org}</td>
                  <td className="muted hide-sm">{SYSTEMS[k].note}</td>
                  <td className="tnum">{COMPONENTS.filter((c) => c.refs.includes(k)).length}</td>
                  <td className="tnum"><a className="link subtle" href={SYSTEMS[k].url} target="_blank" rel="noreferrer">Docs<Icon name="chevRight" size={12} /></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

    </div>
  );
}
