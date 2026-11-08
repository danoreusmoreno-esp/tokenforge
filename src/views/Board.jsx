import { Preview } from '../components/previews.jsx';
import { COMPONENTS } from '../engine/catalog.js';
import { Live } from '../components/Live.jsx';
import NextStep from '../components/NextStep.jsx';

/** A wall of live components plus foundation specimens, all painted with the brand. */
export default function Board({ sys, appearance, onOpen, go }) {
  const ramp = sys.appearances[appearance].ramps;
  const enabled = new Set(sys.brand.components ?? []);
  const cards = COMPONENTS.filter((c) => enabled.has(c.id));
  return (
    <div className="page board-page">
      <header className="page-hd">
        <div>
          <h1 className="t-h2">Tablero</h1>
          <p>Todos los componentes de tu sistema juntos, con tus tokens. Cambia a modo oscuro en la barra lateral y revisa que todo se lee bien antes de exportar. Pulsa uno para editarlo.</p>
        </div>
      </header>
    <Live className="board">
      <div className="card bcard span2">
        <div className="pal">
          {[['primary', 'Primario'], ['secondary', 'Secundario'], ['tertiary', 'Terciario'], ['neutral', 'Neutro']].map(([f, t]) => (
            <div key={f} className={`pal-row ${f}`}>
              <span className="t-caption muted">{t}</span>
              <div className="ramp">{ramp[f].map((h, i) => <span key={i} style={{ background: h }} title={`${f}-${i + 1} ${h}`} />)}</div>
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          {(sys.semantics ?? ['success', 'warning', 'critical', 'info']).map((f) => <span key={f} className="row t-caption muted" style={{ gap: 8 }}><i style={{ width: 12, height: 12, borderRadius: 4, background: ramp[f][8], display: 'inline-block' }} />{{ success: 'éxito', warning: 'aviso', critical: 'crítico', info: 'info' }[f] ?? (sys.custom ?? []).find((c) => c.key === f)?.name ?? f}</span>)}
        </div>
      </div>
      <div className="card bcard span2 specimen">
        <div className="t-display" style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-text)' }}>Aa</div>
        <div className="col" style={{ gap: 4 }}>
          <span className="t-h3">{sys.fonts.heading}</span>
          <span className="t-small muted">Texto en {sys.fonts.body} · {sys.type.desktop.body.size}/{sys.type.desktop.body.lineHeightPx}px</span>
          <span className="mono t-caption faint">{sys.fonts.mono} 0123456789</span>
        </div>
      </div>
      {cards.map((c) => (
        <div key={c.id} className="card bcard" onClick={() => onOpen(c.id)} title={`Abrir ${c.name}`}>
          <div className="bcard-label">{c.name}</div>
          <div className="bcard-body"><Preview id={c.id} /></div>
        </div>
      ))}
    </Live>
      <NextStep to="code" go={go} done="¿Todo se ve bien?" />
    </div>
  );
}
