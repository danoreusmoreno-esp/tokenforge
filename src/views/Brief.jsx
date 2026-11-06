import { useState } from 'react';
import { QUESTIONS, PERSONALITY, WIZARD_STEPS, EMPTY_BRIEF, recommend, recommendedScope, scaleLabel } from '../engine/brief.js';
import { SYSTEMS, FEATURED, systemLabel } from '../engine/catalog.js';
import { Icon } from '../components/Icons.jsx';
import { Live } from '../components/Live.jsx';

function Choices({ options, value, onChange, multi = true, max }) {
  const sel = multi ? value : [value];
  const toggle = (id) => {
    if (!multi) return onChange(id === value ? '' : id);
    if (sel.includes(id)) return onChange(sel.filter((x) => x !== id));
    if (max && sel.length >= max) return;
    onChange([...sel, id]);
  };
  return (
    <div className="choices" role={multi ? 'group' : 'radiogroup'}>
      {options.map((opt) => {
        const on = sel.includes(opt.id);
        return (
          <button key={opt.id} type="button" className={`choice ${on ? 'on' : ''} ${opt.hint ? 'tall' : ''}`} aria-pressed={on} onClick={() => toggle(opt.id)}
            disabled={multi && max && !on && sel.length >= max}>
            <span className={`box ${multi ? '' : 'radio'} ${on ? 'on' : ''}`}>{multi && on && <Icon name="check" size={12} stroke={3} />}</span>
            <span className="choice-txt"><b>{opt.label}</b>{opt.hint && <span>{opt.hint}</span>}</span>
          </button>
        );
      })}
    </div>
  );
}

function Q({ title, help, children, id }) {
  return (
    <fieldset className="q" id={id}>
      <legend className="t-h4">{title}</legend>
      {help && <p className="t-small muted">{help}</p>}
      {children}
    </fieldset>
  );
}

