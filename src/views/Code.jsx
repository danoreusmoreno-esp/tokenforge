import { useMemo, useState } from 'react';
import { EXPORTS } from '../engine/exporters.js';
import { Icon } from '../components/Icons.jsx';
import { encodeBrand } from '../store.js';

// The hosted single-file build runs in a sandbox that blocks downloads and hash links.
const HOSTED = import.meta.env.MODE === 'single';

function download(name, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export default function Code({ sys, brand }) {
  const [tab, setTab] = useState('css');
  const [copied, setCopied] = useState('');
  const files = useMemo(() => EXPORTS.map((e) => ({ ...e, text: e.fn(sys) })), [sys]);
  const cur = files.find((f) => f.id === tab);
  const flash = (m) => { setCopied(m); setTimeout(() => setCopied(''), 1600); };
  const copy = (t, m) => navigator.clipboard?.writeText(t).then(() => flash(m)).catch(() => flash('Copy failed'));
  const shareUrl = `${location.origin}${location.pathname}#b=${encodeBrand(brand)}`;

  return (
    <div className="page">
      <header className="page-hd">
        <div>
          <span className="eyebrow">Step 4 · Ship</span>
          <h1 className="t-h2">Export</h1>
          <p className="muted t-small" style={{ marginTop: 6, maxWidth: 620 }}>One payload, many targets. CSS for the web, W3C JSON for pipelines (Style Dictionary), Tokens Studio sets for Figma Variables, Tailwind, a BRIEF.md with your goals and principles, and an AGENTS.md so AI coding agents use your real tokens.</p>
        </div>
        {!HOSTED && (
          <div className="row">
            <button className="btn outline sm" onClick={() => copy(shareUrl, 'Share link copied')}><Icon name="link" size={14} />Copy share link</button>
            <button className="btn primary sm" onClick={() => files.forEach((f, i) => setTimeout(() => download(f.file, f.text), i * 250))}><Icon name="download" size={14} />Download all</button>
          </div>
        )}
      </header>
      <div className="code-wrap">
        <div className="code-tabs">
          {files.map((f) => (
            <button key={f.id} className={f.id === tab ? 'on' : ''} onClick={() => setTab(f.id)}>
              <span>{f.label}</span><span className="mono t-caption faint">{f.file}</span>
            </button>
          ))}
        </div>
        <div className="code-main">
          <div className="code-bar">
            <span className="mono t-caption">{cur.file} · {cur.text.split('\n').length} lines</span>
            <div className="row" style={{ gap: 6 }}>
              {copied && <span className="t-caption" style={{ color: 'var(--success-text)' }}>{copied}</span>}
              <button className="btn ghost sm" onClick={() => copy(cur.text, `Copied — paste into ${cur.file}`)}><Icon name="copy" size={14} />Copy</button>
              {!HOSTED && <button className="btn outline sm" onClick={() => download(cur.file, cur.text)}><Icon name="download" size={14} />Download</button>}
            </div>
          </div>
          <pre className="code big">{cur.text}</pre>
        </div>
      </div>
      {tab === 'figma' && (
        <div className="alert info" style={{ marginTop: 16 }}><Icon name="info" size={16} /><div><b>Into Figma</b>Install the Tokens Studio plugin → Tools → Load from file → pick figma-tokens.json → Styles &amp; Variables → Export to Figma. You get a Light and a Dark mode for every colour.</div></div>
      )}
    </div>
  );
}
