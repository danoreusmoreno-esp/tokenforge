import { useState } from 'react';
import { FAMILIES, FONTS, DENSITIES, RADIUS_PRESETS, SHADOW_PRESETS, SPACING_PRESETS, MOTION_PRESETS } from '../engine/tokens.js';
import { normalizeHex, tintedNeutral, wcag } from '../engine/color.js';
import { Icon } from './Icons.jsx';
import { MAX_SUBBRANDS, SUB_FIELDS, newSubbrand, fontFormat, familyFromFile } from '../engine/brands.js';

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const AXIS = { boxes: 'Cajas', fields: 'Campos', selectors: 'Selectores' };
// Spanish labels for preset keys (the keys stay in English: they are token values).
const ES = {
  accent: 'Acento', neutral: 'Neutro', success: 'Éxito', critical: 'Crítico', warning: 'Aviso', info: 'Info',
  compact: 'Compacta', snug: 'Ajustada', default: 'Normal', comfortable: 'Cómoda', spacious: 'Amplia',
  none: 'Ninguno', subtle: 'Sutil', soft: 'Suave', rounded: 'Redondeado', large: 'Grande', pill: 'Píldora',
  medium: 'Media', strong: 'Fuerte', tight: 'Ceñido', quiet: 'Sereno', roomy: 'Holgado',
  snappy: 'Ágil', standard: 'Estándar', expressive: 'Expresivo',
};
const es = (k) => ES[k] ?? cap(k);

function ColorRow({ fam, value, onChange }) {
  const [draft, setDraft] = useState(value);
  const [focus, setFocus] = useState(false);
  const shown = focus ? draft : value;
  return (
    <div className="ins-color">
      <label className="swatch" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`Color ${fam}`} />
      </label>
      <span className="ins-color-name">{es(fam)}</span>
      <input className="ins-hex" value={shown} spellCheck={false} aria-label={`Hex ${fam}`}
        onFocus={() => { setDraft(value); setFocus(true); }}
        onChange={(e) => { setDraft(e.target.value); const n = normalizeHex(e.target.value); if (n && /^#?[0-9a-f]{6}$/i.test(e.target.value.trim())) onChange(n); }}
        onBlur={() => { setFocus(false); const n = normalizeHex(draft); if (n) onChange(n); }} />
    </div>
  );
}

function Section({ title, value, children, open: initial = false }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="ins-sec">
      <button className="ins-sec-hd" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{title}</span><span className="ins-val">{value}</span><Icon name="chevDown" size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && <div className="ins-sec-bd">{children}</div>}
    </div>
  );
}

function Choice({ options, value, onChange, format = es }) {
  return (
    <div className="ins-choice">
      {options.map((o) => <button key={o} className={o === value ? 'on' : ''} onClick={() => onChange(o)}>{format(o)}</button>)}
    </div>
  );
}

