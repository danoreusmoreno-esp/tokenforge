import { useState } from 'react';
import { Icon, Spinner } from './Icons.jsx';

const statusIcon = { info: 'info', success: 'check2', warning: 'alert', critical: 'alert' };

function Btn({ v = 'primary', s = 'md', st = 'default', children = 'Button', icon = 'star' }) {
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

function Seg({ items = ['Day', 'Week', 'Month'] }) {
  const [i, setI] = useState(1);
  return <div className="seg">{items.map((t, k) => <button key={t} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{t}</button>)}</div>;
}

function Tabs({ pill, items = ['Overview', 'Tokens', 'Components', 'Settings'] }) {
  const [i, setI] = useState(0);
  return <div className={`tabs ${pill ? 'pill' : ''}`}>{items.map((t, k) => <button key={t} className={k === i ? 'on' : ''} onClick={() => setI(k)}>{t}</button>)}</div>;
}

function Chips({ v }) {
  const [sel, setSel] = useState(['Design']);
  const items = ['Design', 'Engineering', 'Product', 'Research'];
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
  const items = [['What are design tokens?', 'Named values for colour, type, spacing and more, shared by design and code.'], ['How is dark mode built?', 'Every ramp has a dark twin; roles point to the right step in each appearance.'], ['Can I export to Figma?', 'Yes, as Tokens Studio sets you can push to Figma Variables.']];
  return <div className="acc">{items.map(([q, a], k) => (
    <div key={q}><div className="hd" onClick={() => setO(o === k ? -1 : k)}>{q}<Icon name={o === k ? 'minus' : 'plus'} size={14} /></div>{o === k && <div className="bd">{a}</div>}</div>
  ))}</div>;
}

function Cal({ v }) {
  const days = [];
  for (let i = 0; i < 35; i++) days.push(i - 2);
  return (
    <div className="cal">
      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="dow">{d}</span>)}
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
      <path d={`${path(a)} L280,100 L0,100 Z`} fill="var(--accent-subtle)" />
      <path d={path(a)} fill="none" stroke="var(--accent-solid)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path d={path(b)} fill="none" stroke="var(--info-solid)" strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Renderers keyed by catalogue id. Each receives { v, s, st }. */
export const PREVIEWS = {
  button: ({ v, s, st }) => (v ? <Btn v={v} s={s} st={st} /> : (
    <div className="row"><Btn v="primary" /><Btn v="secondary" /><Btn v="outline" /><Btn v="ghost" /><Btn v="destructive" icon="trash">Delete</Btn></div>
  )),
  'icon-button': ({ v = 'solid', s = 'md', st }) => {
    const map = { solid: 'primary', outline: 'outline', ghost: 'ghost' };
    return <div className="row">{['edit', 'copy', 'trash', 'more'].map((n) => <button key={n} aria-label={n} disabled={st === 'disabled'} className={`btn icon ${map[v] ?? 'primary'} ${s === 'md' ? '' : s}`}><Icon name={n} size={16} /></button>)}</div>;
  },
  'button-group': ({ v }) => (
    <div className={v === 'spaced' ? 'row' : 'btn-group'}>
      {['Bold', 'Italic', 'Underline'].map((t, i) => <button key={t} className={`btn outline sm ${i === 0 ? 'on' : ''}`}>{t}</button>)}
    </div>
  ),
  link: ({ v = 'inline' }) => v === 'inline'
    ? <p className="t-small">Read the <a className="link">token guidelines</a> before you publish.</p>
    : <a className={`link ${v}`}>View all components <Icon name="chevRight" size={12} /></a>,
  fab: ({ v }) => <button className={`btn fab icon ${v === 'extended' ? 'ext' : ''}`} aria-label="Create"><Icon name="plus" size={20} />{v === 'extended' && 'Create'}</button>,

  'text-field': ({ v = 'outline', st = 'default' }) => (
    <div className="field" style={{ width: '100%', maxWidth: 320 }}>
      <label className="label">Email</label>
      <input className={`input ${v === 'filled' ? 'filled' : ''} ${st === 'focus' ? 'focus' : ''} ${st === 'error' ? 'error' : ''}`} disabled={st === 'disabled'} readOnly={st === 'read-only'}
        defaultValue={st === 'error' ? 'maya@' : ''} placeholder="maya@company.com" />
      <span className={`help ${st === 'error' ? 'err' : ''}`}>{st === 'error' ? 'Enter a valid email address.' : 'We never share your email.'}</span>
    </div>
  ),
  textarea: ({ st }) => (
    <div className="field" style={{ width: '100%', maxWidth: 320 }}>
      <label className="label">Description</label>
      <textarea className={`input ${st === 'error' ? 'error' : ''}`} disabled={st === 'disabled'} placeholder="What is this token used for?" />
    </div>
  ),
  select: ({ v, st }) => (
    <div className="field" style={{ width: '100%', maxWidth: 280 }}>
      <label className="label">Country</label>
      <div className={`input select ${v === 'filled' ? 'filled' : ''} ${st === 'error' ? 'error' : ''} ${st === 'disabled' ? 'disabled' : ''} ${st === 'open' ? 'focus' : ''}`} tabIndex={0}>
        <span>Spain</span><Icon name="chevDown" size={16} />
      </div>
      {st === 'open' && <div className="menu"><div className="hover">Spain <Icon name="check" size={14} style={{ marginLeft: 'auto' }} /></div><div>Portugal</div><div>France</div></div>}
    </div>
  ),
  combobox: ({ v }) => (
    <div className="col" style={{ width: '100%', maxWidth: 280, gap: 6 }}>
      <div className="input focus">{v === 'multi' && <span className="chip static" style={{ height: 22 }}>React</span>}<input defaultValue="Re" aria-label="Search framework" /></div>
      <div className="menu"><div className="hover"><b>Re</b>act</div><div><b>Re</b>mix</div><div>P<b>re</b>act</div></div>
    </div>
  ),
  search: ({ v }) => <div className={`input with-icon ${v === 'filled' ? 'filled' : ''}`} style={{ maxWidth: 300 }}><Icon name="search" size={16} /><input placeholder="Search tokens…" aria-label="Search" /><kbd>⌘K</kbd></div>,
  'number-input': () => <div className="num"><input className="input" defaultValue="16" aria-label="Quantity" /><button className="btn outline icon" aria-label="Decrease"><Icon name="minus" size={14} /></button><button className="btn outline icon" aria-label="Increase"><Icon name="plus" size={14} /></button></div>,
  otp: ({ st }) => <div className="col" style={{ gap: 8 }}><div className="otp">{['8', '2', '4', st === 'default' ? '' : '9', '', ''].map((d, i) => <span key={i} className={i === 3 && st === 'default' ? 'on' : ''} style={st === 'error' ? { borderColor: 'var(--critical-solid)' } : undefined}>{d}</span>)}</div><span className="help">Didn’t get a code? <a className="link">Resend</a></span></div>,
  'date-picker': ({ v }) => <div className="card" style={{ padding: 12, width: 'fit-content' }}><div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}><b className="t-small">November 2026</b><div className="row" style={{ gap: 2 }}><button className="btn ghost icon sm" aria-label="Previous"><Icon name="chevLeft" size={14} /></button><button className="btn ghost icon sm" aria-label="Next"><Icon name="chevRight" size={14} /></button></div></div><Cal v={v} /></div>,
  'file-upload': ({ st = 'idle' }) => (
    <div className="col" style={{ width: '100%', maxWidth: 340 }}>
      <div className={`drop ${st === 'dragging' ? 'drag' : ''}`}><Icon name="upload" size={20} /><b>Drop files or <a className="link">browse</a></b><span className="help">PDF, PNG up to 10MB</span></div>
      {(st === 'uploading' || st === 'error') && <div className="row" style={{ flexWrap: 'nowrap' }}><Icon name="file" size={18} /><div style={{ flex: 1 }}><div className="row t-small" style={{ justifyContent: 'space-between' }}><span>brand-guide.pdf</span><span className="faint">{st === 'error' ? 'Failed' : '60%'}</span></div><div className={`progress ${st === 'error' ? 'err' : ''}`}><div style={{ width: '60%' }} /></div></div></div>}
    </div>
  ),
  slider: ({ v }) => (
    <div className="slider" style={{ width: '100%', maxWidth: 280 }}>
      <div className="track"><div className="fill" style={{ left: v === 'range' ? '25%' : 0, width: v === 'range' ? '45%' : '60%' }} />
        {v === 'range' && <div className="thumb" style={{ left: '25%' }} />}<div className="thumb" style={{ left: v === 'range' ? '70%' : '60%' }} /></div>
    </div>
  ),

  checkbox: ({ st }) => st && st !== 'default'
    ? <Check on={st === 'checked'} ind={st === 'indeterminate'} dis={st === 'disabled'} label="Comments on my files" />
    : <div className="col" style={{ gap: 10 }}><Check on label="Comments on my files" /><Check label="New team members" /><Check ind label="Weekly digest" /><Check dis label="Disabled option" /></div>,
  radio: ({ v }) => v === 'card'
    ? <div className="col" style={{ maxWidth: 320 }}>{[['Starter', 'For individuals', true], ['Team', 'Up to 20 seats', false]].map(([t, d, on]) => <div key={t} className={`radio-card ${on ? 'on' : ''}`}><span className={`box radio ${on ? 'on' : ''}`} /><div><b className="t-small">{t}</b><div className="help">{d}</div></div></div>)}</div>
    : <div className="col" style={{ gap: 10 }}><Check radio on label="Light" /><Check radio label="Dark" /><Check radio label="System" /></div>,
  switch: () => <div className="col" style={{ gap: 12 }}>{[['Notifications', true], ['Auto-publish', false]].map(([l, on]) => <label key={l} className="check"><Toggle initial={on} />{l}</label>)}</div>,
  segmented: () => <Seg />,
  chip: ({ v }) => <Chips v={v} />,

  tabs: ({ v }) => <Tabs pill={v === 'pill'} />,
  breadcrumb: () => <nav className="crumbs" aria-label="Breadcrumb"><a className="link subtle">Workspace</a><Icon name="chevRight" size={12} /><a className="link subtle">Tokens</a><Icon name="chevRight" size={12} /><b>Colour</b></nav>,
  pagination: ({ v }) => v === 'simple'
    ? <div className="row"><button className="btn outline sm"><Icon name="chevLeft" size={14} />Previous</button><span className="t-small muted">Page 2 of 8</span><button className="btn outline sm">Next<Icon name="chevRight" size={14} /></button></div>
    : <div className="pager">{['‹', '1', '2', '3', '…', '8', '›'].map((p, i) => <button key={i} className={p === '2' ? 'on' : ''}>{p}</button>)}</div>,
  sidebar: () => (
    <nav className="nav" style={{ maxWidth: 'var(--sidebar-width, 240px)' }}>
      <div className="h">Workspace</div>
      {[['home', 'Overview'], ['palette', 'Tokens', 128], ['grid', 'Components', 46], ['settings', 'Settings']].map(([ic, t, c], i) => (
        <a key={t} className={i === 1 ? 'on' : ''}><Icon name={ic} size={16} />{t}{c && <span className="count">{c}</span>}</a>
      ))}
    </nav>
  ),
  topbar: () => <div className="topbar"><span className="logo" /><b className="t-small">Acme</b><div className="input with-icon" style={{ maxWidth: 220, height: 32 }}><Icon name="search" size={14} /><input placeholder="Search" aria-label="Search" /></div><div style={{ marginLeft: 'auto' }} className="row"><button className="btn ghost icon sm" aria-label="Notifications"><Icon name="bell" size={16} /></button><span className="avatar sm">MD</span></div></div>,
  stepper: () => (
    <div className="steps" style={{ width: '100%', maxWidth: 360 }}>
      <span className="dot done"><Icon name="check" size={12} stroke={3} /></span><span className="line done" />
      <span className="dot cur">2</span><span className="line" /><span className="dot">3</span>
    </div>
  ),
  menu: () => <div className="menu"><div><Icon name="edit" size={14} />Rename<kbd>R</kbd></div><div className="hover"><Icon name="copy" size={14} />Duplicate<kbd>⌘D</kbd></div><div><Icon name="download" size={14} />Export</div><hr /><div className="danger"><Icon name="trash" size={14} />Delete</div></div>,

  alert: ({ v }) => {
    const list = v ? [v] : ['info', 'success', 'warning', 'critical'];
    const txt = { info: ['Heads up', 'A new token version is available.'], success: ['Published', 'Your tokens are live.'], warning: ['Low contrast', 'Two pairs fail APCA in dark mode.'], critical: ['Publish failed', 'Check your connection and try again.'] };
    return <div className="col" style={{ width: '100%' }}>{list.map((k) => <div key={k} className={`alert ${k}`} role="status"><Icon name={statusIcon[k]} size={16} /><div><b>{txt[k][0]}</b>{txt[k][1]}</div></div>)}</div>;
  },
  toast: ({ v = 'success' }) => (
    <div className={`toast ${v}`}><span className="ic"><Icon name={v === 'critical' ? 'alert' : 'check2'} size={18} /></span><div style={{ flex: 1 }}><b>{v === 'critical' ? 'Something went wrong' : 'Changes saved'}</b><div className="muted">{v === 'critical' ? 'The tokens were not published.' : 'Your tokens are up to date.'}</div></div><button className="btn ghost icon sm" aria-label="Dismiss"><Icon name="x" size={14} /></button></div>
  ),
  badge: ({ v, s }) => v
    ? <span className={`badge ${v} ${s === 'sm' ? 'sm' : ''}`}><i />{v[0].toUpperCase() + v.slice(1)}</span>
    : <div className="row">{['neutral', 'accent', 'success', 'warning', 'critical', 'info'].map((k) => <span key={k} className={`badge ${k}`}>{k[0].toUpperCase() + k.slice(1)}</span>)}<span className="badge solid">12</span></div>,
  progress: ({ v, st }) => v === 'circular'
    ? <svg className="ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg-active)" strokeWidth="5" /><circle cx="22" cy="22" r="18" fill="none" stroke={st === 'error' ? 'var(--critical-solid)' : 'var(--accent-solid)'} strokeWidth="5" strokeLinecap="round" strokeDasharray="113" strokeDashoffset="40" transform="rotate(-90 22 22)" /></svg>
    : <div className="col" style={{ width: '100%', maxWidth: 320, gap: 6 }}><div className="row t-small" style={{ justifyContent: 'space-between' }}><span>Uploading…</span><span className="faint">64%</span></div><div className={`progress ${st === 'error' ? 'err' : ''}`}><div style={{ width: '64%' }} /></div></div>,
  spinner: ({ s }) => <div className="row"><Spinner size={s === 'sm' ? 14 : s === 'lg' ? 32 : 22} /><span className="t-small muted">Loading tokens…</span></div>,
  skeleton: () => <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', width: '100%', maxWidth: 320 }}><div className="skel" style={{ width: 40, height: 40, borderRadius: '50%', flex: 'none' }} /><div className="col" style={{ flex: 1, gap: 8 }}><div className="skel" style={{ height: 12, width: '70%' }} /><div className="skel" style={{ height: 12 }} /><div className="skel" style={{ height: 12, width: '40%' }} /></div></div>,
  'empty-state': () => <div className="empty"><div className="art"><Icon name="layers" size={22} /></div><b>No components yet</b><p className="t-small muted">Add your first component to start building your library.</p><button className="btn primary sm"><Icon name="plus" size={14} />Add component</button></div>,

  dialog: ({ v }) => (
    <div className="scrim" style={{ width: '100%' }}>
      <div className="dialog" role="dialog" aria-label="Unsaved changes">
        <h3 className="t-h4">{v === 'destructive' ? 'Delete this brand?' : 'Unsaved changes'}</h3>
        <p className="t-small muted" style={{ marginTop: 6 }}>{v === 'destructive' ? 'This removes every token and cannot be undone.' : 'Do you want to save or discard your changes?'}</p>
        <div className="actions"><button className="btn outline">Cancel</button>{v === 'destructive' ? <button className="btn destructive">Delete</button> : <button className="btn primary">Save changes</button>}</div>
      </div>
    </div>
  ),
  drawer: () => <div className="scrim" style={{ height: 220, padding: 0, display: 'flex', width: '100%' }}><div className="drawer"><div className="row" style={{ justifyContent: 'space-between' }}><b>Filters</b><Icon name="x" size={16} /></div><Check on label="Published" /><Check label="Drafts" /><div style={{ marginTop: 'auto' }} className="row"><button className="btn primary sm block">Apply</button></div></div></div>,
  popover: () => <div className="popover"><b className="t-small">Share brand</b><p className="help" style={{ margin: '4px 0 10px' }}>Anyone with the link can view.</p><div className="input" style={{ height: 32 }}><input defaultValue="forge.app/b/acme" aria-label="Link" /><Icon name="copy" size={14} /></div></div>,
  tooltip: () => <div style={{ paddingTop: 4 }}><span className="tooltip">Copy token name</span></div>,

  card: ({ v = 'outline', st }) => (
    <div className={`card ${v} ${st === 'interactive' ? 'interactive' : ''}`} style={{ maxWidth: 300 }}>
      <div className="row" style={{ marginBottom: 10 }}><span className="avatar">AC</span><div><b className="t-small">Acme Design</b><div className="help">@acme</div></div></div>
      <p className="t-small muted">One payload underneath: the same JSON that Figma, CSS and your agent read.</p>
      <div className="row" style={{ marginTop: 12 }}><span className="t-small"><b>4</b> <span className="faint">Following</span></span><span className="t-small"><b>12.4K</b> <span className="faint">Followers</span></span></div>
    </div>
  ),
  table: ({ v }) => (
    <table className={`tbl ${v === 'zebra' ? 'zebra' : ''}`}>
      <thead><tr><th>Token</th><th>Value</th><th>Status</th></tr></thead>
      <tbody>
        {[['accent-solid', 'var', 'Published', 'success'], ['text-primary', 'var', 'Draft', 'neutral'], ['border-strong', 'var', 'Review', 'warning'], ['focus-ring', 'var', 'Published', 'success']].map(([t, , s, k], i) => (
          <tr key={t} className={i === 1 ? 'sel' : ''}><td className="mono t-caption">{t}</td><td><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: `var(--${t})`, verticalAlign: 'middle', border: '1px solid var(--border-subtle)' }} /></td><td><span className={`badge ${k}`}>{s}</span></td></tr>
        ))}
      </tbody>
    </table>
  ),
  list: () => <div className="list" style={{ width: '100%' }}>{[['MD', 'Maya Díaz', 'Designer', ''], ['JL', 'Jon Lee', 'Engineer', 'c2'], ['AR', 'Ana Ruiz', 'PM', 'c3']].map(([i, n, r, c]) => <div key={n}><span className={`avatar ${c}`}>{i}</span><div style={{ flex: 1 }}><b className="t-small">{n}</b><div className="help">{r}</div></div><button className="btn ghost icon sm" aria-label="More"><Icon name="more" size={16} /></button></div>)}</div>,
  avatar: ({ s }) => (
    <div className="row">
      <span className={`avatar ${s === 'md' ? '' : s ?? 'lg'}`}>MD<span className="on" /></span>
      <div className="stack">{['AB', 'CD', 'EF', 'GH'].map((t, i) => <span key={t} className={`avatar c${i + 2}`}>{t}</span>)}<span className="avatar" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>+8</span></div>
    </div>
  ),
  stat: ({ st }) => (
    <div className="stat card" style={{ width: '100%', maxWidth: 320 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}><span className="t-small muted">Workspace readiness</span><span className={`badge ${st === 'down' ? 'critical' : 'success'}`}>{st === 'down' ? '−3%' : '+6%'}</span></div>
      <div className="num" style={{ margin: '8px 0 12px' }}>98<span className="t-lead muted">%</span></div>
      <Chart />
    </div>
  ),
  accordion: () => <div style={{ width: '100%' }}><Acc /></div>,
  timeline: () => <div className="tl">{[['Published v2.1', '2 min ago'], ['Accent changed to', '1 h ago'], ['Brand created', 'Yesterday']].map(([t, d], i) => <div key={t}><b>{t}</b> {i === 1 && <code className="inl">accent-9</code>}<div className="help">{d}</div></div>)}</div>,
  code: ({ v }) => v === 'inline'
    ? <p className="t-small">Use <code className="inl">var(--accent-solid)</code> for primary fills.</p>
    : <pre className="code">{`.button {\n  background: var(--accent-solid);\n  color: var(--accent-on-solid);\n  border-radius: var(--radius-fields);\n}`}</pre>,
  divider: ({ v }) => v === 'vertical'
    ? <div className="row" style={{ height: 24 }}><span className="t-small">Edit</span><span className="vdiv" /><span className="t-small">Share</span><span className="vdiv" /><span className="t-small">Export</span></div>
    : <div className="col" style={{ width: '100%' }}><span className="t-small">Above</span><hr className="div" /><span className="t-small">Below</span></div>,
  kbd: () => <div className="row t-small">Search <kbd>⌘</kbd><kbd>K</kbd> · Publish <kbd>⌘</kbd><kbd>⏎</kbd></div>,
};

export function Preview({ id, ...props }) {
  const R = PREVIEWS[id];
  return R ? <R {...props} /> : <span className="faint">No preview</span>;
}
