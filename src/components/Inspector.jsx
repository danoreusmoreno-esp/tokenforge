import { useState } from 'react';
import { FAMILIES, FONTS, DENSITIES, RADIUS_PRESETS, SHADOW_PRESETS, SPACING_PRESETS, MOTION_PRESETS } from '../engine/tokens.js';
import { normalizeHex, tintedNeutral, wcag } from '../engine/color.js';
import { Icon } from './Icons.jsx';

const cap = (s) => s[0].toUpperCase() + s.slice(1);

function ColorRow({ fam, value, onChange }) {
  const [draft, setDraft] = useState(value);
  const [focus, setFocus] = useState(false);
  const shown = focus ? draft : value;
  return (
    <div className="ins-color">
      <label className="swatch" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${fam} colour`} />
      </label>
      <span className="ins-color-name">{cap(fam)}</span>
      <input className="ins-hex" value={shown} spellCheck={false} aria-label={`${fam} hex`}
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

function Choice({ options, value, onChange, format = cap }) {
  return (
    <div className="ins-choice">
      {options.map((o) => <button key={o} className={o === value ? 'on' : ''} onClick={() => onChange(o)}>{format(o)}</button>)}
    </div>
  );
}

function FontSelect({ value, onChange, label }) {
  return (
    <label className="ins-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {FONTS.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
      </select>
    </label>
  );
}

export default function Inspector({ brand, update, sys, onRandom, onSave, dirty }) {
  const set = (patch) => update({ ...brand, ...patch });
  const setColor = (fam, hex) => update({ ...brand, colors: { ...brand.colors, [fam]: hex } });
  const setRadius = (k, v) => update({ ...brand, radius: { ...brand.radius, [k]: v } });
  const accentSolid = sys.appearances.light.roles['accent-solid'];
  const moved = accentSolid.toLowerCase() !== brand.colors.accent.toLowerCase();

  return (
    <aside className="inspector" aria-label="Brand inspector">
      <div className="ins-name">
        <span>Name</span>
        <input value={brand.name} onChange={(e) => set({ name: e.target.value })} aria-label="Brand name" />
        <button className="chrome-btn icon" title="Random brand" onClick={onRandom} aria-label="Random brand"><Icon name="dice" size={16} /></button>
      </div>

      <Section title="Color" value="" open>
        {FAMILIES.map((f) => <ColorRow key={f + brand.id} fam={f} value={brand.colors[f]} onChange={(h) => setColor(f, h)} />)}
        <button className="ins-link" onClick={() => setColor('neutral', tintedNeutral(brand.colors.accent))}><Icon name="sparkles" size={13} />Tint neutral from accent</button>
        {moved && <p className="ins-note">Accent solid adjusted to {accentSolid} so its label clears AA ({wcag(sys.appearances.light.roles['accent-on-solid'], accentSolid).toFixed(1)}:1).</p>}
      </Section>

      <Section title="Font" value={brand.font}>
        <FontSelect label="Body" value={brand.font} onChange={(v) => set({ font: v })} />
        <FontSelect label="Headings" value={brand.headingFont} onChange={(v) => set({ headingFont: v })} />
        <FontSelect label="Code" value={brand.monoFont} onChange={(v) => set({ monoFont: v })} />
      </Section>

      <Section title="Type scale" value={`${cap(brand.density)} · ${DENSITIES[brand.density].base}px`}>
        <Choice options={Object.keys(DENSITIES)} value={brand.density} onChange={(v) => set({ density: v })} />
      </Section>

      <Section title="Radius" value={`${sys.radius.boxes}/${sys.radius.fields}/${sys.radius.selectors}`}>
        {['boxes', 'fields', 'selectors'].map((k) => (
          <div key={k} className="ins-sub">
            <span>{cap(k)} <em>{k === 'boxes' ? 'cards, dialogs' : k === 'fields' ? 'inputs, buttons' : 'chips, checks, tabs'}</em></span>
            <Choice options={Object.keys(RADIUS_PRESETS)} value={brand.radius[k]} onChange={(v) => setRadius(k, v)} />
          </div>
        ))}
      </Section>

      <Section title="Shadow" value={cap(brand.shadow)}>
        <Choice options={Object.keys(SHADOW_PRESETS)} value={brand.shadow} onChange={(v) => set({ shadow: v })} />
      </Section>

      <Section title="Spacing" value={`${cap(brand.spacing)} · ${SPACING_PRESETS[brand.spacing]}px`}>
        <Choice options={Object.keys(SPACING_PRESETS)} value={brand.spacing} onChange={(v) => set({ spacing: v })} format={(o) => `${cap(o)} ${SPACING_PRESETS[o]}px`} />
      </Section>

      <Section title="Motion" value={cap(brand.motion)}>
        <Choice options={Object.keys(MOTION_PRESETS)} value={brand.motion} onChange={(v) => set({ motion: v })} />
      </Section>

      <div className="ins-foot">
        <span className={`ins-status ${dirty ? 'warn' : ''}`}><Icon name={dirty ? 'info' : 'check2'} size={14} />{dirty ? 'Not saved' : 'Saved'}</span>
        <button className="chrome-btn primary" onClick={onSave} disabled={!dirty}>Save brand</button>
      </div>
    </aside>
  );
}
