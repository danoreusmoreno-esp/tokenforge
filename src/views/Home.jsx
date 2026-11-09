import { useState } from 'react';
import { STARTERS } from '../store.js';
import { Icon } from '../components/Icons.jsx';
import { Live } from '../components/Live.jsx';
import { COMPONENTS, CATEGORIES, SYSTEMS, FEATURED, systemLabel } from '../engine/catalog.js';
import { tokenCount, computeSystem } from '../engine/tokens.js';
import { effectiveBrand, MAX_SUBBRANDS, newSubbrand } from '../engine/brands.js';

const RADIUS = { none: 0, subtle: 4, soft: 8, rounded: 12, large: 18, pill: 999 };

/** The brand's accent ramp drawn as a fan of discs: the visual of the first card, made from data. */
function RampFan({ ramp }) {
  return (
    <div className="fan" role="img" aria-label="Rampa de acento de 12 pasos">
      {ramp.map((h, i) => <span key={i} style={{ background: h, '--i': i }} />)}
    </div>
  );
}

/** Master brand and sub-brands side by side: logo, accent ramp, fonts; click to edit one. */
function Architecture({ brand, setBrand }) {
  const subs = brand.subbrands ?? [];
  const items = [{ id: null, name: brand.name, b: brand, master: true }, ...subs.map((s) => ({ id: s.id, name: s.name, b: effectiveBrand(brand, s.id) }))];
  return (
    <section className="tile arch-tile" aria-labelledby="h-arch">
      <div className="tile-hd">
        <h2 id="h-arch" className="tile-t">Marcas del sistema</h2>
        <span className="muted small">{subs.length ? `Principal + ${subs.length} de ${MAX_SUBBRANDS} submarcas` : 'Añade hasta 4 submarcas que comparten estructura'}</span>
      </div>
      <ul className="arch">
        {items.map(({ id, name, b, master }) => {
          const ramp = computeSystem(b).appearances.light.ramps.primary;
          const on = (brand.activeSub ?? null) === id;
          return (
            <li key={id ?? 'master'}>
              <button className={on ? 'on' : ''} onClick={() => setBrand({ ...brand, activeSub: id })} aria-pressed={on}>
                <span className="arch-logo">{b.logo ? <img src={b.logo} alt={`Logo de ${name}`} /> : <span style={{ fontFamily: `'${b.headingFont}'` }}>{name.slice(0, 1)}</span>}</span>
                <span className="arch-ramp">{ramp.slice(2, 11).map((h, i) => <i key={i} style={{ background: h }} />)}</span>
                <span className="arch-txt"><b>{name}</b><span className="muted small">{master ? 'Principal' : 'Submarca'} · {b.headingFont}</span></span>
              </button>
            </li>
          );
        })}
        {subs.length < MAX_SUBBRANDS && (
          <li>
            <button className="arch-add" onClick={() => { const s = newSubbrand(brand, subs.length + 1); setBrand({ ...brand, subbrands: [...subs, s], activeSub: s.id }); }}>
              <Icon name="plus" size={18} /><span>Añadir submarca</span>
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}

export default function Home({ sys, brand, brands, activeId, go, onStarter, onNew, onSelect, onDelete, onDuplicate, setBrand }) {
  const [confirmId, setConfirmId] = useState(null);
  const passing = sys.audit.filter((r) => r.wcagPass).length;
  const passLight = sys.audit.filter((r) => r.appearance === 'light' && r.wcagPass).length;
  const passDark = sys.audit.filter((r) => r.appearance === 'dark' && r.wcagPass).length;
  const half = sys.audit.length / 2;
  const briefDone = !!brand.brief?.done;
  const inSystem = new Set(brand.components ?? []);
  const byCat = CATEGORIES.map((c) => ({ ...c, n: COMPONENTS.filter((x) => x.cat === c.id && inSystem.has(x.id)).length }));
  const maxCat = Math.max(1, ...byCat.map((c) => c.n));
  const steps = [
    { id: 'brief', t: 'Bases', state: briefDone ? 'Brief completado' : 'Seis preguntas', done: briefDone },
    { id: 'foundations', t: 'Foundations', state: `${tokenCount(sys)} tokens`, done: passing === sys.audit.length },
    { id: 'components', t: 'Componentes', state: `${inSystem.size} elegidos`, done: inSystem.size > 0 },
    { id: 'board', t: 'Tablero', state: 'Revisión en claro y oscuro', done: false },
    { id: 'code', t: 'Exportar', state: 'Código, Figma y agentes', done: false },
  ];
  const next = steps.find((s) => !s.done) ?? steps[4];
  const ramp = sys.appearances.light.ramps.primary;
  const t = sys.type.desktop;

  return (
    <div className="page home">
      <header className="page-hd">
        <div>
          <h1 className="t-h1">{brand.name}</h1>
          <p className="muted">{inSystem.size} componentes · {passing} de {sys.audit.length} pares de contraste cumplen WCAG AA</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="pill" onClick={() => go('import')}><Icon name="upload" size={16} />Importar sistema</button>
          <button className="pill" onClick={onNew}><Icon name="plus" size={16} />Nueva marca</button>
        </div>
      </header>

      <div className="bento">
        <section className="tile hero" aria-labelledby="h-hero">
          <div className="hero-copy">
            <h2 id="h-hero" className="hero-t">{briefDone ? `Sigue con ${next.t.toLowerCase()}` : 'Empieza por las bases'}</h2>
            <p>{briefDone ? 'Tus respuestas ya han generado foundations y componentes. Ajusta y revisa antes de exportar.' : 'Seis preguntas sobre objetivos, alcance y principios generan la primera versión de tu sistema.'}</p>
            <button className="pill dark" onClick={() => go(next.id)}>{briefDone ? `Abrir ${next.t}` : 'Responder las preguntas'}<Icon name="chevRight" size={16} /></button>
          </div>
          <RampFan ramp={ramp} />
        </section>

        <section className="tile progress-tile" aria-labelledby="h-progress">
          <div className="tile-hd"><h2 id="h-progress" className="tile-t">Progreso</h2><span className="muted tnum">{steps.filter((s) => s.done).length}/5</span></div>
          <ol className="path">
            {steps.map((s) => (
              <li key={s.id} className={`${s.done ? 'done' : ''} ${s.id === next.id ? 'next' : ''}`}>
                <button onClick={() => go(s.id)}>
                  <span className="dot" aria-hidden="true">{s.done ? <Icon name="check" size={13} stroke={2.6} /> : null}</span>
                  <span className="path-txt"><b>{s.t}</b><span>{s.state}</span></span>
                  <Icon name="chevRight" size={16} />
                </button>
              </li>
            ))}
          </ol>
        </section>

        <Architecture brand={brand} setBrand={setBrand} />

        <section className="tile metric" aria-labelledby="h-contrast">
          <div className="tile-hd"><h2 id="h-contrast" className="tile-label">Contraste</h2><button className="round" onClick={() => go('foundations')} aria-label="Ver la auditoría de contraste"><Icon name="chevRight" size={16} /></button></div>
          <p className="big tnum">{passing}<span>/{sys.audit.length}</span></p>
          <p className="muted small">pares cumplen WCAG AA</p>
          <div className="splits">
            <div><span className="muted small">Claro</span><div className="track"><i style={{ width: `${(passLight / half) * 100}%` }} /></div><b className="tnum">{passLight}/{half}</b></div>
            <div><span className="muted small">Oscuro</span><div className="track"><i className="soft" style={{ width: `${(passDark / half) * 100}%` }} /></div><b className="tnum">{passDark}/{half}</b></div>
          </div>
        </section>

        <section className="tile metric" aria-labelledby="h-comps">
          <div className="tile-hd"><h2 id="h-comps" className="tile-label">Componentes</h2><button className="round" onClick={() => go('components')} aria-label="Abrir la librería"><Icon name="chevRight" size={16} /></button></div>
          <p className="big tnum">{inSystem.size}<span> de {COMPONENTS.length}</span></p>
          <div className="cols" role="img" aria-label={byCat.map((c) => `${c.name}: ${c.n}`).join(', ')}>
            {byCat.map((c) => <span key={c.id} className={c.n === maxCat ? 'top' : ''} style={{ height: `${Math.max(8, (c.n / maxCat) * 100)}%` }} title={`${c.name}: ${c.n}`} />)}
          </div>
          <p className="muted small">Por categoría · la más completa en oscuro</p>
        </section>

        <Live className="tile type-tile" aria-label="Tipografía de la marca">
          <span className="tile-label">Tipografía</span>
          <span className="type-aa">Aa</span>
          <b className="type-name">{sys.fonts.heading}</b>
          <span className="muted small">Texto en {sys.fonts.body} · {t.body.size}/{t.body.lineHeightPx} px</span>
        </Live>

        <Live className="tile parts-tile" aria-label="Componentes con los tokens de la marca">
          <span className="tile-label">Así se ve</span>
          <div className="parts">
            <div className="row"><button className="btn primary"><Icon name="check" size={14} />Guardar</button><button className="btn outline">Cancelar</button></div>
            <div className="row"><span className="badge success"><i />Publicado</span><span className="badge warning"><i />Revisión</span><span className="switch on" aria-hidden="true" /></div>
            <div className="input"><Icon name="search" size={15} /><span className="faint">Buscar tokens…</span></div>
          </div>
        </Live>

        <section className="tile brands-tile" aria-labelledby="h-brands">
          <div className="tile-hd"><h2 id="h-brands" className="tile-t">Tus marcas</h2><button className="round" onClick={onNew} aria-label="Nueva marca"><Icon name="plus" size={16} /></button></div>
          <ul className="brand-list">
            {brands.map((b) => (
              <li key={b.id} className={b.id === activeId ? 'on' : ''}>
                {b.logo ? <img className="brand-logo" src={b.logo} alt="" /> : <span className="brand-sw">{['primary', 'neutral', 'success', 'critical', 'warning', 'info'].map((f) => <i key={f} style={{ background: b.colors[f] }} />)}</span>}
                <div className="bl-txt"><b>{b.name}</b><span className="muted small">{(b.subbrands?.length ?? 0) > 0 ? `${b.subbrands.length + 1} marcas · ` : ''}{b.components?.length ?? 0} componentes</span></div>
                {b.id === activeId ? <span className="chip-on">Editando</span> : <button className="pill sm" onClick={() => onSelect(b.id)}>Abrir</button>}
                <button className="round" aria-label={`Duplicar ${b.name}`} title="Duplicar" onClick={() => onDuplicate(b.id)}><Icon name="copy" size={15} /></button>
                {brands.length > 1 && (confirmId === b.id
                  ? <><button className="pill sm danger" onClick={() => { onDelete(b.id); setConfirmId(null); }}>Eliminar</button><button className="pill sm" onClick={() => setConfirmId(null)}>Cancelar</button></>
                  : <button className="round" aria-label={`Eliminar ${b.name}`} title="Eliminar" onClick={() => setConfirmId(b.id)}><Icon name="trash" size={15} /></button>)}
              </li>
            ))}
          </ul>
        </section>

        <section className="tile starters-tile" aria-labelledby="h-start">
          <div className="tile-hd"><h2 id="h-start" className="tile-t">Parte de una dirección</h2><span className="muted small">Se aplica a {brand.name}</span></div>
          <ul className="starter-grid">
            {STARTERS.map((s) => (
              <li key={s.id}>
                <button onClick={() => onStarter(s)}>
                  <span className="starter-sw" style={{ background: s.brand.colors.primary, borderRadius: Math.min(RADIUS[s.brand.radius.fields], 14) }} />
                  <span className="bl-txt"><b>{s.name}</b><span className="muted small">{s.note}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="tile refs-tile" aria-labelledby="h-refs">
          <div className="tile-hd"><h2 id="h-refs" className="tile-t">Sistemas de referencia</h2><span className="muted small">Cómo llama cada uno a sus componentes</span></div>
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
