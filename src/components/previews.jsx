import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon, Spinner } from './Icons.jsx';
import { Live, MotionCfg } from './Live.jsx';
import { motionFor, defaultMotion } from '../engine/motion.js';

// The component-specific effect chosen for the preview being rendered.
const Effect = createContext('none');

/** Measures the active item so a highlight can slide to it (Motion's shared layout idea, in CSS). */
function useSlide(index) {
  const ref = useRef(null);
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    const el = ref.current?.querySelectorAll(':scope > button')[index];
    if (el) setBox({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
  }, [index]);
  return [ref, box];
}

/** Counts up to the value with the system spring when the effect is on. */
function AnimatedNumber({ value }) {
  const effect = useContext(Effect);
  const { spring } = useContext(MotionCfg);
  const [n, setN] = useState(effect === 'number' ? 0 : value);
  useEffect(() => {
    if (effect !== 'number' || matchMedia('(prefers-reduced-motion: reduce)').matches) { setN(value); return undefined; }
    const ms = Math.max(spring.ms * 2, 600);
    const t0 = performance.now();
    let raf;
    const tick = (t) => { const k = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - k, 4); setN(Math.round(value * e)); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [effect, value, spring.ms]);
  return <>{n}</>;
}

const BADGE_ES = { neutral: 'Neutro', primary: 'Primario', secondary: 'Secundario', tertiary: 'Terciario', success: 'Éxito', warning: 'Aviso', critical: 'Crítico', info: 'Info' };
const statusIcon = { info: 'info', success: 'check2', warning: 'alert', critical: 'alert' };

function Btn({ v = 'primary', s = 'md', st = 'default', children = 'Botón', icon = 'star' }) {
  const cls = `btn ${v} ${s === 'md' ? '' : s} ${st === 'hover' ? 'hover' : ''}`;
  return (
    <button className={cls} disabled={st === 'disabled'} style={st === 'focus' ? { outline: '2px solid var(--focus-ring)', outlineOffset: 2 } : undefined}>
      {st === 'loading' ? <Spinner size={14} /> : icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}

function Toggle({ initial = false }) {
  const [on, setOn] = useState(initial);
  return <span role="switch" aria-checked={on} tabIndex={0} className={`switch ${on ? 'on' : ''}`} onClick={() => setOn(!on)} onKeyDown={(e) => e.key === ' ' && setOn(!on)} />;
}

function Check({ on: initial, label, dis, radio, ind }) {
  const [on, setOn] = useState(initial);
  return (
    <label className="check" onClick={(e) => { e.preventDefault(); if (!dis) setOn(radio ? true : !on); }}>
      <span className={`box ${radio ? 'radio' : ''} ${on || ind ? 'on' : ''} ${dis ? 'dis' : ''}`}>
        {!radio && on && <Icon name="check" size={12} stroke={3} />}
        {!radio && ind && !on && <Icon name="minus" size={12} stroke={3} />}
      </span>
      <span style={dis ? { color: 'var(--text-disabled)' } : undefined}>{label}</span>
    </label>
  );
}

function Seg({ items = ['Día', 'Semana', 'Mes'] }) {
  const [i, setI] = useState(1);
  const slide = useContext(Effect) === 'sliding-bg';
  const [ref, box] = useSlide(i);
  return (
    <div className={`seg ${slide ? 'sliding' : ''}`} ref={ref}>
      {slide && box && <span className="m-ind" aria-hidden="true" style={{ width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` }} />}
      {items.map((t, k) => <button key={t} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{t}</button>)}
    </div>
  );
}

function Tabs({ pill, items = ['Resumen', 'Tokens', 'Componentes', 'Ajustes'] }) {
  const [i, setI] = useState(0);
  const slide = useContext(Effect) === 'sliding-bg';
  const [ref, box] = useSlide(i);
  return (
    <div className={`tabs ${pill ? 'pill' : ''} ${slide ? 'sliding' : ''}`} ref={ref}>
      {slide && box && <span className="m-ind" aria-hidden="true" style={pill ? { width: box.w, height: box.h, transform: `translate(${box.x}px, ${box.y}px)` } : { width: box.w - 16, transform: `translateX(${box.x + 8}px)` }} />}
      {items.map((t, k) => <button key={t} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{t}</button>)}
    </div>
  );
}

function Chips({ v }) {
  const [sel, setSel] = useState(['Diseño']);
  const items = ['Diseño', 'Desarrollo', 'Producto', 'Investigación'];
  if (v === 'static') return <div className="row">{items.map((t) => <span key={t} className="chip static">{t}</span>)}</div>;
  if (v === 'input') return <div className="row">{items.slice(0, 3).map((t) => <span key={t} className="chip">{t}<Icon name="x" size={12} /></span>)}</div>;
  return (
    <div className="row">
      {items.map((t) => (
        <span key={t} className={`chip ${sel.includes(t) ? 'on' : ''}`} onClick={() => setSel(sel.includes(t) ? sel.filter((x) => x !== t) : [...sel, t])}>
          {sel.includes(t) && <Icon name="check" size={12} stroke={2.5} />}{t}
        </span>
      ))}
    </div>
  );
}

function Acc() {
  const [o, setO] = useState(0);
  const items = [['¿Qué son los design tokens?', 'Valores con nombre para color, tipografía, espaciado y más, compartidos por diseño y código.'], ['¿Cómo se construye el modo oscuro?', 'Cada rampa tiene su gemelo oscuro; los roles apuntan al paso correcto en cada tema.'], ['¿Puedo exportarlo a Figma?', 'Sí, como sets de Tokens Studio que puedes llevar a las Variables de Figma.']];
  return <div className="acc">{items.map(([q, a], k) => (
    <div key={q}>
      <div className="hd" role="button" tabIndex={0} aria-expanded={o === k} onClick={() => setO(o === k ? -1 : k)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setO(o === k ? -1 : k))}>{q}<Icon name={o === k ? 'minus' : 'plus'} size={14} /></div>
      <div className={`bd-wrap ${o === k ? 'open' : ''}`}><div><div className="bd">{a}</div></div></div>
    </div>
  ))}</div>;
}

function Cal({ v }) {
  const days = [];
  for (let i = 0; i < 35; i++) days.push(i - 2);
  return (
    <div className="cal">
      {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => <span key={i} className="dow">{d}</span>)}
      {days.map((d, i) => {
        const out = d < 1 || d > 30;
        const sel = v === 'range' ? d === 10 || d === 16 : d === 12;
        const rng = v === 'range' && d > 10 && d < 16;
        return <span key={i} className={`${out ? 'out' : ''} ${d === 6 ? 'today' : ''} ${sel ? 'sel' : ''} ${rng ? 'rng' : ''}`}>{out ? (d < 1 ? 30 + d : d - 30) : d}</span>;
      })}
    </div>
  );
}

function Chart() {
  const a = [30, 42, 38, 55, 48, 62, 58, 70, 66, 78];
  const b = [20, 26, 30, 28, 36, 34, 40, 44, 42, 50];
  const path = (arr) => arr.map((y, i) => `${i ? 'L' : 'M'}${(i / (arr.length - 1)) * 280},${100 - y}`).join(' ');
  return (
    <svg viewBox="0 0 280 100" width="100%" height="100" preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={`${path(a)} L280,100 L0,100 Z`} fill="var(--primary-subtle)" />
      <path d={path(a)} fill="none" stroke="var(--primary-solid)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path d={path(b)} fill="none" stroke="var(--info-solid)" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}


function Rating({ v }) {
  const [val, setVal] = useState(4);
  const [hover, setHover] = useState(0);
  const shown = hover || val;
  return (
    <div className="rating" role={v === 'display' ? 'img' : 'radiogroup'} aria-label={`Valoración ${val} de 5`} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} className={i <= shown ? 'on' : ''} aria-label={`${i} estrella${i > 1 ? 's' : ''}`} disabled={v === 'display'}
          onMouseEnter={() => v !== 'display' && setHover(i)} onClick={() => setVal(i)}>
          <Icon name="star" size={20} />
        </button>
      ))}
      <span className="t-small muted">{val}.0</span>
    </div>
  );
}

function TokenField({ st }) {
  const [tokens, setTokens] = useState(['Maya Díaz', 'diseno@acme.com']);
  const [txt, setTxt] = useState('');
  return (
    <div className={`input tokens ${st === 'focus' ? 'focus' : ''}`} style={{ maxWidth: 340 }}>
      {tokens.map((t) => <span key={t} className="chip static">{t}<button aria-label={`Quitar ${t}`} onClick={() => setTokens(tokens.filter((x) => x !== t))}><Icon name="x" size={11} /></button></span>)}
      <input value={txt} placeholder="Añadir personas…" aria-label="Añadir token" onChange={(e) => setTxt(e.target.value)}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ',') && txt.trim()) { e.preventDefault(); setTokens([...tokens, txt.trim()]); setTxt(''); } }} />
    </div>
  );
}

function NavBar() {
  const [i, setI] = useState(0);
  const items = [['home', 'Inicio'], ['search', 'Buscar'], ['bell', 'Avisos', 3], ['user', 'Perfil']];
  return (
    <nav className="navbar" aria-label="Navegación inferior">
      {items.map(([ic, t, b], k) => (
        <button key={t} className={k === i ? 'on' : ''} onClick={() => setI(k)}>
          <span className="pill"><Icon name={ic} size={20} />{b && <span className="badge solid sm dot-badge">{b}</span>}</span>{t}
        </button>
      ))}
    </nav>
  );
}

function Rail() {
  const [i, setI] = useState(1);
  const items = [['home', 'Inicio'], ['palette', 'Tokens'], ['grid', 'Librería'], ['settings', 'Ajustes']];
  return (
    <nav className="rail-c" aria-label="Riel de navegación">
      <button className="btn fab icon" aria-label="Crear" style={{ '--fab-size': '48px', marginBottom: 8 }}><Icon name="edit" size={18} /></button>
      {items.map(([ic, t], k) => (
        <button key={t} className={k === i ? 'on' : ''} onClick={() => setI(k)}><span className="pill"><Icon name={ic} size={20} /></span>{t}</button>
      ))}
    </nav>
  );
}

function PageControl() {
  const [i, setI] = useState(1);
  return <div className="pagectl" role="tablist" aria-label="Páginas">{[0, 1, 2, 3, 4].map((k) => <button key={k} role="tab" aria-selected={k === i} aria-label={`Página ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>;
}

/** Renderers keyed by catalogue id. Each receives { v, s, st }. */
export const PREVIEWS = {
  button: ({ v, s, st }) => (v ? <Btn v={v} s={s} st={st} /> : (
    <div className="row"><Btn v="primary" /><Btn v="secondary" /><Btn v="outline" /><Btn v="ghost" /><Btn v="destructive" icon="trash">Eliminar</Btn></div>
  )),
  'icon-button': ({ v = 'solid', s = 'md', st }) => {
    const map = { solid: 'primary', outline: 'outline', ghost: 'ghost' };
    return <div className="row">{['edit', 'copy', 'trash', 'more'].map((n) => <button key={n} aria-label={n} disabled={st === 'disabled'} className={`btn icon ${map[v] ?? 'primary'} ${s === 'md' ? '' : s}`}><Icon name={n} size={16} /></button>)}</div>;
  },
  'button-group': ({ v }) => (
    <div className={v === 'spaced' ? 'row' : 'btn-group'}>
      {['Negrita', 'Cursiva', 'Subrayado'].map((t, i) => <button key={t} className={`btn outline sm ${i === 0 ? 'on' : ''}`}>{t}</button>)}
    </div>
  ),
  link: ({ v = 'inline' }) => v === 'inline'
    ? <p className="t-small">Lee las <a className="link">pautas de tokens</a> antes de publicar.</p>
    : <a className={`link ${v}`}>Ver todos los componentes <Icon name="chevRight" size={12} /></a>,
  fab: ({ v }) => <button className={`btn fab icon ${v === 'extended' ? 'ext' : ''}`} aria-label="Crear"><Icon name="plus" size={20} />{v === 'extended' && 'Crear'}</button>,

  'text-field': ({ v = 'outline', st = 'default' }) => (
    <div className="field" style={{ width: '100%', maxWidth: 320 }}>
      <label className="label">Email</label>
      <input className={`input ${v === 'filled' ? 'filled' : ''} ${st === 'focus' ? 'focus' : ''} ${st === 'error' ? 'error' : ''}`} disabled={st === 'disabled'} readOnly={st === 'read-only'}
        defaultValue={st === 'error' ? 'maya@' : ''} placeholder="maya@empresa.com" />
      <span className={`help ${st === 'error' ? 'err' : ''}`}>{st === 'error' ? 'Escribe un email válido.' : 'Nunca compartiremos tu email.'}</span>
    </div>
  ),
  textarea: ({ st }) => (
    <div className="field" style={{ width: '100%', maxWidth: 320 }}>
      <label className="label">Descripción</label>
      <textarea className={`input ${st === 'error' ? 'error' : ''}`} disabled={st === 'disabled'} placeholder="¿Para qué se usa este token?" />
    </div>
  ),
  select: ({ v, st }) => (
    <div className="field" style={{ width: '100%', maxWidth: 280 }}>
      <label className="label">País</label>
      <div className={`input select ${v === 'filled' ? 'filled' : ''} ${st === 'error' ? 'error' : ''} ${st === 'disabled' ? 'disabled' : ''} ${st === 'open' ? 'focus' : ''}`} tabIndex={0}>
        <span>España</span><Icon name="chevDown" size={16} />
      </div>
      {st === 'open' && <div className="menu"><div className="hover">España <Icon name="check" size={14} style={{ marginLeft: 'auto' }} /></div><div>Portugal</div><div>Francia</div></div>}
    </div>
  ),
  combobox: ({ v }) => (
    <div className="col" style={{ width: '100%', maxWidth: 280, gap: 8 }}>
      <div className="input focus">{v === 'multi' && <span className="chip static" style={{ height: 24 }}>React</span>}<input defaultValue="Re" aria-label="Buscar framework" /></div>
      <div className="menu"><div className="hover"><b>Re</b>act</div><div><b>Re</b>mix</div><div>P<b>re</b>act</div></div>
    </div>
  ),
  search: ({ v }) => <div className={`input with-icon ${v === 'filled' ? 'filled' : ''}`} style={{ maxWidth: 300 }}><Icon name="search" size={16} /><input placeholder="Buscar tokens…" aria-label="Buscar" /><kbd>⌘K</kbd></div>,
  'number-input': () => <div className="num"><input className="input" defaultValue="16" aria-label="Cantidad" /><button className="btn outline icon" aria-label="Restar"><Icon name="minus" size={14} /></button><button className="btn outline icon" aria-label="Sumar"><Icon name="plus" size={14} /></button></div>,
  otp: ({ st }) => <div className="col" style={{ gap: 8 }}><div className="otp">{['8', '2', '4', st === 'default' ? '' : '9', '', ''].map((d, i) => <span key={i} className={i === 3 && st === 'default' ? 'on' : ''} style={st === 'error' ? { borderColor: 'var(--critical-solid)' } : undefined}>{d}</span>)}</div><span className="help">¿No te ha llegado el código? <a className="link">Reenviar</a></span></div>,
  'date-picker': ({ v }) => <div className="card" style={{ padding: 12, width: 'fit-content' }}><div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}><b className="t-small">Noviembre 2026</b><div className="row" style={{ gap: 4 }}><button className="btn ghost icon sm" aria-label="Anterior"><Icon name="chevLeft" size={14} /></button><button className="btn ghost icon sm" aria-label="Siguiente"><Icon name="chevRight" size={14} /></button></div></div><Cal v={v} /></div>,
  'file-upload': ({ st = 'idle' }) => (
    <div className="col" style={{ width: '100%', maxWidth: 340 }}>
      <div className={`drop ${st === 'dragging' ? 'drag' : ''}`}><Icon name="upload" size={20} /><b>Suelta archivos o <a className="link">explora</a></b><span className="help">PDF, PNG hasta 10 MB</span></div>
      {(st === 'uploading' || st === 'error') && <div className="row" style={{ flexWrap: 'nowrap' }}><Icon name="file" size={18} /><div style={{ flex: 1 }}><div className="row t-small" style={{ justifyContent: 'space-between' }}><span>brand-guide.pdf</span><span className="faint">{st === 'error' ? 'Error' : '60 %'}</span></div><div className={`progress ${st === 'error' ? 'err' : ''}`}><div style={{ width: '60%' }} /></div></div></div>}
    </div>
  ),
  slider: ({ v }) => (
    <div className="slider" style={{ width: '100%', maxWidth: 280 }}>
      <div className="track"><div className="fill" style={{ left: v === 'range' ? '25%' : 0, width: v === 'range' ? '45%' : '60%' }} />
        {v === 'range' && <div className="thumb" style={{ left: '25%' }} />}<div className="thumb" style={{ left: v === 'range' ? '70%' : '60%' }} /></div>
    </div>
  ),

  checkbox: ({ st }) => st && st !== 'default'
    ? <Check on={st === 'checked'} ind={st === 'indeterminate'} dis={st === 'disabled'} label="Comentarios en mis archivos" />
    : <div className="col" style={{ gap: 12 }}><Check on label="Comentarios en mis archivos" /><Check label="Nuevos miembros del equipo" /><Check ind label="Resumen semanal" /><Check dis label="Opción deshabilitada" /></div>,
  radio: ({ v }) => v === 'card'
    ? <div className="col" style={{ maxWidth: 320 }}>{[['Básico', 'Para particulares', true], ['Equipo', 'Hasta 20 puestos', false]].map(([t, d, on]) => <div key={t} className={`radio-card ${on ? 'on' : ''}`}><span className={`box radio ${on ? 'on' : ''}`} /><div><b className="t-small">{t}</b><div className="help">{d}</div></div></div>)}</div>
    : <div className="col" style={{ gap: 12 }}><Check radio on label="Claro" /><Check radio label="Oscuro" /><Check radio label="Sistema" /></div>,
  switch: () => <div className="col" style={{ gap: 12 }}>{[['Notificaciones', true], ['Publicación automática', false]].map(([l, on]) => <label key={l} className="check"><Toggle initial={on} />{l}</label>)}</div>,
  segmented: () => <Seg />,
  chip: ({ v }) => <Chips v={v} />,

  tabs: ({ v }) => <Tabs pill={v === 'pill'} />,
  breadcrumb: () => <nav className="crumbs" aria-label="Migas de pan"><a className="link subtle">Espacio</a><Icon name="chevRight" size={12} /><a className="link subtle">Tokens</a><Icon name="chevRight" size={12} /><b>Color</b></nav>,
  pagination: ({ v }) => v === 'simple'
    ? <div className="row"><button className="btn outline sm"><Icon name="chevLeft" size={14} />Anterior</button><span className="t-small muted">Página 2 de 8</span><button className="btn outline sm">Siguiente<Icon name="chevRight" size={14} /></button></div>
    : <div className="pager">{['‹', '1', '2', '3', '…', '8', '›'].map((p, i) => <button key={i} className={p === '2' ? 'on' : ''}>{p}</button>)}</div>,
  sidebar: () => (
    <nav className="nav" style={{ maxWidth: 'var(--sidebar-width, 240px)' }}>
      <div className="h">Espacio de trabajo</div>
      {[['home', 'Resumen'], ['palette', 'Tokens', 128], ['grid', 'Componentes', 46], ['settings', 'Ajustes']].map(([ic, t, c], i) => (
        <a key={t} className={i === 1 ? 'on' : ''}><Icon name={ic} size={16} />{t}{c && <span className="count">{c}</span>}</a>
      ))}
    </nav>
  ),
  topbar: () => <div className="topbar"><span className="logo" /><b className="t-small">Acme</b><div className="input with-icon" style={{ maxWidth: 220, height: 32 }}><Icon name="search" size={14} /><input placeholder="Buscar" aria-label="Buscar" /></div><div style={{ marginLeft: 'auto' }} className="row"><button className="btn ghost icon sm" aria-label="Notificaciones"><Icon name="bell" size={16} /></button><span className="avatar sm">MD</span></div></div>,
  stepper: () => (
    <div className="steps" style={{ width: '100%', maxWidth: 360 }}>
      <span className="dot done"><Icon name="check" size={12} stroke={3} /></span><span className="line done" />
      <span className="dot cur">2</span><span className="line" /><span className="dot">3</span>
    </div>
  ),
  menu: () => <div className="menu"><div><Icon name="edit" size={14} />Renombrar<kbd>R</kbd></div><div className="hover"><Icon name="copy" size={14} />Duplicar<kbd>⌘D</kbd></div><div><Icon name="download" size={14} />Exportar</div><hr /><div className="danger"><Icon name="trash" size={14} />Eliminar</div></div>,

  alert: ({ v }) => {
    const list = v ? [v] : ['info', 'success', 'warning', 'critical'];
    const txt = { info: ['Atención', 'Hay una nueva versión de los tokens.'], success: ['Publicado', 'Tus tokens ya están disponibles.'], warning: ['Contraste bajo', 'Dos pares no cumplen APCA en modo oscuro.'], critical: ['Error al publicar', 'Revisa tu conexión y vuelve a intentarlo.'] };
    return <div className="col" style={{ width: '100%' }}>{list.map((k) => <div key={k} className={`alert ${k}`} role="status"><Icon name={statusIcon[k]} size={16} /><div><b>{txt[k][0]}</b>{txt[k][1]}</div></div>)}</div>;
  },
  toast: ({ v = 'success' }) => (
    <div className={`toast ${v}`}><span className="ic"><Icon name={v === 'critical' ? 'alert' : 'check2'} size={18} /></span><div style={{ flex: 1 }}><b>{v === 'critical' ? 'Algo ha fallado' : 'Cambios guardados'}</b><div className="muted">{v === 'critical' ? 'No se han publicado los tokens.' : 'Tus tokens están al día.'}</div></div><button className="btn ghost icon sm" aria-label="Cerrar"><Icon name="x" size={14} /></button></div>
  ),
  badge: ({ v, s }) => v
    ? <span className={`badge ${v} ${s === 'sm' ? 'sm' : ''}`}><i />{BADGE_ES[v]}</span>
    : <div className="row">{['neutral', 'primary', 'secondary', 'tertiary', 'success', 'warning', 'critical', 'info'].map((k) => <span key={k} className={`badge ${k}`}>{BADGE_ES[k]}</span>)}<span className="badge solid">12</span></div>,
  progress: ({ v, st }) => v === 'circular'
    ? <svg className="ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg-active)" strokeWidth="5" /><circle cx="22" cy="22" r="18" fill="none" stroke={st === 'error' ? 'var(--critical-solid)' : 'var(--primary-solid)'} strokeWidth="5" strokeLinecap="round" strokeDasharray="113" strokeDashoffset="40" transform="rotate(-90 22 22)" /></svg>
    : <div className="col" style={{ width: '100%', maxWidth: 320, gap: 8 }}><div className="row t-small" style={{ justifyContent: 'space-between' }}><span>Subiendo…</span><span className="faint">64 %</span></div><div className={`progress ${st === 'error' ? 'err' : ''}`}><div style={{ width: '64%' }} /></div></div>,
  spinner: ({ s }) => <div className="row"><Spinner size={s === 'sm' ? 14 : s === 'lg' ? 32 : 22} /><span className="t-small muted">Cargando tokens…</span></div>,
  skeleton: () => <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', width: '100%', maxWidth: 320 }}><div className="skel" style={{ width: 40, height: 40, borderRadius: '50%', flex: 'none' }} /><div className="col" style={{ flex: 1, gap: 8 }}><div className="skel" style={{ height: 12, width: '70%' }} /><div className="skel" style={{ height: 12 }} /><div className="skel" style={{ height: 12, width: '40%' }} /></div></div>,
  'empty-state': () => <div className="empty"><div className="art"><Icon name="layers" size={22} /></div><b>Aún no hay componentes</b><p className="t-small muted">Añade tu primer componente para empezar tu librería.</p><button className="btn primary sm"><Icon name="plus" size={14} />Añadir componente</button></div>,

  dialog: ({ v }) => (
    <div className="scrim" style={{ width: '100%' }}>
      <div className="dialog" role="dialog" aria-label="Cambios sin guardar">
        <h3 className="t-h4">{v === 'destructive' ? '¿Eliminar esta marca?' : 'Cambios sin guardar'}</h3>
        <p className="t-small muted" style={{ marginTop: 8 }}>{v === 'destructive' ? 'Se borrarán todos los tokens y no se puede deshacer.' : '¿Quieres guardar o descartar los cambios?'}</p>
        <div className="actions"><button className="btn outline">Cancelar</button>{v === 'destructive' ? <button className="btn destructive">Eliminar</button> : <button className="btn primary">Guardar cambios</button>}</div>
      </div>
    </div>
  ),
  drawer: () => <div className="scrim" style={{ height: 220, padding: 0, display: 'flex', width: '100%' }}><div className="drawer"><div className="row" style={{ justifyContent: 'space-between' }}><b>Filtros</b><Icon name="x" size={16} /></div><Check on label="Publicados" /><Check label="Borradores" /><div style={{ marginTop: 'auto' }} className="row"><button className="btn primary sm block">Aplicar</button></div></div></div>,
  popover: () => <div className="popover"><b className="t-small">Compartir marca</b><p className="help" style={{ margin: '4px 0 12px' }}>Cualquiera con el enlace puede verla.</p><div className="input" style={{ height: 32 }}><input defaultValue="forge.app/b/acme" aria-label="Enlace" /><Icon name="copy" size={14} /></div></div>,
  tooltip: () => <div style={{ paddingTop: 4 }}><span className="tooltip">Copiar nombre del token</span></div>,

  card: ({ v = 'outline', st }) => (
    <div className={`card ${v} ${st === 'interactive' ? 'interactive' : ''}`} style={{ maxWidth: 300 }}>
      <div className="row" style={{ marginBottom: 12 }}><span className="avatar">AC</span><div><b className="t-small">Acme Design</b><div className="help">@acme</div></div></div>
      <p className="t-small muted">Un único origen: el mismo JSON que leen Figma, el CSS y tu agente.</p>
      <div className="row" style={{ marginTop: 12 }}><span className="t-small"><b>4</b> <span className="faint">Siguiendo</span></span><span className="t-small"><b>12.4K</b> <span className="faint">Seguidores</span></span></div>
    </div>
  ),
  table: ({ v }) => (
    <table className={`tbl ${v === 'zebra' ? 'zebra' : ''}`}>
      <thead><tr><th>Token</th><th>Valor</th><th>Estado</th></tr></thead>
      <tbody>
        {[['primary-solid', 'var', 'Publicado', 'success'], ['text-primary', 'var', 'Borrador', 'neutral'], ['border-strong', 'var', 'En revisión', 'warning'], ['focus-ring', 'var', 'Publicado', 'success']].map(([t, , s, k], i) => (
          <tr key={t} className={i === 1 ? 'sel' : ''}><td className="mono t-caption">{t}</td><td><span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 4, background: `var(--${t})`, verticalAlign: 'middle', border: '1px solid var(--border-subtle)' }} /></td><td><span className={`badge ${k}`}>{s}</span></td></tr>
        ))}
      </tbody>
    </table>
  ),
  list: () => <div className="list" style={{ width: '100%' }}>{[['MD', 'Maya Díaz', 'Diseñadora', ''], ['JL', 'Jon Lee', 'Desarrollador', 'c2'], ['AR', 'Ana Ruiz', 'Producto', 'c3']].map(([i, n, r, c]) => <div key={n}><span className={`avatar ${c}`}>{i}</span><div style={{ flex: 1 }}><b className="t-small">{n}</b><div className="help">{r}</div></div><button className="btn ghost icon sm" aria-label="Más"><Icon name="more" size={16} /></button></div>)}</div>,
  avatar: ({ s }) => (
    <div className="row">
      <span className={`avatar ${s === 'md' ? '' : s ?? 'lg'}`}>MD<span className="on" /></span>
      <div className="stack">{['AB', 'CD', 'EF', 'GH'].map((t, i) => <span key={t} className={`avatar c${i + 2}`}>{t}</span>)}<span className="avatar" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>+8</span></div>
    </div>
  ),
  stat: ({ st }) => (
    <div className="stat card" style={{ width: '100%', maxWidth: 320 }}>
      <div className="row stat-hd"><span className="t-small muted">Preparación del espacio</span><span className={`badge ${st === 'down' ? 'critical' : 'success'}`}>{st === 'down' ? '−3%' : '+6%'}</span></div>
      <div className="num" style={{ margin: '8px 0 12px' }}><AnimatedNumber value={98} /><span className="t-lead muted">%</span></div>
      <Chart />
    </div>
  ),
  accordion: () => <div style={{ width: '100%' }}><Acc /></div>,
  timeline: () => <div className="tl">{[['Publicada la v2.1', 'hace 2 min'], ['Primario cambiado a', 'hace 1 h'], ['Marca creada', 'Ayer']].map(([t, d], i) => <div key={t}><b>{t}</b> {i === 1 && <code className="inl">primary-9</code>}<div className="help">{d}</div></div>)}</div>,
  code: ({ v }) => v === 'inline'
    ? <p className="t-small">Usa <code className="inl">var(--primary-solid)</code> para los rellenos principales.</p>
    : <pre className="code">{`.button {\n  background: var(--primary-solid);\n  color: var(--primary-on-solid);\n  border-radius: var(--radius-fields);\n}`}</pre>,
  divider: ({ v }) => v === 'vertical'
    ? <div className="row" style={{ height: 24 }}><span className="t-small">Editar</span><span className="vdiv" /><span className="t-small">Compartir</span><span className="vdiv" /><span className="t-small">Exportar</span></div>
    : <div className="col" style={{ width: '100%' }}><span className="t-small">Arriba</span><hr className="div" /><span className="t-small">Abajo</span></div>,
  toolbar: ({ v }) => (
    <div className={`toolbar ${v === 'floating' ? 'floating' : ''}`} role="toolbar" aria-label="Formato">
      {['edit', 'copy', 'link'].map((n, i) => <button key={n} className={`btn ghost icon sm ${i === 0 ? 'on' : ''}`} aria-label={n}><Icon name={n} size={16} /></button>)}
      <span className="vdiv" />
      {['download', 'trash'].map((n) => <button key={n} className="btn ghost icon sm" aria-label={n}><Icon name={n} size={16} /></button>)}
      <span className="vdiv" />
      <button className="btn primary sm">Publicar</button>
    </div>
  ),
  'tag-input': ({ st }) => <TokenField st={st} />,
  rating: ({ v }) => <Rating v={v} />,
  'page-control': () => <PageControl />,
  'nav-rail': () => <Rail />,
  'nav-bar': () => <NavBar />,
  'save-bar': ({ st }) => (
    <div className="savebar" role="region" aria-label="Cambios sin guardar">
      <span className="row" style={{ gap: 8 }}><Icon name="alert" size={16} />Cambios sin guardar</span>
      <div className="row" style={{ gap: 8 }}><button className="btn outline sm on-dark">Descartar</button><button className="btn primary sm">{st === 'saving' ? <><Spinner size={12} />Guardando</> : 'Guardar'}</button></div>
    </div>
  ),
  'action-sheet': () => (
    <div className="scrim" style={{ width: '100%', alignItems: 'end', padding: 12 }}>
      <div className="col" style={{ width: '100%', maxWidth: 320, gap: 8 }}>
        <div className="asheet">
          <div className="asheet-title">Compartir «Tokens de Acme»</div>
          <button>Copiar enlace</button><button>Exportar como JSON</button><button className="danger">Eliminar marca</button>
        </div>
        <div className="asheet"><button style={{ fontWeight: 600 }}>Cancelar</button></div>
      </div>
    </div>
  ),
  kbd: () => <div className="row t-small">Buscar <kbd>⌘</kbd><kbd>K</kbd> · Publicar <kbd>⌘</kbd><kbd>⏎</kbd></div>,
};

const TARGETS = '.btn, .chip, .card, .toast, .fab, .dialog, .popover';

/**
 * A live preview with the component's motion: tap and hover gestures always,
 * the entrance only when asked (playground), and the component's own effect.
 */
export function Preview({ id, entrance = false, replay = 0, motion, ...props }) {
  const { brand, spring } = useContext(MotionCfg);
  const m = motion ?? (brand ? motionFor(brand, id) : defaultMotion(id));
  const R = PREVIEWS[id];
  const follow = m.hover === 'magnetic' || m.hover === 'tilt';
  const move = (e) => {
    const el = e.target.closest?.(TARGETS);
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.transition = 'transform 120ms cubic-bezier(.23,1,.32,1)';
    el.style.transform = m.hover === 'magnetic'
      ? `translate(${(dx * 10).toFixed(1)}px, ${(dy * 8).toFixed(1)}px)`
      : `perspective(600px) rotateX(${(-dy * 10).toFixed(1)}deg) rotateY(${(dx * 12).toFixed(1)}deg)`;
    el.dataset.followed = '1';
  };
  const leave = (e) => {
    e.currentTarget.querySelectorAll('[data-followed]').forEach((el) => {
      el.style.transition = `transform ${Math.max(spring.ms, 1)}ms ${spring.easing}`;
      el.style.transform = '';
      delete el.dataset.followed;
    });
  };
  return (
    <Live className={`preview m-${m.effect}`} data-tap={m.tap} data-hover={m.hover}
      style={{ '--m-spring': spring.easing, '--m-dur': `${Math.max(spring.ms, 1)}ms` }}
      onPointerMove={follow ? move : undefined} onPointerLeave={follow ? leave : undefined}>
      <Effect.Provider value={m.effect}>
        <div className="m-stage" key={replay} data-enter={entrance ? m.enter : 'none'}>
          {R ? <R {...props} /> : <span className="faint">Sin vista previa</span>}
        </div>
      </Effect.Provider>
    </Live>
  );
}
