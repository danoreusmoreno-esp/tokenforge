import { useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icons.jsx';
import { readSystem, proposeMapping, buildBrand, colorOptions, COLOR_SLOTS, FORMAT_LABEL } from '../engine/importer.js';
import { analyzeSystem, toAnalysisMd, SEVERITY_LABEL } from '../engine/analyze.js';
import { computeSystem } from '../engine/tokens.js';
import { systemSnapshot } from '../engine/exporters.js';
import { newBrand } from '../store.js';
import example from '../../test/fixtures/acme-tokens-studio.json?raw';

const HOSTED = import.meta.env.MODE === 'single';
const SLOT_ES = { primary: 'Primario', secondary: 'Secundario', tertiary: 'Terciario', neutral: 'Neutro', success: 'Éxito', warning: 'Aviso', critical: 'Crítico', info: 'Info' };
const KIND_ES = { color: 'colores', spacing: 'espaciados', radius: 'radios', fontFamily: 'familias', fontSize: 'tamaños de letra', fontWeight: 'pesos', lineHeight: 'alturas de línea', typography: 'estilos de texto', shadow: 'sombras', dimension: 'medidas', other: 'otros' };
const AXIS_ES = { boxes: 'Cajas', fields: 'Campos', selectors: 'Selectores' };
const TYPE_ORDER = ['display', 'h1', 'h2', 'h3', 'h4', 'lead', 'body', 'small', 'caption'];

function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

export default function Import({ go, onImport }) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [paste, setPaste] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  const parsed = useMemo(() => {
    if (!text.trim()) return { model: null, error: '' };
    try { return { model: readSystem(text, fileName), error: '' }; } catch (e) { return { model: null, error: e.message }; }
  }, [text, fileName]);
  const model = parsed.model;

  const [mapping, setMapping] = useState(null);
  const [mapFor, setMapFor] = useState(null);
  if (model && mapFor !== model) { setMapFor(model); setMapping(proposeMapping(model)); }
  const map = model && mapFor === model ? mapping : null;

  const base = useMemo(() => newBrand(), [model]);
  const brand = useMemo(() => (model && map ? buildBrand(model, map, base) : null), [model, map, base]);
  const sys = useMemo(() => (brand ? computeSystem(brand) : null), [brand]);
  const report = useMemo(() => (brand ? analyzeSystem(model, map, brand, sys) : null), [model, map, brand, sys]);
  const [fixes, setFixes] = useState(() => new Set());
  const final = useMemo(() => {
    if (!brand) return null;
    return (report?.findings ?? []).filter((f) => f.fix && fixes.has(f.id)).reduce((b, f) => f.fix.apply(b), brand);
  }, [brand, report, fixes]);
  const finalSys = useMemo(() => (final ? computeSystem(final) : null), [final]);
  const opts = useMemo(() => (model ? colorOptions(model) : []), [model]);

  const load = (t, name) => { setText(t); setFileName(name); setFixes(new Set()); };
  const readFile = (file) => { if (!file) return; file.text().then((t) => load(t, file.name)); };
  const setColor = (slot, id) => setMapping({ ...map, colors: { ...map.colors, [slot]: id || null } });
  const setFont = (k, v) => setMapping({ ...map, fonts: { ...map.fonts, [k]: v || null } });
  const setRadius = (k, path) => setMapping({ ...map, radius: { ...map.radius, [k]: map.radius.all.find((r) => r.path === path) ?? undefined } });
  const toggleFix = (id) => { const n = new Set(fixes); if (n.has(id)) n.delete(id); else n.add(id); setFixes(n); };
  const doImport = () => {
    const b = { ...final, source: { ...final.source, snapshot: systemSnapshot(computeSystem(final)) }, updatedAt: Date.now() };
    onImport(b);
  };
  const md = report ? toAnalysisMd(report, model) : '';

  return (
    <div className="page imp">
      <header className="page-hd">
        <div>
          <h1 className="t-h2">Importar tu sistema</h1>
          <p className="muted t-small" style={{ marginTop: 8, maxWidth: 640 }}>Trae tu sistema de diseño para evolucionarlo aquí y recibir un análisis con mejoras. Se conservan tus valores exactos; la herramienta solo rellena lo que falta. Tu marca actual no se modifica.</p>
        </div>
      </header>

      <section className="fd-sec imp-step" aria-labelledby="imp-1">
        <h2 id="imp-1" className="t-h3"><span className="imp-n">1</span>Archivo</h2>
        <div className={`imp-drop ${drag ? 'drag' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); readFile(e.dataTransfer.files[0]); }}>
          <Icon name="upload" size={22} />
          <b>Suelta aquí tu archivo de tokens</b>
          <span className="muted small">JSON de Tokens Studio (Figma), JSON W3C Design Tokens o un CSS con variables</span>
          <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
            <button className="btn primary sm" onClick={() => fileRef.current?.click()}><Icon name="file" size={14} />Elegir archivo</button>
            <button className="btn outline sm" onClick={() => setPaste(!paste)} aria-expanded={paste}>Pegar contenido</button>
            <button className="btn ghost sm" onClick={() => load(example, 'acme-tokens-studio.json')}>Probar con un ejemplo</button>
          </div>
          <input ref={fileRef} type="file" accept=".json,.css,.txt,application/json,text/css" className="vh" onChange={(e) => readFile(e.target.files?.[0])} aria-label="Archivo de tokens" />
        </div>
        {paste && <textarea className="imp-paste" rows={8} placeholder='{ "global": { "color": … } }  o  :root { --color-brand: #2563eb; }' value={text} onChange={(e) => load(e.target.value, '')} aria-label="Contenido del archivo" />}
        <details className="imp-help">
          <summary>Cómo exportar tus tokens desde Figma</summary>
          <ol>
            <li>En Figma, abre el plugin <b>Tokens Studio</b>.</li>
            <li>Ve a <b>Tools → Export to file/folder</b>.</li>
            <li>Elige <b>Single file</b> y activa <b>Include all token sets</b> para traer el modo claro y el oscuro.</li>
            <li>Sube aquí el <code>tokens.json</code> que se descarga.</li>
          </ol>
          <p className="muted small">Si usas Variables de Figma sin Tokens Studio, expórtalas como JSON con un plugin de exportación de variables (formato W3C) y súbelo igual.</p>
        </details>
        {parsed.error && <div className="imp-error" role="alert"><Icon name="alert" size={16} /><span><b>No he podido leerlo.</b> {parsed.error}</span></div>}
        {model && (
          <div className="imp-summary" role="status">
            <span className="imp-chip strong"><Icon name="check2" size={14} />{FORMAT_LABEL[model.format]}</span>
            <span className="imp-chip">{model.tokens.length} tokens</span>
            {Object.entries(model.stats).sort((a, b) => b[1] - a[1]).map(([k, n]) => <span key={k} className="imp-chip">{n} {KIND_ES[k] ?? k}</span>)}
            <span className="imp-chip">{model.hasDark ? 'Con modo oscuro' : 'Sin modo oscuro'}</span>
            {model.sets.length > 1 && <span className="imp-chip">Sets: {model.sets.join(', ')}</span>}
          </div>
        )}
      </section>

      {model && map && brand && (
        <>
          <section className="fd-sec imp-step" aria-labelledby="imp-2">
            <h2 id="imp-2" className="t-h3"><span className="imp-n">2</span>Asignación</h2>
            <p className="muted t-small">Esto es lo que he entendido de tu archivo. Cambia lo que no encaje: el análisis y la vista previa se actualizan al momento.</p>
            <label className="imp-name">Nombre del sistema<input value={map.name} onChange={(e) => setMapping({ ...map, name: e.target.value })} /></label>

            <h3 className="imp-h">Colores</h3>
            <div className="imp-table" role="table" aria-label="Asignación de colores">
              {COLOR_SLOTS.map((slot) => {
                const o = opts.find((x) => x.id === map.colors[slot]);
                const kept = brand.source.kept?.[slot];
                return (
                  <div key={slot} className="imp-row" role="row">
                    <span className="imp-slot" role="cell">{SLOT_ES[slot]}</span>
                    <span className="imp-sw" role="cell" style={{ background: o?.hex ?? 'transparent' }} aria-hidden="true" />
                    <select role="cell" value={map.colors[slot] ?? ''} onChange={(e) => setColor(slot, e.target.value)} aria-label={`Color para ${SLOT_ES[slot]}`}>
                      <option value="">{['secondary', 'tertiary'].includes(slot) ? 'Sin asignar: derivar del primario' : 'Sin asignar: usar el de la herramienta'}</option>
                      {opts.map((x) => <option key={x.id} value={x.id}>{x.label} · {x.hex}</option>)}
                    </select>
                    <span className="imp-ramp" role="cell">
                      {o?.steps ? o.steps.map((st) => <i key={st.path} style={{ background: st.hex }} title={`${st.path} ${st.hex}`} />) : <em className="muted small">{o ? 'Color suelto: se genera su rampa' : '—'}</em>}
                    </span>
                    <span className="imp-kept small muted" role="cell">{kept ? `${kept.kept} de ${kept.total} pasos conservados` : o ? 'Color exacto conservado' : ''}</span>
                  </div>
                );
              })}
            </div>

            <div className="imp-cols">
              <div>
                <h3 className="imp-h">Tipografía</h3>
                {['body', 'heading', 'mono'].map((k) => (
                  <label key={k} className="imp-field"><span>{{ body: 'Texto', heading: 'Títulos', mono: 'Código' }[k]}</span>
                    <select value={map.fonts[k] ?? ''} onChange={(e) => setFont(k, e.target.value)}>
                      <option value="">Por defecto de la herramienta</option>
                      {[...new Set([...(map.fonts.options ?? []), map.fonts[k]].filter(Boolean))].map((f) => <option key={f}>{f}</option>)}
                    </select>
                  </label>
                ))}
                <table className="imp-mini"><tbody>
                  {TYPE_ORDER.filter((n) => map.type[n]).map((n) => (
                    <tr key={n}><th scope="row">{n}</th><td>{Math.round(map.type[n].size * 10) / 10} px{map.type[n].lineHeightPx ? ` / ${Math.round(map.type[n].lineHeightPx)}` : ''}{map.type[n].weight ? ` · ${map.type[n].weight}` : ''}</td><td className="muted small">{map.type[n].path}</td></tr>
                  ))}
                </tbody></table>
              </div>
              <div>
                <h3 className="imp-h">Forma y espacio</h3>
                {['boxes', 'fields', 'selectors'].map((k) => (
                  <label key={k} className="imp-field"><span>Radio · {AXIS_ES[k]}</span>
                    <select value={map.radius[k]?.path ?? ''} onChange={(e) => setRadius(k, e.target.value)}>
                      <option value="">Por defecto de la herramienta</option>
                      {(map.radius.all ?? []).filter((r) => r.px > 0 && r.px < 999).map((r) => <option key={r.path} value={r.path}>{r.path} · {r.px} px</option>)}
                    </select>
                  </label>
                ))}
                <p className="small" style={{ marginTop: 12 }}>Espaciado: base de <b>{map.spacing.unit} px</b> · densidad <b>{map.spacing.density}</b> ({map.spacing.values.length} tokens).</p>
                {map.shadows.sm && <div className="imp-shadows">{['sm', 'md', 'lg'].map((k) => <span key={k} style={{ boxShadow: map.shadows[k].light }} title={map.shadows[k].path}>{k}</span>)}</div>}
              </div>
            </div>
          </section>

          <section className="fd-sec imp-step" aria-labelledby="imp-3">
            <h2 id="imp-3" className="t-h3"><span className="imp-n">3</span>Análisis</h2>
            <div className="imp-score">
              <div className={`imp-ring ${report.score >= 85 ? 'good' : report.score >= 65 ? 'ok' : 'bad'}`} style={{ '--p': report.score }} role="img" aria-label={`Puntuación ${report.score} de 100`}><b>{report.score}</b><span>/100</span></div>
              <div className="imp-cats">
                {report.categories.map((c) => (
                  <div key={c.id} className="imp-cat"><span>{c.name}</span><i><b style={{ width: `${c.score}%` }} /></i><em>{c.score}</em></div>
                ))}
              </div>
            </div>
            {report.strengths.length > 0 && <ul className="imp-good">{report.strengths.map((s) => <li key={s.id}><Icon name="check2" size={16} />{s.title}</li>)}</ul>}
            <ol className="imp-findings">
              {report.findings.map((f) => (
                <li key={f.id} className={`imp-finding sev-${f.severity}`}>
                  <div className="imp-f-hd"><span className={`imp-sev sev-${f.severity}`}>{SEVERITY_LABEL[f.severity]}</span><b>{f.title}</b></div>
                  <p className="small">{f.detail}</p>
                  {f.items?.length > 0 && (
                    <details><summary className="small">Ver {f.items.length === 1 ? 'el caso' : `los ${f.items.length} casos`}</summary><ul className="imp-items">{f.items.map((i) => <li key={i}><code>{i}</code></li>)}</ul></details>
                  )}
                  {f.note && <p className="imp-note small"><Icon name="info" size={14} />{f.note}</p>}
                  {f.fix && <label className="imp-fix"><input type="checkbox" checked={fixes.has(f.id)} onChange={() => toggleFix(f.id)} /> <span>Aplicar al importar: {f.fix.label}</span></label>}
                </li>
              ))}
            </ol>
            <div className="row">
              <button className="btn outline sm" onClick={() => navigator.clipboard?.writeText(md)}><Icon name="copy" size={14} />Copiar informe</button>
              {!HOSTED && <button className="btn outline sm" onClick={() => download('ANALYSIS.md', md)}><Icon name="download" size={14} />Descargar ANALYSIS.md</button>}
            </div>
          </section>

          <section className="fd-sec imp-step" aria-labelledby="imp-4">
            <h2 id="imp-4" className="t-h3"><span className="imp-n">4</span>Importar</h2>
            <p className="muted t-small">Así queda tu sistema en la herramienta. Los roles de texto, fondo y borde se resuelven para cumplir AA en claro y en oscuro{fixes.size ? `, con ${fixes.size} ${fixes.size === 1 ? 'mejora aplicada' : 'mejoras aplicadas'}` : ''}.</p>
            <div className="imp-preview">
              {['light', 'dark'].map((ap) => (
                <div key={ap} className={`imp-pv ${ap}`} style={{ background: finalSys.appearances[ap].roles['bg-canvas'], color: finalSys.appearances[ap].roles['text-primary'] }}>
                  <span className="small">{ap === 'light' ? 'Claro' : 'Oscuro'}</span>
                  <div className="imp-pv-ramps">{finalSys.families.slice(0, 8).map((f) => <div key={f}>{finalSys.appearances[ap].ramps[f].map((h, i) => <i key={i} style={{ background: h }} />)}</div>)}</div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="imp-pv-btn" style={{ background: finalSys.appearances[ap].roles['primary-solid'], color: finalSys.appearances[ap].roles['primary-on-solid'], borderRadius: finalSys.radius.fields }}>Acción principal</span>
                    <span className="small" style={{ color: finalSys.appearances[ap].roles['text-secondary'] }}>Texto secundario</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="small">{finalSys.fonts.heading} / {finalSys.fonts.body} · radios {finalSys.radius.boxes}/{finalSys.radius.fields}/{finalSys.radius.selectors} px · {finalSys.audit.filter((r) => r.wcagPass).length} de {finalSys.audit.length} pares cumplen AA</p>
            <div className="row">
              <button className="pill dark" onClick={doImport}><Icon name="download" size={16} />Importar como nueva marca</button>
              <button className="pill" onClick={() => go('home')}>Cancelar</button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