function StepBody({ step, b, set }) {
  const up = (k) => (v) => set({ ...b, [k]: v });
  switch (step) {
    case 'why':
      return (
        <>
          <Q title="¿Qué problemas debe resolver?" help="Elige todos los que apliquen.">
            <Choices options={QUESTIONS.goals} value={b.goals} onChange={up('goals')} />
          </Q>
          <Q title="Con tus palabras, ¿por qué ahora?" help="Opcional. Una o dos frases que podrías decirle a dirección.">
            <textarea id="brief-why" className="input" value={b.why} onChange={(e) => up('why')(e.target.value)} placeholder="El checkout, el panel y la app parecen de tres empresas distintas, y cada cambio de marca nos lleva un mes." />
          </Q>
          <Q title="¿Cómo sabrás que funciona?" help="Elige las métricas que vas a seguir.">
            <Choices options={QUESTIONS.success} value={b.success} onChange={up('success')} />
          </Q>
        </>
      );
    case 'scope':
      return (
        <>
          <Q title="¿Qué tamaño tiene el equipo que lo usará?"><Choices multi={false} options={QUESTIONS.team} value={b.team} onChange={up('team')} /></Q>
          <Q title="¿Cuántos productos o marcas?"><Choices multi={false} options={QUESTIONS.products} value={b.products} onChange={up('products')} /></Q>
          <Q title="¿Qué tipo de producto es?" help="Elige todos los que apliquen. Decide con qué componentes empiezas."><Choices options={QUESTIONS.productType} value={b.productType} onChange={up('productType')} /></Q>
          <Q title="¿En qué plataformas?"><Choices options={QUESTIONS.platforms} value={b.platforms} onChange={up('platforms')} /></Q>
        </>
      );
    case 'start':
      return (
        <>
          <Q title="¿Qué enfoque te encaja?" help="No hay respuesta incorrecta: depende de tu tiempo, tu equipo y tus objetivos a largo plazo.">
            <Choices multi={false} options={QUESTIONS.approach} value={b.approach} onChange={up('approach')} />
          </Q>
          {b.approach === 'adopt' && (
            <Q title="¿Qué sistema adaptarías?">
              <Choices multi={false} options={FEATURED.map((k) => ({ id: k, label: SYSTEMS[k].name, hint: SYSTEMS[k].org }))} value={b.framework} onChange={up('framework')} />
            </Q>
          )}
          {b.approach === 'audit' && (
            <div className="alert info"><Icon name="info" size={16} /><div><b>Haz un inventario visual</b>Captura cada color, tipografía, icono, botón, formulario y patrón en todas las plataformas, incluidos sus estados. Agrúpalos y marca los duplicados: es lo primero que hay que consolidar.</div></div>
          )}
          <Q title="¿Qué tienes ya?" help="Úsalo como punto de partida.">
            <Choices options={QUESTIONS.assets} value={b.assets} onChange={up('assets')} />
          </Q>
          <div className="q-row">
            <label className="field" htmlFor="brief-color">
              <span className="label">Color de marca</span>
              <div className="input"><input id="brief-color" value={b.brandColor} onChange={(e) => up('brandColor')(e.target.value)} placeholder="#0f62fe" />
                <label className="swatch-sm" style={{ background: /^#?[0-9a-f]{6}$/i.test(b.brandColor) ? (b.brandColor.startsWith('#') ? b.brandColor : `#${b.brandColor}`) : 'var(--bg-muted)' }}>
                  <input type="color" aria-label="Elegir color de marca" onChange={(e) => up('brandColor')(e.target.value)} />
                </label>
              </div>
              <span className="help">Opcional. Será tu color de acento.</span>
            </label>
            <label className="field" htmlFor="brief-font">
              <span className="label">Tipografía de marca</span>
              <input id="brief-font" className="input" value={b.brandFont} onChange={(e) => up('brandFont')(e.target.value)} placeholder="p. ej. Manrope (nombre en Google Fonts)" />
              <span className="help">Opcional. Si la dejas vacía, te proponemos una.</span>
            </label>
          </div>
        </>
      );
    case 'people':
      return (
        <>
          <Q title="¿Quién debería participar?" help="Busca defensores también fuera de diseño: desarrollo, producto, soporte. Muchos sistemas empiezan con una sola persona.">
            <Choices options={QUESTIONS.stakeholders} value={b.stakeholders} onChange={up('stakeholders')} />
          </Q>
          <Q title="¿Con qué tecnología lo vais a construir?"><Choices options={QUESTIONS.stack} value={b.stack} onChange={up('stack')} /></Q>
        </>
      );
    case 'principles':
      return (
        <Q title={`Tus principios (${b.principles.length}/3)`} help="Un buen principio parte de un porqué, es concreto y se puede llevar a la práctica.">
          <Choices options={QUESTIONS.principles} value={b.principles} onChange={up('principles')} max={3} />
        </Q>
      );
    case 'personality':
      return (
        <>
          <Q title="Personalidad" help="Mueve cada deslizador. Definen tipografía, radio, densidad, sombra y movimiento.">
            <div className="sliders">
              {PERSONALITY.map((s) => (
                <label key={s.id} className="pslider" htmlFor={`p-${s.id}`}>
                  <span className="t-small">{s.left}</span>
                  <input id={`p-${s.id}`} type="range" min="0" max="100" value={b.personality[s.id]} onChange={(e) => set({ ...b, personality: { ...b.personality, [s.id]: Number(e.target.value) } })} />
                  <span className="t-small">{s.right}</span>
                </label>
              ))}
            </div>
          </Q>
          <Q title="Nivel de accesibilidad"><Choices multi={false} options={[{ id: 'AA', label: 'WCAG 2.2 AA', hint: 'La referencia legal y del sector más habitual.' }, { id: 'AAA', label: 'WCAG 2.2 AAA', hint: 'Contraste más estricto; para sector público o salud.' }]} value={b.a11y} onChange={up('a11y')} /></Q>
          <Q title="Modo oscuro"><Choices multi={false} options={[{ id: 'yes', label: 'Desde el primer día' }, { id: 'later', label: 'Más adelante' }, { id: 'no', label: 'No hace falta' }]} value={b.darkMode} onChange={up('darkMode')} /></Q>
          <Q title="¿Algo más que debamos saber?" help="Plazos, requisitos legales, código heredado…">
            <textarea id="brief-constraints" className="input" value={b.constraints} onChange={(e) => up('constraints')(e.target.value)} placeholder="Lanzamiento en el 2.º trimestre; debe soportar idiomas de derecha a izquierda." />
          </Q>
        </>
      );
    default:
      return null;
  }
}

/** Whether a step has at least its key answer filled in. */
function answered(stepId, b) {
  switch (stepId) {
    case 'why': return b.goals.length > 0;
    case 'scope': return !!b.team && b.productType.length > 0;
    case 'start': return !!b.approach;
    case 'people': return b.stakeholders.length > 0;
    case 'principles': return b.principles.length > 0;
    case 'personality': return true;
    default: return false;
  }
}

function Wizard({ brand, onFinish, onSkip }) {
  const [i, setI] = useState(0);
  const [b, setB] = useState(() => ({ ...structuredClone(EMPTY_BRIEF), ...(brand.brief ?? {}), personality: { ...EMPTY_BRIEF.personality, ...(brand.brief?.personality ?? {}) } }));
  const step = WIZARD_STEPS[i];
  const last = i === WIZARD_STEPS.length - 1;
  const go = (n) => { setI(n); document.querySelector('.main')?.scrollTo?.(0, 0); };
  return (
    <div className="page wizard">
      <header className="page-hd" style={{ alignItems: 'flex-start' }}>
        <div>
                    <h1 className="t-h2">Sienta las bases</h1>
          <p className="muted" style={{ maxWidth: 680, marginTop: 8 }}>Tokenforge crea tu sistema de diseño en cinco pasos. Empiezas aquí: seis preguntas, unos cinco minutos, que generan colores, tipografía, espaciado y una lista de componentes a tu medida. Todo se guarda solo y lo puedes cambiar después.</p>
          <ol className="orient" aria-label="Los cinco pasos">
            {['Bases', 'Foundations', 'Componentes', 'Tablero', 'Exportar'].map((t, k) => <li key={t} className={k === 0 ? 'on' : ''}><span>{k + 1}</span>{t}{k === 0 && <em>Ahora</em>}</li>)}
          </ol>
          <p className="orient-out"><Icon name="download" size={14} />Al final te llevas: tokens.css, Tailwind, archivo para Figma, motion.js, BRIEF.md y una guía para agentes de IA.</p>
        </div>
      </header>
      <div className="wiz-layout">
        <aside className="wiz-rail" aria-label="Progreso del cuestionario">
          <div className="wiz-progress">
            <div className="wp-row"><span>Paso {i + 1} de {WIZARD_STEPS.length}</span><b className="tnum">{Math.round(((i + (answered(step.id, b) ? 1 : 0)) / WIZARD_STEPS.length) * 100)} %</b></div>
            <div className="wp-track" role="progressbar" aria-valuemin={0} aria-valuemax={WIZARD_STEPS.length} aria-valuenow={i + 1}><i style={{ width: `${((i + (answered(step.id, b) ? 1 : 0)) / WIZARD_STEPS.length) * 100}%` }} /></div>
          </div>
          <ol className="vsteps">
            {WIZARD_STEPS.map((s, k) => {
              const ok = answered(s.id, b);
              const state = k === i ? 'cur' : k < i ? (ok ? 'done' : 'skipped') : 'todo';
              return (
                <li key={s.id} className={state}>
                  <button onClick={() => go(k)} aria-current={k === i ? 'step' : undefined}>
                    <span className="vn" aria-hidden="true">{k < i && ok ? <Icon name="check" size={14} stroke={2.6} /> : k + 1}</span>
                    <span className="vt">
                      <b>{s.title}</b>
                      {k === i && <span className="vd">{s.intro}</span>}
                      {k < i && <span className={`vs ${ok ? '' : 'warn'}`}>{ok ? 'Respondido' : 'Sin responder'}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <button className="wiz-skip" onClick={onSkip} title="Pasarás a Foundations con valores por defecto; puedes volver a las preguntas cuando quieras.">Saltar y usar valores por defecto<Icon name="chevRight" size={14} /></button>
        </aside>
        <div className="card wcard">
          <h2 className="t-h3">{step.title}</h2>
          
          <div className="wbody"><StepBody step={step.id} b={b} set={setB} /></div>
          <div className="wnav">
            <button className="btn outline" onClick={() => go(i - 1)} disabled={i === 0}><Icon name="chevLeft" size={14} />Atrás</button>
            <span className="t-small faint">{i + 1} de {WIZARD_STEPS.length}</span>
            {last
              ? <button className="btn primary" onClick={() => onFinish(b)}><Icon name="sparkles" size={14} />Generar mi sistema</button>
              : <button className="btn primary" onClick={() => go(i + 1)}>Siguiente<Icon name="chevRight" size={14} /></button>}
          </div>
        </div>
      </div>
    </div>
  );
}

const ES_VAL = { compact: 'compacta', snug: 'ajustada', default: 'normal', comfortable: 'cómoda', spacious: 'amplia', none: 'ninguna', subtle: 'sutil', medium: 'media', strong: 'fuerte', snappy: 'ágil', standard: 'estándar', expressive: 'expresivo' };
const lbl = (list, id) => QUESTIONS[list].find((x) => x.id === id)?.label ?? id;

function Summary({ sys, brand, onEdit, go }) {
  const b = brand.brief;
  const scope = recommendedScope(b);
  const pr = b.principles.map((id) => QUESTIONS.principles.find((x) => x.id === id)).filter(Boolean);
  const roadmap = [
    { t: 'Bases', d: 'Brief acordado: objetivos, alcance, enfoque, personas y principios.', done: true, to: null },
    { t: 'Foundations', d: 'Revisa color, tipografía, espaciado, radio, elevación y la auditoría de contraste.', to: 'foundations' },
    { t: 'Componentes', d: `${brand.components.length} componentes propuestos para tu producto. Añade o quita los que quieras.`, to: 'components' },
    { t: 'Tablero', d: 'Revisa todo junto, en claro y en oscuro.', to: 'board' },
    { t: 'Exportar y desplegar', d: 'Entrega los tokens, el BRIEF.md y el AGENTS.md, y compártelos con tus defensores.', to: 'code' },
  ];
  return (
    <div className="page">
      <header className="page-hd">
        <div>
                    <h1 className="t-h2">Brief de {brand.name}</h1>
          <p className="muted" style={{ marginTop: 8, maxWidth: 640 }}>Un sistema de diseño para {scaleLabel(b)}. Tus respuestas han generado la primera versión de las foundations y la lista de componentes.</p>
        </div>
        <button className="btn outline sm" onClick={onEdit}><Icon name="edit" size={14} />Editar respuestas</button>
      </header>

      <section className="fd-sec">
        <div className="brief-grid">
          <div className="card">
            <h3 className="card-t">Por qué</h3>
            <ul className="blist">{b.goals.length ? b.goals.map((g) => <li key={g}>{lbl('goals', g)}</li>) : <li className="faint">Sin objetivos elegidos</li>}</ul>
            {b.why && <p className="t-small muted quote">“{b.why}”</p>}
          </div>
          <div className="card">
            <h3 className="card-t">Métricas de éxito</h3>
            <ul className="blist">{b.success.length ? b.success.map((g) => <li key={g}>{lbl('success', g)}</li>) : <li className="faint">Ninguna todavía</li>}</ul>
          </div>
          <div className="card">
            <h3 className="card-t">Alcance</h3>
            <div className="row" style={{ marginBottom: 8 }}><span className="badge accent">{scope.level}</span></div>
            <p className="t-small muted">{scope.text}</p>
            <p className="t-small" style={{ marginTop: 8 }}>{[...b.productType.map((x) => lbl('productType', x)), ...b.platforms.map((x) => lbl('platforms', x))].join(' · ') || '—'}</p>
          </div>
          <div className="card">
            <h3 className="card-t">Punto de partida</h3>
            <p className="t-small"><b>{b.approach ? lbl('approach', b.approach) : 'Sin elegir'}</b>{b.approach === 'adopt' && b.framework ? ` — ${systemLabel(b.framework)}` : ''}</p>
            <p className="t-small muted" style={{ marginTop: 8 }}>Recursos: {b.assets.map((x) => lbl('assets', x)).join(', ') || 'ninguno'}</p>
            <p className="t-small muted" style={{ marginTop: 8 }}>Personas: {b.stakeholders.map((x) => lbl('stakeholders', x)).join(', ') || '—'}</p>
            <p className="t-small muted" style={{ marginTop: 8 }}>Tecnología: {b.stack.map((x) => lbl('stack', x)).join(', ') || '—'}</p>
          </div>
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Principios</h2>
        <Live className="princ-grid">
          {pr.length ? pr.map((x, k) => (
            <div key={x.id} className={`princ p${k}`}><span className="t-caption">Principio {k + 1}</span><b className="t-h3">{x.label}</b><p className="t-small">{x.hint}</p></div>
          )) : <p className="t-small faint">No has elegido principios. <button className="link" onClick={onEdit} style={{ background: 'none', border: 0, padding: 0, font: 'inherit' }}>Añádelos</button>.</p>}
        </Live>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Foundations propuestas</h2>
        <div className="found-row">
          <div><span className="t-caption faint">Acento</span><b className="row" style={{ gap: 8 }}><i className="dot" style={{ background: brand.colors.accent }} />{brand.colors.accent}</b></div>
          <div><span className="t-caption faint">Tipografía</span><b>{sys.fonts.heading} / {sys.fonts.body}</b></div>
          <div><span className="t-caption faint">Densidad</span><b>{ES_VAL[brand.density]} · texto a {sys.type.desktop.body.size}px</b></div>
          <div><span className="t-caption faint">Radio</span><b>{sys.radius.boxes}/{sys.radius.fields}/{sys.radius.selectors}px</b></div>
          <div><span className="t-caption faint">Elevación · movimiento</span><b>{ES_VAL[brand.shadow]} · {ES_VAL[brand.motion]}</b></div>
          <div><span className="t-caption faint">Accesibilidad</span><b>WCAG {b.a11y} · {sys.audit.filter((r) => r.wcagPass).length}/{sys.audit.length} pares cumplen</b></div>
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Hoja de ruta</h2>
        <ol className="roadmap">
          {roadmap.map((r, k) => (
            <li key={r.t} className={r.done ? 'done' : ''}>
              <span className="n">{r.done ? <Icon name="check" size={12} stroke={3} /> : k + 1}</span>
              <div style={{ flex: 1 }}><b>{r.t}</b><p className="t-small muted">{r.d}</p></div>
              {r.to && <button className="btn outline sm" onClick={() => go(r.to)}>Abrir<Icon name="chevRight" size={14} /></button>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default function Brief({ sys, brand, setBrand, go }) {
  const [editing, setEditing] = useState(!brand.brief?.done);
  if (editing) {
    return (
      <Wizard key={brand.id} brand={brand}
        onFinish={(answers) => { setBrand(recommend(answers, brand)); setEditing(false); document.querySelector('.main')?.scrollTo?.(0, 0); }}
        onSkip={() => go('foundations')} />
    );
  }
  return <Summary sys={sys} brand={brand} onEdit={() => setEditing(true)} go={go} />;
}