const LOGO_MAX = 500 * 1024;
const FONT_MAX = 1.5 * 1024 * 1024;
const FONT_FILES = '.woff2,.woff,.ttf,.otf';
const kb = (n) => `${Math.round(n / 1024)} KB`;

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Logo drop zone: click or drop an SVG, PNG, JPG or WebP. */
function LogoField({ value, onChange, label }) {
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const take = async (file) => {
    if (!file) return;
    if (!/^image\/(svg\+xml|png|jpeg|webp)$/.test(file.type)) { setErr('Usa SVG, PNG, JPG o WebP.'); return; }
    if (file.size > LOGO_MAX) { setErr(`Pesa ${kb(file.size)}; el máximo es ${kb(LOGO_MAX)}. Prueba con SVG o un PNG más pequeño.`); return; }
    setErr('');
    onChange(await readAsDataURL(file));
  };
  return (
    <div className="logo-field">
      <label className={`logo-drop ${over ? 'over' : ''} ${value ? 'has' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}>
        <input type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" onChange={(e) => { take(e.target.files[0]); e.target.value = ''; }} aria-label={label} />
        {value ? <img src={value} alt={label} /> : <span className="logo-empty"><Icon name="upload" size={18} /><span>Sube el logo<br /><small>SVG, PNG o WebP · máx. {kb(LOGO_MAX)}</small></span></span>}
      </label>
      {value && <button className="ins-link" onClick={() => onChange(null)}><Icon name="trash" size={13} />Quitar logo</button>}
      {err && <p className="ins-err" role="alert">{err}</p>}
    </div>
  );
}

/** Any Google Fonts family, the brand's own uploaded files, or (for a sub-brand) the master's choice. */
function FontPicker({ value, onChange, label, custom, inherit }) {
  const known = new Set([...FONTS.map((f) => f.name), ...custom.map((f) => f.name)]);
  const [other, setOther] = useState(false);
  const [typed, setTyped] = useState('');
  const sel = other ? '__other' : value || '';
  return (
    <label className="ins-field">
      <span>{label}</span>
      <select value={sel} onChange={(e) => {
        const v = e.target.value;
        if (v === '__other') { setOther(true); setTyped(value && !known.has(value) ? value : ''); return; }
        setOther(false); onChange(v);
      }}>
        {inherit && <option value="">Igual que la marca principal ({inherit})</option>}
        {custom.length > 0 && <optgroup label="Tus fuentes">{custom.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}</optgroup>}
        <optgroup label="Google Fonts">
          {value && !known.has(value) && <option value={value}>{value}</option>}
          {FONTS.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
        </optgroup>
        <option value="__other">Otra de Google Fonts…</option>
      </select>
      {other && (
        <span className="font-other">
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Nombre exacto, p. ej. Bricolage Grotesque" aria-label={`Otra fuente para ${label}`}
            onKeyDown={(e) => { if (e.key === 'Enter' && typed.trim()) { onChange(typed.trim()); setOther(false); } }} />
          <button type="button" onClick={() => { if (typed.trim()) { onChange(typed.trim()); setOther(false); } }}>Usar</button>
        </span>
      )}
    </label>
  );
}

/** Upload the brand's own font files; they are registered with FontFace and listed in the pickers. */
function FontUploads({ fonts, onChange }) {
  const [err, setErr] = useState('');
  const [pending, setPending] = useState(null);
  const pick = async (file) => {
    if (!file) return;
    const format = fontFormat(file.name);
    if (!format) { setErr('Formatos admitidos: WOFF2, WOFF, TTF u OTF.'); return; }
    if (file.size > FONT_MAX) { setErr(`Pesa ${kb(file.size)}; el máximo es ${kb(FONT_MAX)}. Usa WOFF2, que es el formato más ligero.`); return; }
    setErr('');
    setPending({ name: familyFromFile(file.name), file: file.name, format, size: file.size, dataUrl: await readAsDataURL(file) });
  };
  return (
    <div className="font-uploads">
      {fonts.length > 0 && (
        <ul>
          {fonts.map((f) => (
            <li key={f.id}>
              <span className="font-sample" style={{ fontFamily: `'${f.name}'` }}>Aa</span>
              <span className="fu-txt"><b>{f.name}</b><small>{f.file} · {kb(f.size)}</small></span>
              <button className="ins-icon" onClick={() => onChange(fonts.filter((x) => x.id !== f.id))} aria-label={`Quitar ${f.name}`}><Icon name="trash" size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      {pending ? (
        <div className="font-pending">
          <span>Nombre de la familia</span>
          <input value={pending.name} onChange={(e) => setPending({ ...pending, name: e.target.value })} aria-label="Nombre de la familia" />
          <div className="row-btns">
            <button className="ins-link" onClick={() => setPending(null)}>Cancelar</button>
            <button className="mini-primary" onClick={() => { if (!pending.name.trim()) return; onChange([...fonts, { ...pending, name: pending.name.trim(), id: Math.random().toString(36).slice(2, 9) }]); setPending(null); }}>Añadir fuente</button>
          </div>
        </div>
      ) : (
        <label className="upload-btn">
          <input type="file" accept={FONT_FILES} onChange={(e) => { pick(e.target.files[0]); e.target.value = ''; }} />
          <Icon name="upload" size={14} />Subir fuente propia
        </label>
      )}
      {err && <p className="ins-err" role="alert">{err}</p>}
    </div>
  );
}

export default function Inspector({ brand, update, sys, onRandom, dirty, storageError, undoable }) {
  const set = (patch) => update({ ...brand, ...patch });
  const subs = brand.subbrands ?? [];
  const sub = subs.find((x) => x.id === brand.activeSub) ?? null;
  const setSub = (patch) => update({ ...brand, subbrands: subs.map((x) => (x.id === sub.id ? { ...x, ...patch } : x)) });
  const colors = sub ? { ...brand.colors, ...Object.fromEntries(Object.entries(sub.colors).filter(([, v]) => v)) } : brand.colors;
  const setColor = (fam, hex) => (sub && SUB_FIELDS.includes(fam) ? setSub({ colors: { ...sub.colors, [fam]: hex } }) : update({ ...brand, colors: { ...brand.colors, [fam]: hex } }));
  const setRadius = (k, v) => update({ ...brand, radius: { ...brand.radius, [k]: v } });
  const accentSolid = sys.appearances.light.roles['accent-solid'];
  const moved = accentSolid.toLowerCase() !== colors.accent.toLowerCase();
  const custom = brand.customFonts ?? [];
  const addSub = () => {
    if (subs.length >= MAX_SUBBRANDS) return;
    const s = newSubbrand(brand, subs.length + 1);
    update({ ...brand, subbrands: [...subs, s], activeSub: s.id });
  };
  const removeSub = (id) => undoable(`Submarca «${subs.find((x) => x.id === id)?.name}» eliminada`, { ...brand, subbrands: subs.filter((x) => x.id !== id), activeSub: brand.activeSub === id ? null : brand.activeSub });
  const fams = sub ? SUB_FIELDS : FAMILIES;

  return (
    <aside className="inspector" aria-label="Inspector de marca">
      <div className="ins-name">
        <span>Nombre</span>
        <input value={brand.name} onChange={(e) => set({ name: e.target.value })} aria-label="Nombre del sistema" />
        <button className="chrome-btn icon" title="Marca aleatoria" onClick={onRandom} aria-label="Marca aleatoria"><Icon name="dice" size={16} /></button>
      </div>

      <Section title="Marcas" value={subs.length ? `${subs.length + 1} marcas` : 'Una marca'} open>
        <div className="brand-tabs" role="tablist" aria-label="Marca que editas">
          <button role="tab" aria-selected={!sub} className={!sub ? 'on' : ''} onClick={() => set({ activeSub: null })}>
            <i style={{ background: brand.colors.accent }} />{brand.name}<small>Principal</small>
          </button>
          {subs.map((x) => (
            <button key={x.id} role="tab" aria-selected={sub?.id === x.id} className={sub?.id === x.id ? 'on' : ''} onClick={() => set({ activeSub: x.id })}>
              <i style={{ background: x.colors.accent || brand.colors.accent }} />{x.name}
            </button>
          ))}
          {subs.length < MAX_SUBBRANDS
            ? <button className="add" onClick={addSub}><Icon name="plus" size={14} />Submarca</button>
            : <span className="ins-hint">Máximo {MAX_SUBBRANDS} submarcas</span>}
        </div>
        {sub && (
          <label className="ins-field">
            <span>Nombre de la submarca</span>
            <span className="sub-name-row">
              <input value={sub.name} onChange={(e) => setSub({ name: e.target.value })} aria-label="Nombre de la submarca" />
              <button className="ins-icon" onClick={() => removeSub(sub.id)} aria-label={`Eliminar ${sub.name}`} title="Eliminar submarca"><Icon name="trash" size={14} /></button>
            </span>
          </label>
        )}
        <span className="ins-sublabel">{sub ? `Logo de ${sub.name}` : 'Logo'}</span>
        <LogoField value={sub ? sub.logo : brand.logo} onChange={(v) => (sub ? setSub({ logo: v }) : set({ logo: v }))} label={sub ? `Logo de ${sub.name}` : `Logo de ${brand.name}`} />
        {sub && <p className="ins-hint">La submarca cambia acento, neutro, tipografías y logo. Estados, espaciado, radios, sombras, movimiento y componentes se comparten con {brand.name}.</p>}
      </Section>

      <Section title="Color" value={sub ? sub.name : ''} open>
        {fams.map((f) => <ColorRow key={f + brand.id + (sub?.id ?? '')} fam={f} value={colors[f]} onChange={(h) => setColor(f, h)} />)}
        <button className="ins-link" onClick={() => setColor('neutral', tintedNeutral(colors.accent))}><Icon name="sparkles" size={13} />Teñir el neutro con el acento</button>
        {moved && <p className="ins-note">Acento sólido ajustado a {accentSolid} para que su texto cumpla AA ({wcag(sys.appearances.light.roles['accent-on-solid'], accentSolid).toFixed(1)}:1).</p>}
      </Section>

      <Section title="Tipografía" value={sub ? (sub.font || brand.font) : brand.font}>
        {sub ? (
          <>
            <FontPicker label="Texto" value={sub.font} inherit={brand.font} custom={custom} onChange={(v) => setSub({ font: v })} />
            <FontPicker label="Títulos" value={sub.headingFont} inherit={brand.headingFont} custom={custom} onChange={(v) => setSub({ headingFont: v })} />
          </>
        ) : (
          <>
            <FontPicker label="Texto" value={brand.font} custom={custom} onChange={(v) => set({ font: v })} />
            <FontPicker label="Títulos" value={brand.headingFont} custom={custom} onChange={(v) => set({ headingFont: v })} />
            <FontPicker label="Código" value={brand.monoFont} custom={custom} onChange={(v) => set({ monoFont: v })} />
          </>
        )}
        <span className="ins-sublabel">Fuentes propias</span>
        <FontUploads fonts={custom} onChange={(list) => set({ customFonts: list })} />
      </Section>

      <Section title="Escala tipográfica" value={`${es(brand.density)} · ${DENSITIES[brand.density].base}px`}>
        <Choice options={Object.keys(DENSITIES)} value={brand.density} onChange={(v) => set({ density: v })} />
      </Section>

      <Section title="Radio" value={`${sys.radius.boxes}/${sys.radius.fields}/${sys.radius.selectors}`}>
        {['boxes', 'fields', 'selectors'].map((k) => (
          <div key={k} className="ins-sub">
            <span>{AXIS[k]} <em>{k === 'boxes' ? 'tarjetas, diálogos' : k === 'fields' ? 'campos, botones' : 'chips, checks, pestañas'}</em></span>
            <Choice options={Object.keys(RADIUS_PRESETS)} value={brand.radius[k]} onChange={(v) => setRadius(k, v)} />
          </div>
        ))}
      </Section>

      <Section title="Sombra" value={es(brand.shadow)}>
        <Choice options={Object.keys(SHADOW_PRESETS)} value={brand.shadow} onChange={(v) => set({ shadow: v })} />
      </Section>

      <Section title="Espaciado" value={`${es(brand.spacing)} · base 4 px`}>
        <Choice options={Object.keys(SPACING_PRESETS)} value={brand.spacing} onChange={(v) => set({ spacing: v })} format={(o) => `${es(o)} ×${String(SPACING_PRESETS[o]).replace('.', ',')}`} />
        <p className="ins-hint">La unidad es siempre 4 px. La densidad cambia la separación entre bloques y el relleno de los componentes.</p>
      </Section>

      <Section title="Movimiento" value={es(brand.motion)}>
        <Choice options={Object.keys(MOTION_PRESETS)} value={brand.motion} onChange={(v) => set({ motion: v })} />
      </Section>

      <div className="ins-foot" aria-live="polite">
        <span className={`ins-status ${storageError ? 'warn' : ''}`}>
          <Icon name={storageError ? 'info' : dirty ? 'upload' : 'check2'} size={14} />
          {storageError ? 'El navegador está lleno: quita fuentes o logos pesados' : dirty ? 'Guardando…' : 'Guardado en este navegador'}
        </span>
      </div>
    </aside>
  );
}
