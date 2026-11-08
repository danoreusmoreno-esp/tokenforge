import { useEffect, useMemo, useState } from 'react';
import { computeSystem } from './engine/tokens.js';
import { cssVars } from './engine/exporters.js';
import { loadBrands, saveBrands, loadActive, saveActive, newBrand, randomize, randomName, applyStarter, decodeBrand, uid } from './store.js';
import Inspector from './components/Inspector.jsx';
import { Icon } from './components/Icons.jsx';
import { BrandVars, MotionCfg } from './components/Live.jsx';
import { systemSpring } from './engine/motion.js';
import { effectiveBrand } from './engine/brands.js';
import Home from './views/Home.jsx';
import Brief from './views/Brief.jsx';
import Board from './views/Board.jsx';
import Foundations from './views/Foundations.jsx';
import Components from './views/Components.jsx';
import Code from './views/Code.jsx';

const NAV = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'brief', label: 'Bases', icon: 'book' },
  { id: 'foundations', label: 'Foundations', icon: 'palette' },
  { id: 'components', label: 'Componentes', icon: 'grid' },
  { id: 'board', label: 'Tablero', icon: 'layers' },
  { id: 'code', label: 'Exportar', icon: 'code' },
];

function readParams() {
  const p = new URLSearchParams(location.search);
  return { view: p.get('view'), tab: p.get('tab') || 'color', comp: p.get('component') };
}

