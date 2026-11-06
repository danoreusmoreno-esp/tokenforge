import { useState } from 'react';
import { COMPONENTS, CATEGORIES, SYSTEMS, FEATURED, CORE_IDS, systemLabel } from '../engine/catalog.js';
import { componentTokens } from '../engine/exporters.js';
import { Preview } from '../components/previews.jsx';
import { Icon } from '../components/Icons.jsx';

const TOTAL = FEATURED.length;

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
          <span className="mono t-caption">{c.names[k] ?? 'No direct equivalent'}</span>
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
          <span className="eyebrow">Step 2 · Components</span>
          <h1 className="t-h2">Component library</h1>
          <p className="muted t-small" style={{ maxWidth: 640, marginTop: 6 }}>
            {COMPONENTS.length} components drawn from {TOTAL} reference design systems. Each one shows what Material 3, Apple HIG, Polaris, Carbon, Fluent 2 and the rest call it. Pick the ones your system needs; each is painted with your tokens and ships with its own component tokens.
          </p>
        </div>
        <div className="row">
          <span className="badge accent">{brand.components.length} in system</span>
          <button className="btn outline sm" onClick={() => setComponents([...CORE_IDS])}>Core set</button>
          <button className="btn outline sm" onClick={() => setComponents(COMPONENTS.map((c) => c.id))}>Add all</button>
          <button className="btn ghost sm" onClick={() => setComponents([])}>Clear</button>
        </div>
      </header>
      <div className="tabs pill" style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
        {CATEGORIES.map((c) => <button key={c.id} className={filter === c.id ? 'on' : ''} onClick={() => setFilter(c.id)}>{c.name}</button>)}
      </div>
      <div className="sys-filter" role="group" aria-label="Filter by design system">
        <span className="t-caption faint">Seen in</span>
        <button className={sys === 'all' ? 'on' : ''} onClick={() => setSys('all')}>Any system</button>
        {FEATURED.map((k) => <button key={k} className={sys === k ? 'on' : ''} onClick={() => setSys(k)}>{systemLabel(k)} <span className="faint">{COMPONENTS.filter((c) => c.refs.includes(k)).length}</span></button>)}
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
                    <div className="t-caption faint row" style={{ gap: 6 }}><Coverage refs={c.refs} />{sys !== 'all' && c.names[sys] ? <span className="mono">{c.names[sys]}</span> : <span>{c.refs.length}/{TOTAL}{c.core ? ' · core' : ''}</span>}</div>
                  </div>
                  <label className="check" title={enabled.has(c.id) ? 'Remove from system' : 'Add to system'}>
                    <span className={`switch ${enabled.has(c.id) ? 'on' : ''}`} role="switch" aria-checked={enabled.has(c.id)} aria-label={`Include ${c.name}`} tabIndex={0}
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
  const snippet = `/* ${c.name} — uses your tokens */\n.${id} {\n${Object.entries(tokens).map(([k, val]) => `  --${id}-${k}: ${val};`).join('\n')}${Object.keys(tokens).length ? '\n' : ''}  font-family: var(--font-body);\n  border-radius: var(--radius-${['card', 'dialog', 'drawer', 'popover', 'alert', 'toast', 'table'].includes(id) ? 'boxes' : ['checkbox', 'radio', 'chip', 'tabs', 'segmented', 'badge'].includes(id) ? 'selectors' : 'fields'});\n  transition: all var(--duration-base) var(--ease-standard);\n}`;
  return (
    <div className="page">
      <button className="btn ghost sm" onClick={back} style={{ marginBottom: 12 }}><Icon name="chevLeft" size={14} />All components</button>
      <header className="page-hd">
        <div>
          <span className="eyebrow">{CATEGORIES.find((k) => k.id === c.cat).name}</span>
          <h1 className="t-h2">{c.name}</h1>
          <p className="muted" style={{ marginTop: 6, maxWidth: 620 }}>{c.desc}</p>
          <div style={{ marginTop: 10 }} className="row"><Coverage refs={c.refs} /><span className="t-caption faint">In {c.refs.length} of {TOTAL} reference systems</span></div>
        </div>
        <button className={`btn ${enabled ? 'outline' : 'primary'}`} onClick={() => setComponents(enabled ? brand.components.filter((x) => x !== id) : [...brand.components, id])}>
          <Icon name={enabled ? 'check' : 'plus'} size={14} />{enabled ? 'In your system' : 'Add to system'}
        </button>
      </header>

      <section className="fd-sec">
        <h2 className="t-h4">Playground</h2>
        <div className="playground">
          <div className="pg-stage"><Preview id={id} v={v} s={s} st={st} /></div>
          <div className="pg-controls">
            <label className="ins-field"><span>Variant</span><select value={v} onChange={(e) => setV(e.target.value)}>{c.variants.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="ins-field"><span>Size</span><select value={s} onChange={(e) => setS(e.target.value)}>{c.sizes.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label className="ins-field"><span>State</span><select value={st} onChange={(e) => setSt(e.target.value)}>{c.states.map((x) => <option key={x}>{x}</option>)}</select></label>
          </div>
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h4">Variants</h2>
        <div className="variant-grid">
          {c.variants.map((x) => (
            <div key={x} className="variant"><span className="t-caption faint mono">{x}</span><div className="variant-stage"><Preview id={id} v={x} s={s} st={c.states[0]} /></div></div>
          ))}
        </div>
      </section>

      {c.states.length > 1 && (
        <section className="fd-sec">
          <h2 className="t-h4">States</h2>
          <div className="variant-grid">
            {c.states.map((x) => (
              <div key={x} className="variant"><span className="t-caption faint mono">{x}</span><div className="variant-stage"><Preview id={id} v={v} s={s} st={x} /></div></div>
            ))}
          </div>
        </section>
      )}

      <section className="fd-sec">
        <h2 className="t-h4">In the reference systems</h2>
        <p className="muted t-small" style={{ marginBottom: 10 }}>What each system calls it. Open a row to read that system’s guidance.</p>
        <NamesTable c={c} />
      </section>

      <section className="fd-sec two-col">
        <div>
          <h2 className="t-h4">Component tokens</h2>
          <p className="muted t-small" style={{ marginBottom: 10 }}>Override per component. Everything else inherits from the foundations.</p>
          {Object.keys(c.tokens).length === 0 && <p className="t-small faint">This component only uses foundation tokens.</p>}
          {Object.entries(c.tokens).map(([k, def]) => {
            const cur = brand.componentTokens?.[id]?.[k] ?? def;
            return (
              <label key={k} className="tok-row">
                <span className="mono t-caption">--{id}-{k}</span>
                <input type="number" value={cur} onChange={(e) => setComponentToken(id, k, e.target.value === '' ? def : Number(e.target.value))} aria-label={`${id} ${k}`} />
                {cur !== def && <button className="btn ghost sm" onClick={() => setComponentToken(id, k, def)}>Reset</button>}
              </label>
            );
          })}
          <h2 className="t-h4" style={{ marginTop: 20 }}>Guidelines</h2>
          <ul className="t-small muted guide">
            <li>Visible focus ring on every interactive part: <code className="inl">--focus-ring</code>.</li>
            <li>Labels on solids use the matching <code className="inl">*-on-solid</code> role (AA checked).</li>
            <li>Respect <code className="inl">prefers-reduced-motion</code>; durations come from motion tokens.</li>
            {c.cat === 'actions' && <li>One primary action per view; destructive actions confirm first.</li>}
            {c.cat === 'inputs' && <li>Always pair with a visible label; errors explain how to fix.</li>}
            {c.cat === 'overlays' && <li>Trap focus while open, close on Escape, return focus to the trigger.</li>}
          </ul>
        </div>
        <div>
          <h2 className="t-h4">Snippet</h2>
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
