import { useState } from 'react';
import { STARTERS } from '../store.js';
import { Icon } from '../components/Icons.jsx';
import { COMPONENTS } from '../engine/catalog.js';
import { tokenCount } from '../engine/tokens.js';

export default function Home({ sys, brands, activeId, go, onStarter, onNew, onSelect, onDelete, onDuplicate }) {
  const [confirmId, setConfirmId] = useState(null);
  const steps = [
    { n: '01', t: 'Foundations', d: 'Colour ramps in light and dark, semantic roles solved for contrast, type scale with density, spacing per viewport, radius on three axes, elevation and motion.', to: 'foundations', ic: 'palette' },
    { n: '02', t: 'Components', d: `${COMPONENTS.length} components from the shared inventory of the leading design systems. Pick yours, tune their tokens, see every variant and state.`, to: 'components', ic: 'grid' },
    { n: '03', t: 'Board', d: 'Every component you picked, on one wall, painted live with your foundations.', to: 'board', ic: 'layers' },
    { n: '04', t: 'Export', d: 'CSS variables, W3C JSON, Figma (Tokens Studio → Variables), Tailwind and an AGENTS.md for AI coding agents.', to: 'code', ic: 'code' },
  ];
  return (
    <div className="page home">
      <section className="hero">
        <span className="eyebrow">Design system builder</span>
        <h1 className="t-display">From one accent to a whole design system.</h1>
        <p className="t-lead muted" style={{ maxWidth: 640 }}>Build foundations from scratch, assemble a component library based on what the best systems ship, and export it to code, Figma and your AI agent.</p>
        <div className="row" style={{ marginTop: 20 }}>
          <button className="btn primary lg" onClick={() => go('foundations')}><Icon name="rocket" size={16} />Start building</button>
          <button className="btn outline lg" onClick={onNew}><Icon name="plus" size={16} />New brand</button>
        </div>
        <div className="stats">
          <div><b>{tokenCount(sys)}</b><span>tokens generated</span></div>
          <div><b>{COMPONENTS.length}</b><span>components in the catalogue</span></div>
          <div><b>{Object.keys(sys.appearances.light.roles).length}</b><span>semantic roles</span></div>
          <div><b>{sys.audit.filter((r) => r.wcagPass).length}/{sys.audit.length}</b><span>contrast checks passing</span></div>
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">How it works</h2>
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
        <h2 className="t-h3">Start from a direction</h2>
        <p className="muted t-small">Starting points that echo the character of well-known systems. Applies to the current brand; tweak anything afterwards.</p>
        <div className="starter-grid">
          {STARTERS.map((s) => (
            <button key={s.id} className="card starter interactive" onClick={() => onStarter(s)}>
              <span className="starter-sw" style={{ background: s.brand.colors.accent, borderRadius: { none: 0, subtle: 4, soft: 8, rounded: 12, large: 18, pill: 999 }[s.brand.radius.fields] }} />
              <div><b className="t-small" style={{ fontFamily: `'${s.brand.headingFont}'` }}>{s.name}</b><div className="help">{s.note}</div></div>
            </button>
          ))}
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Your brands</h2>
        <div className="brand-list">
          {brands.map((b) => (
            <div key={b.id} className={`card brand-item ${b.id === activeId ? 'on' : ''}`}>
              <div className="brand-sw">{['accent', 'neutral', 'success', 'critical', 'warning', 'info'].map((f) => <i key={f} style={{ background: b.colors[f] }} />)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b className="t-small">{b.name}</b>
                <div className="help">{b.font} · {b.components?.length ?? 0} components</div>
              </div>
              {b.id === activeId ? <span className="badge accent">Editing</span> : <button className="btn outline sm" onClick={() => onSelect(b.id)}>Open</button>}
              <button className="btn ghost icon sm" aria-label="Duplicate" title="Duplicate" onClick={() => onDuplicate(b.id)}><Icon name="copy" size={14} /></button>
              {brands.length > 1 && (confirmId === b.id
                ? <><button className="btn destructive sm" onClick={() => { onDelete(b.id); setConfirmId(null); }}>Delete</button><button className="btn ghost sm" onClick={() => setConfirmId(null)}>Cancel</button></>
                : <button className="btn ghost icon sm" aria-label="Delete" title="Delete" onClick={() => setConfirmId(b.id)}><Icon name="trash" size={14} /></button>)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
