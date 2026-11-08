import { useEffect, useMemo, useRef } from 'react';
import { COMPONENTS } from '../engine/catalog.js';
import { ANATOMY } from '../engine/guide.js';
import { cssVars } from '../engine/exporters.js';
import { BrandVars } from './Live.jsx';
import { Preview } from './previews.jsx';

// Static capture: no entrance or hover motion while we measure.
const STILL = { enter: 'none', hover: 'none', tap: 'none', effect: 'none' };
// Full-width components are measured at a page width.
const WIDTH = { hero: 960, 'page-banner': 720, carousel: 520, table: 520, 'pricing-card': 340 };

const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

function measure(el, root) {
  const r = el.getBoundingClientRect();
  const rr = root.getBoundingClientRect();
  const cs = getComputedStyle(el);
  let radius = num(cs.borderTopLeftRadius);
  if (cs.borderTopLeftRadius.endsWith('%')) radius = (r.width * radius) / 100;
  if (radius > 0 && radius >= Math.min(r.width, r.height) / 2 - 0.5) radius = 999;
  const fs = num(cs.fontSize);
  return {
    x: Math.round(r.left - rr.left), y: Math.round(r.top - rr.top), w: r.width, h: r.height,
    text: Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim()),
    icon: el.tagName.toLowerCase() === 'svg',
    style: {
      pt: num(cs.paddingTop), pr: num(cs.paddingRight), pb: num(cs.paddingBottom), pl: num(cs.paddingLeft),
      gap: num(cs.columnGap) || num(cs.rowGap), radius,
      bw: cs.borderTopStyle === 'none' ? 0 : num(cs.borderTopWidth), bc: cs.borderTopColor,
      bg: cs.backgroundColor, color: cs.color,
      fs, lh: cs.lineHeight === 'normal' ? Math.round(fs * 1.2) : num(cs.lineHeight), fw: cs.fontWeight,
    },
  };
}

function find(root, sel) {
  if (!sel) return root;
  try { return sel.startsWith('>') ? root.querySelector(`:scope ${sel}`) : root.querySelector(sel); } catch { return null; }
}

/**
 * Renders every variant of the given components out of sight, in light mode at desktop size,
 * then reports their HTML and the measured anatomy through onDone.
 */
export default function DocsCapture({ sys, ids, onDone }) {
  const box = useRef(null);
  const vars = useMemo(() => cssVars(sys, 'light', 'desktop', ids), [sys, ids]);
  const items = useMemo(() => ids.flatMap((id) => {
    const c = COMPONENTS.find((x) => x.id === id);
    if (!c) return [];
    const anatV = ANATOMY[id]?.v ?? c.variants[0];
    return [{ id, v: anatV, anat: true }, ...c.variants.map((v) => ({ id, v, anat: false }))];
  }), [ids]);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Measure only once the brand fonts are in and the layout has stopped moving.
      const fams = [...new Set([sys.fonts.body, sys.fonts.heading, sys.fonts.mono])];
      await Promise.all(fams.flatMap((f) => [400, 600].map((w) => document.fonts?.load(`${w} 16px "${f}"`).catch(() => null))));
      await (document.fonts?.ready ?? Promise.resolve());
      const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const snapshot = () => [...(box.current?.querySelectorAll('[data-cap]') ?? [])].map((el) => `${el.offsetWidth}x${el.offsetHeight}`).join('|');
      let prev = '';
      for (let i = 0; i < 8; i++) {
        await frame();
        await new Promise((r) => setTimeout(r, 120));
        const now = snapshot();
        if (now === prev) break;
        prev = now;
      }
      if (!alive || !box.current) return;
      const out = {};
      for (const el of box.current.querySelectorAll('[data-cap]')) {
        const id = el.dataset.cap;
        const v = el.dataset.v;
        const stage = el.querySelector('.m-stage');
        if (!stage) continue;
        out[id] ??= { variants: [], anatomy: null };
        if (el.dataset.anat !== '1') { out[id].variants.push({ v, html: stage.innerHTML }); continue; }
        const spec = ANATOMY[id];
        const root = spec && stage.querySelector(spec.root);
        if (!root) continue;
        const rr = root.getBoundingClientRect();
        const parts = [];
        for (const [name, sel] of spec.parts) {
          const p = find(root, sel);
          if (p) parts.push({ name, ...measure(p, root) });
        }
        out[id].anatomy = { v, w: rr.width, h: rr.height, html: root.outerHTML, parts };
      }
      if (alive) onDone(out);
    })();
    return () => { alive = false; };
  }, [items, vars, onDone]);

  return (
    <div ref={box} aria-hidden="true" style={{ position: 'fixed', left: -20000, top: 0, width: 1200, pointerEvents: 'none' }}>
      <BrandVars.Provider value={vars}>
        {items.map((it) => (
          <div key={`${it.id}-${it.v}-${it.anat}`} data-cap={it.id} data-v={it.v} data-anat={it.anat ? '1' : '0'} style={{ width: WIDTH[it.id] ?? 560, marginBottom: 24 }}>
            <Preview id={it.id} v={it.v} motion={STILL} />
          </div>
        ))}
      </BrandVars.Provider>
    </div>
  );
}