function getTheme() {
  try {
    const t = localStorage.getItem('tf-theme');
    if (t === 'light' || t === 'dark') return t;
  } catch { /* storage unavailable */ }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Register the brand's uploaded font files so previews can use them. */
function useCustomFonts(fonts) {
  const key = fonts.map((f) => f.id).join('|');
  useEffect(() => {
    if (!('FontFace' in window)) return;
    for (const f of fonts) {
      if ([...document.fonts].some((ff) => ff.family.replace(/"/g, '') === f.name && ff.tfId === f.id)) continue;
      const face = new FontFace(f.name, `url(${f.dataUrl}) format('${f.format}')`, { display: 'swap' });
      face.tfId = f.id;
      face.load().then((ff) => document.fonts.add(ff)).catch(() => { /* broken file: the stack falls back */ });
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
}

function useGoogleFonts(fonts) {
  const key = [...new Set(fonts)].filter(Boolean).join('|');
  useEffect(() => {
    if (!key) return;
    const fams = key.split('|').map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&');
    let link = document.getElementById('tf-fonts');
    if (!link) {
      link = document.createElement('link');
      link.id = 'tf-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?${fams}&display=swap`;
  }, [key]);
}

export default function App() {
  const init = readParams();
  const [brands, setBrands] = useState(() => {
    const list = loadBrands();
    const shared = location.hash.startsWith('#b=') ? decodeBrand(location.hash.slice(3)) : null;
    if (shared) { shared.name = `${shared.name} (compartida)`; return [...list, shared]; }
    return list;
  });
  const [activeId, setActiveId] = useState(() => {
    if (location.hash.startsWith('#b=')) return null;
    const a = loadActive();
    return a;
  });
  const savedActive = brands.find((b) => b.id === activeId) ?? brands[brands.length - 1];
  const [draft, setDraft] = useState(savedActive);
  // First visit to a brand without answers opens the Bases questions.
  const [view, setView] = useState(() => init.view || (savedActive?.brief?.done ? 'home' : 'brief'));
  const [tab, setTab] = useState(init.tab);
  const [detail, setDetail] = useState(init.comp);
  const [theme, setTheme] = useState(getTheme);
  const [navOpen, setNavOpen] = useState(false);
  const [insOpen, setInsOpen] = useState(false);

  useEffect(() => {
    if (location.hash.startsWith('#b=')) history.replaceState(null, '', location.pathname + location.search);
  }, []);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => { setStorageError(!saveBrands(brands)); }, [brands]);
  useEffect(() => { saveActive(draft.id); }, [draft.id]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('tf-theme', theme); } catch { /* ignore */ }
  }, [theme]);
  useEffect(() => {
    const p = new URLSearchParams();
    p.set('view', view);
    if (view === 'foundations') p.set('tab', tab);
    if (view === 'components' && detail) p.set('component', detail);
    try { history.replaceState(null, '', `${location.pathname}?${p}`); } catch { /* sandboxed */ }
    document.querySelector('.main')?.scrollTo?.(0, 0);
  }, [view, tab, detail]);

  // The system shown and previewed: the master brand, or the active sub-brand on top of it.
  const sys = useMemo(() => computeSystem({ ...effectiveBrand(draft), __master: draft }), [draft]);
  const vars = useMemo(() => cssVars(sys, theme, 'desktop', draft.components), [sys, theme, draft.components]);
  const customNames = new Set((draft.customFonts ?? []).map((f) => f.name));
  useCustomFonts(draft.customFonts ?? []);
  useGoogleFonts([sys.fonts.body, sys.fonts.heading, sys.fonts.mono].filter((f) => !customNames.has(f)));

  const saved = brands.find((b) => b.id === draft.id);
  const dirty = !saved || JSON.stringify({ ...saved, updatedAt: 0 }) !== JSON.stringify({ ...draft, updatedAt: 0 });

  // Autosave: every change lands in the brand list (and so in browser storage) a moment later.
  useEffect(() => {
    if (!dirty) return undefined;
    const t = setTimeout(() => {
      const b = { ...draft, updatedAt: Date.now() };
      setBrands((list) => (list.some((x) => x.id === b.id) ? list.map((x) => (x.id === b.id ? b : x)) : [...list, b]));
    }, 350);
    return () => clearTimeout(t);
  }, [draft, dirty]);

  // Anything that replaces or deletes work can be undone for a few seconds.
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(t);
  }, [toast]);
  const undoable = (msg, nextDraft) => {
    setToast({ msg, draft, brands, id: Date.now() });
    setDraft(nextDraft);
  };
  const undo = () => {
    if (!toast) return;
    setBrands(toast.brands);
    setDraft(toast.draft);
    setToast(null);
  };
  // Switching brands keeps work: the current draft is saved first.
  const commit = (list) => (dirty ? list.map((x) => (x.id === draft.id ? { ...draft, updatedAt: Date.now() } : x)) : list);
  const switchTo = (id) => {
    setBrands((l) => commit(l));
    setDraft(brands.find((b) => b.id === id));
  };
  const createNew = () => {
    const b = newBrand({ name: randomName() });
    setBrands((l) => [...commit(l), b]);
    setDraft(b);
    setView('brief');
  };
  const duplicate = (id) => {
    const src = id === draft.id ? draft : brands.find((b) => b.id === id);
    const b = { ...structuredClone(src), id: uid(), name: `${src.name} copia` };
    setBrands((l) => [...l, b]);
  };
  const remove = (id) => {
    const gone = brands.find((b) => b.id === id);
    setToast({ msg: `Marca «${gone?.name}» eliminada`, draft, brands, id: Date.now() });
    const rest = brands.filter((b) => b.id !== id);
    setBrands(rest);
    if (id === draft.id) setDraft(rest[0]);
  };
  const go = (v) => { setView(v); setNavOpen(false); if (v !== 'components') setDetail(null); };

  const common = { sys, brand: draft, appearance: theme, go };

  const current = NAV.find((n) => n.id === view) ?? NAV[0];
  // Highlights in the tool come from the brand being built: a pale step of its accent.
  const tint = sys.appearances.light.ramps.primary;
  const motionCfg = useMemo(() => ({ brand: draft, spring: systemSpring(sys) }), [draft, sys]);
  const shellVars = { '--c-tint': tint[3], '--c-tint-strong': tint[5], '--c-tint-ink': tint[11] };

  return (
    <BrandVars.Provider value={vars}>
    <MotionCfg.Provider value={motionCfg}>
    <div className={`app ${view === 'brief' && !draft.brief?.done ? 'no-ins' : ''}`} style={shellVars}>
      <aside className={`rail ${navOpen ? 'open' : ''}`} aria-label="Principal">
        <button className="rail-mark" onClick={() => go('home')} aria-label="Tokenforge, inicio" data-tip="Tokenforge">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="4" rx="2" /><rect x="3" y="10" width="13" height="4" rx="2" /><rect x="3" y="16" width="8" height="4" rx="2" /></svg>
        </button>
        <nav className="rail-nav">
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? 'on' : ''} aria-current={view === n.id ? 'page' : undefined} aria-label={n.label} data-tip={n.label} onClick={() => go(n.id)}>
              <Icon name={n.icon} size={20} stroke={1.6} />
              <span className="rail-label">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="rail-foot">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} data-tip={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} stroke={1.6} /><span className="rail-label">{theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}</span></button>
          <a href="https://github.com/danoreusmoreno-esp/tokenforge" target="_blank" rel="noreferrer" aria-label="Código fuente" data-tip="Código fuente"><Icon name="github" size={18} /><span className="rail-label">Código fuente</span></a>
        </div>
      </aside>
      {navOpen && <div className="scrim-app" onClick={() => setNavOpen(false)} />}

      <div className="workspace">
        <header className="topbar-app">
          <button className="pill icon only-mobile" onClick={() => setNavOpen(!navOpen)} aria-label="Menú"><Icon name="menu" size={18} /></button>
          <button className="brand-pill" onClick={() => go('home')} title="Tus marcas">
            {sys.brand.logo
              ? <img className="pill-logo" src={sys.brand.logo} alt="" />
              : <span className="sw-dots">{['primary', 'neutral', 'success', 'critical'].map((f) => <i key={f} style={{ background: sys.brand.colors[f] }} />)}</span>}
            <span className="sw-name">{draft.name}{sys.brand.subName ? ` · ${sys.brand.subName}` : ''}</span>
            <span className="crumb-sep only-desktop">/</span>
            <span className="crumb-cur only-desktop">{current.label}</span>
          </button>
          <div className="top-actions">
            <button className="pill" onClick={() => undoable('Marca aleatoria aplicada', randomize(draft))} title="Prueba color, tipografía y forma al azar. Puedes deshacerlo."><Icon name="dice" size={16} stroke={1.6} /><span className="only-desktop">Aleatoria</span></button>
            <button className="pill only-tablet icon" onClick={() => setInsOpen(!insOpen)} aria-label="Ajustes de marca"><Icon name="settings" size={16} /></button>
            {view !== 'code' && view !== 'brief' && <button className="pill dark export-btn" aria-label="Exportar" onClick={() => go('code')}><Icon name="download" size={16} stroke={1.8} /><span>Exportar</span></button>}
          </div>
        </header>

        <main className="main ds" data-theme={theme}>
          {view === 'home' && <Home {...common} setBrand={setDraft} brands={brands} activeId={draft.id} go={go} onNew={createNew} onSelect={switchTo} onDelete={remove} onDuplicate={duplicate} onStarter={(s) => { undoable(`${s.name} aplicado a ${draft.name}`, applyStarter(draft, s)); setView('board'); }} />}
          {view === 'brief' && <Brief {...common} setBrand={setDraft} go={go} />}
          {view === 'foundations' && <Foundations {...common} tab={tab} setTab={setTab} />}
          {view === 'components' && (
            <Components {...common} detail={detail} setDetail={setDetail}
              setComponents={(list) => setDraft({ ...draft, components: list })}
              setComponentToken={(id, k, val) => setDraft({ ...draft, componentTokens: { ...draft.componentTokens, [id]: { ...(draft.componentTokens?.[id] ?? {}), [k]: val } } })}
              setComponentMotion={(id, m) => { const cm = { ...(draft.componentMotion ?? {}) }; if (m) cm[id] = m; else delete cm[id]; setDraft({ ...draft, componentMotion: cm }); }} />
          )}
          {view === 'board' && <Board {...common} onOpen={(id) => { setDetail(id); setView('components'); }} />}
          {view === 'code' && <Code {...common} />}
        </main>
      </div>

      <div className={`ins-wrap ${insOpen ? 'open' : ''}`}>
        <Inspector brand={draft} update={setDraft} sys={sys} dirty={dirty} storageError={storageError} undoable={undoable} appearance={theme} setAppearance={setTheme} onRandom={() => undoable('Marca aleatoria aplicada', randomize(draft))} />
      </div>
      {toast && (
        <div className="toast-app" role="status" key={toast.id}>
          <span>{toast.msg}</span>
          <button onClick={undo}>Deshacer</button>
          <button className="x" onClick={() => setToast(null)} aria-label="Cerrar aviso"><Icon name="x" size={14} /></button>
        </div>
      )}
    </div>
    </MotionCfg.Provider>
    </BrandVars.Provider>
  );
}
