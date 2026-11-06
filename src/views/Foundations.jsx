import { useState } from 'react';
import { FAMILIES } from '../engine/tokens.js';
import { wcag, apca } from '../engine/color.js';

const STEP_USE = ['App bg', 'Subtle bg', 'UI bg', 'Hover', 'Active', 'Subtle border', 'Border', 'Strong border', 'Solid', 'Solid hover', 'Low-contrast text', 'High-contrast text'];

function copy(t) { navigator.clipboard?.writeText(t).catch(() => {}); }

function Colors({ sys, appearance }) {
  const ap = sys.appearances[appearance];
  const roles = Object.entries(ap.roles);
  return (
    <>
      <section className="fd-sec">
        <h2 className="t-h3">Ramps</h2>
        <p className="muted t-small">Twelve steps per family, with a dark twin. Step 9 is the colour you typed.</p>
        <div className="ramp-table">
          <div className="ramp-row head"><span />{STEP_USE.map((u, i) => <span key={i} title={u}>{i + 1}</span>)}</div>
          {FAMILIES.map((f) => (
            <div key={f} className="ramp-row">
              <span className="t-caption">{f}</span>
              {ap.ramps[f].map((h, i) => (
                <button key={i} className="chip-sw" style={{ background: h, color: wcag('#fff', h) > 4.5 ? '#fff' : '#111' }} onClick={() => copy(`var(--color-${f}-${i + 1})`)} title={`--color-${f}-${i + 1}: ${h} (click to copy)`}>
                  <span>{h.slice(1)}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>
      <section className="fd-sec">
        <h2 className="t-h3">Semantic roles</h2>
        <p className="muted t-small">Use roles in product code, never raw ramp steps. Solid labels are solved for WCAG AA.</p>
        <div className="role-grid">
          {roles.map(([k, h]) => (
            <button key={k} className="role" onClick={() => copy(`var(--${k})`)} title="Copy CSS variable">
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
        <h2 className="t-h3">Type scale</h2>
        <div className="seg">{['desktop', 'tablet', 'mobile'].map((v) => <button key={v} className={v === vp ? 'on' : ''} onClick={() => setVp(v)}>{v}</button>)}</div>
      </div>
      <p className="muted t-small">Headings step down on smaller viewports; body text keeps its size.</p>
      <div className="type-list">
        {Object.entries(scale).reverse().map(([name, t]) => (
          <div key={name} className="type-row">
            <div className="type-meta"><b className="mono t-caption">{name}</b><span className="mono t-caption faint">{t.size}/{t.lineHeightPx} · {t.weight}</span></div>
            <div style={{ fontFamily: name === 'display' || name.startsWith('h') ? 'var(--font-heading)' : 'var(--font-body)', fontSize: t.size, lineHeight: `${t.lineHeightPx}px`, fontWeight: t.weight, letterSpacing: `${t.tracking}em`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name === 'display' ? 'Design tokens' : name.startsWith('h') ? 'Define your foundations' : 'Body text keeps its rhythm across every density and viewport.'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Spacing({ sys }) {
  return (
    <>
      <section className="fd-sec">
        <h2 className="t-h3">Spacing scale</h2>
        <p className="muted t-small">Multiples of a {sys.spacingUnit}px base unit.</p>
        <div className="space-list">
          {Object.entries(sys.spacing).map(([k, px]) => (
            <div key={k} className="space-row"><span className="mono t-caption">space-{k}</span><span className="bar" style={{ width: px }} /><span className="mono t-caption faint">{px}px</span></div>
          ))}
        </div>
      </section>
      <section className="fd-sec">
        <h2 className="t-h3">Layout per viewport</h2>
        <table className="tbl">
          <thead><tr><th>Token</th><th>Desktop</th><th>Tablet</th><th>Mobile</th></tr></thead>
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
        <h2 className="t-h3">Radius on three axes</h2>
        <div className="row" style={{ gap: 24, alignItems: 'flex-end' }}>
          {Object.entries(sys.radius).map(([k, r]) => (
            <div key={k} className="col" style={{ alignItems: 'center', gap: 8 }}>
              <div style={{ width: 96, height: k === 'boxes' ? 72 : k === 'fields' ? 40 : 28, borderRadius: Math.min(r, 48), border: '2px solid var(--accent-solid)', background: 'var(--accent-subtle)' }} />
              <span className="mono t-caption">radius-{k} · {r}px</span>
            </div>
          ))}
        </div>
      </section>
      <section className="fd-sec">
        <h2 className="t-h3">Elevation</h2>
        <div className="row" style={{ gap: 24 }}>
          {Object.entries(sh).map(([k, v]) => <div key={k} className="card" style={{ boxShadow: v, width: 140, height: 80, display: 'grid', placeItems: 'center', border: 0 }}><span className="mono t-caption">shadow-{k}</span></div>)}
        </div>
      </section>
      <section className="fd-sec">
        <h2 className="t-h3">Motion</h2>
        <div className="row" style={{ gap: 24 }}>
          {['fast', 'base', 'slow'].map((k) => (
            <div key={k} className="motion-demo"><span className="mono t-caption">duration-{k} · {sys.motion[k]}ms</span><div className="motion-track"><i style={{ animationDuration: `${Math.max(sys.motion[k], 1) * 6}ms`, animationTimingFunction: sys.motion.ease }} /></div></div>
          ))}
        </div>
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
      <h2 className="t-h3">Contrast audit</h2>
      <p className="muted t-small">Every key pair measured with WCAG 2 (AA 4.5:1 text, 3:1 non-text) and APCA (Lc 60 body text, 30 non-text). {fails === 0 ? 'All pairs pass WCAG.' : `${fails} pair(s) fail WCAG.`}</p>
      <table className="tbl">
        <thead><tr><th>Pair</th><th>Theme</th><th>Sample</th><th>WCAG 2</th><th>APCA</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td><b className="t-small">{r.label}</b><div className="mono t-caption faint">{r.fg} on {r.bg}</div></td>
              <td className="t-caption">{r.appearance}</td>
              <td><span className="sample" style={{ color: r.fgHex, background: r.bgHex }}>Aa</span></td>
              <td><span className={`badge ${r.wcagPass ? 'success' : 'critical'}`}>{r.ratio.toFixed(2)}:1 {r.wcagPass ? 'pass' : 'fail'}</span></td>
              <td><span className={`badge ${r.apcaPass ? 'success' : 'warning'}`}>Lc {r.lc.toFixed(0)} {r.apcaPass ? 'pass' : 'low'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export const FOUNDATION_TABS = [
  { id: 'color', label: 'Color', C: Colors },
  { id: 'type', label: 'Typography', C: Typography },
  { id: 'space', label: 'Spacing & layout', C: Spacing },
  { id: 'shape', label: 'Radius, elevation & motion', C: Shape },
  { id: 'contrast', label: 'Contrast', C: Contrast },
];

export default function Foundations({ sys, appearance, tab, setTab }) {
  const T = FOUNDATION_TABS.find((t) => t.id === tab) ?? FOUNDATION_TABS[0];
  return (
    <div className="page">
      <header className="page-hd">
        <div><span className="eyebrow">Step 2 · Foundations</span><h1 className="t-h2">Foundations</h1></div>
        <div className="tabs">{FOUNDATION_TABS.map((t) => <button key={t.id} className={t.id === T.id ? 'on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
      </header>
      <T.C sys={sys} appearance={appearance} />
    </div>
  );
}

export { apca };
