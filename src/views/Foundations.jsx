import { useState } from 'react';
import { FAMILIES } from '../engine/tokens.js';
import { wcag, apca } from '../engine/color.js';
import { Live } from '../components/Live.jsx';

const VP = { desktop: 'Escritorio', tablet: 'Tablet', mobile: 'Móvil' };
const AUDIT_ES = {
  'Body text': 'Texto principal', 'Secondary text': 'Texto secundario', 'Tertiary text': 'Texto terciario',
  'Primary button label': 'Texto de botón principal', 'Link text': 'Enlace', 'Destructive button label': 'Texto de botón destructivo',
  'Success badge': 'Badge de éxito', 'Warning badge': 'Badge de aviso', 'Critical badge': 'Badge crítico', 'Info badge': 'Badge informativo',
  'Field border (non-text, 3:1)': 'Borde de campo (interfaz, 3:1)',
};
const STEP_USE = ['Fondo app', 'Fondo sutil', 'Fondo UI', 'Hover', 'Activo', 'Borde sutil', 'Borde', 'Borde fuerte', 'Sólido', 'Sólido hover', 'Texto bajo contraste', 'Texto alto contraste'];

function copy(t) { navigator.clipboard?.writeText(t).catch(() => {}); }

function Colors({ sys, appearance }) {
  const ap = sys.appearances[appearance];
  const roles = Object.entries(ap.roles);
  return (
    <>
      <section className="fd-sec">
        <h2 className="t-h3">Rampas</h2>
        <p className="muted t-small">Doce pasos por familia, con su gemelo oscuro. El paso 9 es el color que escribiste. Pulsa un color para copiar su variable.</p>
        <div className="ramp-table">
          <div className="ramp-row head"><span />{STEP_USE.map((u, i) => <span key={i} title={u}>{i + 1}</span>)}</div>
          {FAMILIES.map((f) => (
            <div key={f} className="ramp-row">
              <span className="t-caption">{f}</span>
              {ap.ramps[f].map((h, i) => (
                <button key={i} className="chip-sw" style={{ background: h, color: wcag('#fff', h) > 4.5 ? '#fff' : '#111' }} onClick={() => copy(`var(--color-${f}-${i + 1})`)} title={`--color-${f}-${i + 1}: ${h} (clic para copiar)`}>
                  <span>{h.slice(1)}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="fd-sec">
        <h2 className="t-h3">Roles semánticos</h2>
        <p className="muted t-small">En el producto usa roles, nunca pasos de la rampa. Los textos sobre sólidos ya cumplen WCAG AA.</p>
        <div className="role-grid">
          {roles.map(([k, h]) => (
            <button key={k} className="role" onClick={() => copy(`var(--${k})`)} title="Copiar variable CSS">
              <span className="role-sw" style={{ background: h }} />
              <span className="mono t-caption">--{k}</span>
              <span className="mono t-caption faint">{h}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function Typography({ sys }) {
  const [vp, setVp] = useState('desktop');
  const scale = sys.type[vp];
  return (
    <section className="fd-sec">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 className="t-h3">Escala tipográfica</h2>
        <div className="seg">{['desktop', 'tablet', 'mobile'].map((v) => <button key={v} className={v === vp ? 'on' : ''} onClick={() => setVp(v)}>{VP[v]}</button>)}</div>
      </div>
      <p className="muted t-small">Los títulos se reducen en pantallas pequeñas; el texto mantiene su tamaño.</p>
      <Live className="type-list stage-well">
        {Object.entries(scale).reverse().map(([name, t]) => (
          <div key={name} className="type-row">
            <div className="type-meta"><b className="mono t-caption">{name}</b><span className="mono t-caption faint">{t.size}/{t.lineHeightPx} · {t.weight}</span></div>
            <div style={{ fontFamily: name === 'display' || name.startsWith('h') ? 'var(--font-heading)' : 'var(--font-body)', fontSize: t.size, lineHeight: `${t.lineHeightPx}px`, fontWeight: t.weight, letterSpacing: `${t.tracking}em`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name === 'display' ? 'Tokens de diseño' : name.startsWith('h') ? 'Define tus foundations' : 'El texto mantiene su ritmo en cada densidad y pantalla.'}
            </div>
          </div>
        ))}
      </Live>
    </section>
  );
}

function Spacing({ sys }) {
  return (
    <>
      <section className="fd-sec">
        <h2 className="t-h3">Escala de espaciado</h2>
        <p className="muted t-small">Múltiplos de una unidad base de {sys.spacingUnit}px.</p>
        <div className="space-list">
          {Object.entries(sys.spacing).map(([k, px]) => (
            <div key={k} className="space-row"><span className="mono t-caption">space-{k}</span><span className="bar" style={{ width: px }} /><span className="mono t-caption faint">{px}px</span></div>
          ))}
        </div>
      </section>
      <section className="fd-sec">
        <h2 className="t-h3">Layout por dispositivo</h2>
        <table className="tbl">
          <thead><tr><th>Token</th><th>Escritorio</th><th>Tablet</th><th>Móvil</th></tr></thead>
          <tbody>{Object.keys(sys.layout.desktop).map((k) => <tr key={k}><td className="mono t-caption">--{k}</td>{['desktop', 'tablet', 'mobile'].map((v) => <td key={v}>{sys.layout[v][k]}px</td>)}</tr>)}</tbody>
        </table>
      </section>
    </>
  );
}

function Shape({ sys, appearance }) {
  const sh = sys.appearances[appearance].shadow;
  return (
    <>
      <section className="fd-sec">
        <h2 className="t-h3">Radio en tres ejes</h2>
        <Live className="row stage-well" style={{ gap: 24, alignItems: 'flex-end' }}>
          {Object.entries(sys.radius).map(([k, r]) => (
            <div key={k} className="col" style={{ alignItems: 'center', gap: 8 }}>
              <div style={{ width: 96, height: k === 'boxes' ? 72 : k === 'fields' ? 40 : 28, borderRadius: Math.min(r, 48), border: '2px solid var(--accent-solid)', background: 'var(--accent-subtle)' }} />
              <span className="mono t-caption">radius-{k} · {r}px</span>
            </div>
          ))}
        </Live>
      </section>
      <section className="fd-sec">
        <h2 className="t-h3">Elevación</h2>
        <Live className="row stage-well" style={{ gap: 24 }}>
          {Object.entries(sh).map(([k, v]) => <div key={k} className="card" style={{ boxShadow: v, width: 140, height: 80, display: 'grid', placeItems: 'center', border: 0 }}><span className="mono t-caption">shadow-{k}</span></div>)}
        </Live>
      </section>
      <section className="fd-sec">
        <h2 className="t-h3">Movimiento</h2>
        <Live className="row stage-well" style={{ gap: 24 }}>
          {['fast', 'base', 'slow'].map((k) => (
            <div key={k} className="motion-demo"><span className="mono t-caption">duration-{k} · {sys.motion[k]}ms</span><div className="motion-track"><i style={{ animationDuration: `${Math.max(sys.motion[k], 1) * 6}ms`, animationTimingFunction: sys.motion.ease }} /></div></div>
          ))}
        </Live>
        <p className="mono t-caption faint" style={{ marginTop: 8 }}>ease-standard: {sys.motion.ease}</p>
      </section>
    </>
  );
}

function Contrast({ sys }) {
  const rows = sys.audit;
  const fails = rows.filter((r) => !r.wcagPass).length;
  return (
    <section className="fd-sec">
      <h2 className="t-h3">Auditoría de contraste</h2>
      <p className="muted t-small">Cada par clave medido con WCAG 2 (AA 4,5:1 en texto, 3:1 en elementos de interfaz) y APCA (Lc 60 en texto, 30 en interfaz). {fails === 0 ? 'Todos los pares cumplen WCAG.' : `${fails} par(es) no cumplen WCAG.`}</p>
      <table className="tbl">
        <thead><tr><th>Par</th><th>Tema</th><th>Muestra</th><th>WCAG 2</th><th>APCA</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td><b className="t-small">{AUDIT_ES[r.label] ?? r.label}</b><div className="mono t-caption faint">{r.fg} sobre {r.bg}</div></td>
              <td className="t-caption">{r.appearance === 'light' ? 'claro' : 'oscuro'}</td>
              <td><span className="sample" style={{ color: r.fgHex, background: r.bgHex }}>Aa</span></td>
              <td><span className={`badge ${r.wcagPass ? 'success' : 'critical'}`}>{r.ratio.toFixed(2)}:1 {r.wcagPass ? 'cumple' : 'falla'}</span></td>
              <td><span className={`badge ${r.apcaPass ? 'success' : 'warning'}`}>Lc {r.lc.toFixed(0)} {r.apcaPass ? 'cumple' : 'bajo'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export const FOUNDATION_TABS = [
  { id: 'color', label: 'Color', C: Colors },
  { id: 'type', label: 'Tipografía', C: Typography },
  { id: 'space', label: 'Espaciado y layout', C: Spacing },
  { id: 'shape', label: 'Radio, elevación y movimiento', C: Shape },
  { id: 'contrast', label: 'Contraste', C: Contrast },
];

export default function Foundations({ sys, appearance, tab, setTab }) {
  const T = FOUNDATION_TABS.find((t) => t.id === tab) ?? FOUNDATION_TABS[0];
  return (
    <div className="page">
      <header className="page-hd">
        <div><h1 className="t-h2">Foundations</h1></div>
        <div className="seg-tabs" role="group" aria-label="Secciones">{FOUNDATION_TABS.map((t) => <button key={t.id} className={t.id === T.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
      </header>
      <T.C sys={sys} appearance={appearance} />
    </div>
  );
}

export { apca };
