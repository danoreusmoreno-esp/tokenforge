import { useState } from 'react';
import { QUESTIONS, PERSONALITY, WIZARD_STEPS, EMPTY_BRIEF, recommend, recommendedScope, scaleLabel } from '../engine/brief.js';
import { SYSTEMS, FEATURED, systemLabel } from '../engine/catalog.js';
import { Icon } from '../components/Icons.jsx';

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
          <Q title="What problems should it solve?" help="Choose all that apply.">
            <Choices options={QUESTIONS.goals} value={b.goals} onChange={up('goals')} />
          </Q>
          <Q title="In your own words, why now?" help="Optional. One or two sentences you could say to leadership.">
            <textarea id="brief-why" className="input" value={b.why} onChange={(e) => up('why')(e.target.value)} placeholder="Our checkout, admin and app look like three different companies, and every rebrand takes a month." />
          </Q>
          <Q title="How will you know it is working?" help="Pick the measures you will track.">
            <Choices options={QUESTIONS.success} value={b.success} onChange={up('success')} />
          </Q>
        </>
      );
    case 'scope':
      return (
        <>
          <Q title="How big is the team that will use it?"><Choices multi={false} options={QUESTIONS.team} value={b.team} onChange={up('team')} /></Q>
          <Q title="How many products or brands?"><Choices multi={false} options={QUESTIONS.products} value={b.products} onChange={up('products')} /></Q>
          <Q title="What kind of product is it?" help="Choose all that apply. This decides which components you start with."><Choices options={QUESTIONS.productType} value={b.productType} onChange={up('productType')} /></Q>
          <Q title="Which platforms?"><Choices options={QUESTIONS.platforms} value={b.platforms} onChange={up('platforms')} /></Q>
        </>
      );
    case 'start':
      return (
        <>
          <Q title="Which approach fits you?" help="There is no wrong answer. It depends on your time, people and long-term goals.">
            <Choices multi={false} options={QUESTIONS.approach} value={b.approach} onChange={up('approach')} />
          </Q>
          {b.approach === 'adopt' && (
            <Q title="Which system would you adapt?">
              <Choices multi={false} options={FEATURED.map((k) => ({ id: k, label: SYSTEMS[k].name, hint: SYSTEMS[k].org }))} value={b.framework} onChange={up('framework')} />
            </Q>
          )}
          {b.approach === 'audit' && (
            <div className="alert info"><Icon name="info" size={16} /><div><b>Do a visual inventory</b>Screenshot every colour, font, icon, button, form and pattern across platforms, including states. Group them and mark duplicates: those are the first things to consolidate.</div></div>
          )}
          <Q title="What do you already have?" help="Reuse it as the starting point.">
            <Choices options={QUESTIONS.assets} value={b.assets} onChange={up('assets')} />
          </Q>
          <div className="q-row">
            <label className="field" htmlFor="brief-color">
              <span className="label">Brand colour</span>
              <div className="input"><input id="brief-color" value={b.brandColor} onChange={(e) => up('brandColor')(e.target.value)} placeholder="#0f62fe" />
                <label className="swatch-sm" style={{ background: /^#?[0-9a-f]{6}$/i.test(b.brandColor) ? (b.brandColor.startsWith('#') ? b.brandColor : `#${b.brandColor}`) : 'var(--bg-muted)' }}>
                  <input type="color" aria-label="Pick brand colour" onChange={(e) => up('brandColor')(e.target.value)} />
                </label>
              </div>
              <span className="help">Optional. Becomes your accent.</span>
            </label>
            <label className="field" htmlFor="brief-font">
              <span className="label">Brand font</span>
              <input id="brief-font" className="input" value={b.brandFont} onChange={(e) => up('brandFont')(e.target.value)} placeholder="e.g. Manrope (Google Fonts name)" />
              <span className="help">Optional. Leave empty and we suggest one.</span>
            </label>
          </div>
        </>
      );
    case 'people':
      return (
        <>
          <Q title="Who should be involved?" help="Find champions outside design too: engineering, product, support. Many systems start with one person.">
            <Choices options={QUESTIONS.stakeholders} value={b.stakeholders} onChange={up('stakeholders')} />
          </Q>
          <Q title="What will you build it with?"><Choices options={QUESTIONS.stack} value={b.stack} onChange={up('stack')} /></Q>
        </>
      );
    case 'principles':
      return (
        <Q title={`Your principles (${b.principles.length}/3)`} help="Good principles start with a why, are specific, and translate into practice.">
          <Choices options={QUESTIONS.principles} value={b.principles} onChange={up('principles')} max={3} />
        </Q>
      );
    case 'personality':
      return (
        <>
          <Q title="Personality" help="Drag each slider. They set type, radius, density, shadow and motion.">
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
          <Q title="Accessibility target"><Choices multi={false} options={[{ id: 'AA', label: 'WCAG 2.2 AA', hint: 'The common legal and industry baseline.' }, { id: 'AAA', label: 'WCAG 2.2 AAA', hint: 'Stricter contrast; for public sector or health.' }]} value={b.a11y} onChange={up('a11y')} /></Q>
          <Q title="Dark mode"><Choices multi={false} options={[{ id: 'yes', label: 'From day one' }, { id: 'later', label: 'Later' }, { id: 'no', label: 'Not needed' }]} value={b.darkMode} onChange={up('darkMode')} /></Q>
          <Q title="Anything else we should know?" help="Deadlines, legal requirements, legacy code…">
            <textarea id="brief-constraints" className="input" value={b.constraints} onChange={(e) => up('constraints')(e.target.value)} placeholder="Launch in Q2; must support right-to-left languages." />
          </Q>
        </>
      );
    default:
      return null;
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
          <span className="eyebrow">Step 1 · Bases</span>
          <h1 className="t-h2">Set the bases</h1>
          <p className="muted" style={{ maxWidth: 620, marginTop: 6 }}>Before colours and components, agree on why you are building a design system, for whom, and what it should achieve. Six short questions; about five minutes.</p>
        </div>
        <button className="btn ghost sm" onClick={onSkip}>Skip for now</button>
      </header>
      <ol className="wsteps" aria-label="Progress">
        {WIZARD_STEPS.map((s, k) => (
          <li key={s.id} className={k === i ? 'cur' : k < i ? 'done' : ''}>
            <button onClick={() => go(k)} aria-current={k === i ? 'step' : undefined}>
              <span className="n">{k < i ? <Icon name="check" size={12} stroke={3} /> : k + 1}</span><span className="t">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="card wcard">
        <h2 className="t-h3">{step.title}</h2>
        <p className="muted t-small" style={{ marginTop: 4 }}>{step.intro}</p>
        <div className="wbody"><StepBody step={step.id} b={b} set={setB} /></div>
        <div className="wnav">
          <button className="btn outline" onClick={() => go(i - 1)} disabled={i === 0}><Icon name="chevLeft" size={14} />Back</button>
          <span className="t-small faint">{i + 1} of {WIZARD_STEPS.length}</span>
          {last
            ? <button className="btn primary" onClick={() => onFinish(b)}><Icon name="sparkles" size={14} />Generate my system</button>
            : <button className="btn primary" onClick={() => go(i + 1)}>Next<Icon name="chevRight" size={14} /></button>}
        </div>
      </div>
    </div>
  );
}

const lbl = (list, id) => QUESTIONS[list].find((x) => x.id === id)?.label ?? id;

function Summary({ sys, brand, onEdit, go }) {
  const b = brand.brief;
  const scope = recommendedScope(b);
  const pr = b.principles.map((id) => QUESTIONS.principles.find((x) => x.id === id)).filter(Boolean);
  const roadmap = [
    { t: 'Bases', d: 'Brief agreed: goals, scope, approach, people and principles.', done: true, to: null },
    { t: 'Foundations', d: 'Review colour, type, spacing, radius, elevation and the contrast audit.', to: 'foundations' },
    { t: 'Components', d: `${brand.components.length} components proposed for your product. Add or remove.`, to: 'components' },
    { t: 'Board', d: 'Check everything together, in light and dark.', to: 'board' },
    { t: 'Export and roll out', d: 'Ship tokens, BRIEF.md and AGENTS.md; share with your champions.', to: 'code' },
  ];
  return (
    <div className="page">
      <header className="page-hd">
        <div>
          <span className="eyebrow">Step 1 · Bases</span>
          <h1 className="t-h2">{brand.name} brief</h1>
          <p className="muted" style={{ marginTop: 6, maxWidth: 640 }}>A design system for {scaleLabel(b)}. Your answers set the first version of the foundations and the component list below.</p>
        </div>
        <button className="btn outline sm" onClick={onEdit}><Icon name="edit" size={14} />Edit answers</button>
      </header>

      <section className="fd-sec">
        <div className="brief-grid">
          <div className="card">
            <span className="eyebrow">Why</span>
            <ul className="blist">{b.goals.length ? b.goals.map((g) => <li key={g}>{lbl('goals', g)}</li>) : <li className="faint">No goals chosen</li>}</ul>
            {b.why && <p className="t-small muted quote">“{b.why}”</p>}
          </div>
          <div className="card">
            <span className="eyebrow">Success measures</span>
            <ul className="blist">{b.success.length ? b.success.map((g) => <li key={g}>{lbl('success', g)}</li>) : <li className="faint">None yet</li>}</ul>
          </div>
          <div className="card">
            <span className="eyebrow">Scope</span>
            <div className="row" style={{ marginBottom: 8 }}><span className="badge accent">{scope.level}</span></div>
            <p className="t-small muted">{scope.text}</p>
            <p className="t-small" style={{ marginTop: 8 }}>{[...b.productType.map((x) => lbl('productType', x)), ...b.platforms.map((x) => lbl('platforms', x))].join(' · ') || '—'}</p>
          </div>
          <div className="card">
            <span className="eyebrow">Starting point</span>
            <p className="t-small"><b>{b.approach ? lbl('approach', b.approach) : 'Not chosen'}</b>{b.approach === 'adopt' && b.framework ? ` — ${systemLabel(b.framework)}` : ''}</p>
            <p className="t-small muted" style={{ marginTop: 6 }}>Assets: {b.assets.map((x) => lbl('assets', x)).join(', ') || 'none'}</p>
            <p className="t-small muted" style={{ marginTop: 6 }}>People: {b.stakeholders.map((x) => lbl('stakeholders', x)).join(', ') || '—'}</p>
            <p className="t-small muted" style={{ marginTop: 6 }}>Stack: {b.stack.map((x) => lbl('stack', x)).join(', ') || '—'}</p>
          </div>
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Principles</h2>
        <div className="princ-grid">
          {pr.length ? pr.map((x, k) => (
            <div key={x.id} className={`princ p${k}`}><span className="t-caption">Principle {k + 1}</span><b className="t-h3">{x.label}</b><p className="t-small">{x.hint}</p></div>
          )) : <p className="t-small faint">No principles chosen. <button className="link" onClick={onEdit} style={{ background: 'none', border: 0, padding: 0, font: 'inherit' }}>Add them</button>.</p>}
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Proposed foundations</h2>
        <div className="found-row">
          <div><span className="t-caption faint">Accent</span><b className="row" style={{ gap: 6 }}><i className="dot" style={{ background: brand.colors.accent }} />{brand.colors.accent}</b></div>
          <div><span className="t-caption faint">Type</span><b>{sys.fonts.heading} / {sys.fonts.body}</b></div>
          <div><span className="t-caption faint">Density</span><b>{brand.density} · {sys.type.desktop.body.size}px body</b></div>
          <div><span className="t-caption faint">Radius</span><b>{sys.radius.boxes}/{sys.radius.fields}/{sys.radius.selectors}px</b></div>
          <div><span className="t-caption faint">Elevation · motion</span><b>{brand.shadow} · {brand.motion}</b></div>
          <div><span className="t-caption faint">Accessibility</span><b>WCAG {b.a11y} · {sys.audit.filter((r) => r.wcagPass).length}/{sys.audit.length} pairs pass</b></div>
        </div>
      </section>

      <section className="fd-sec">
        <h2 className="t-h3">Roadmap</h2>
        <ol className="roadmap">
          {roadmap.map((r, k) => (
            <li key={r.t} className={r.done ? 'done' : ''}>
              <span className="n">{r.done ? <Icon name="check" size={12} stroke={3} /> : k + 1}</span>
              <div style={{ flex: 1 }}><b>{r.t}</b><p className="t-small muted">{r.d}</p></div>
              {r.to && <button className="btn outline sm" onClick={() => go(r.to)}>Open<Icon name="chevRight" size={14} /></button>}
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
