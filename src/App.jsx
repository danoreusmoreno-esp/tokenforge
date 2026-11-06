import { useEffect, useMemo, useState } from 'react';
import { computeSystem } from './engine/tokens.js';
import { cssVars } from './engine/exporters.js';
import { loadBrands, saveBrands, loadActive, saveActive, newBrand, randomize, randomName, applyStarter, decodeBrand, uid } from './store.js';
import Inspector from './components/Inspector.jsx';
import { Icon } from './components/Icons.jsx';
import { BrandVars } from './components/Live.jsx';
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

function useGoogleFonts(fonts) {
  const key = [...new Set(fonts)].join('|');
  useEffect(() => {
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
  useEffect(() => { saveBrands(brands); }, [brands]);
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

  const sys = useMemo(() => computeSystem(draft), [draft]);
  const vars = useMemo(() => cssVars(sys, theme, 'desktop', draft.components), [sys, theme, draft.components]);
  useGoogleFonts([sys.fonts.body, sys.fonts.heading, sys.fonts.mono]);

  const saved = brands.find((b) => b.id === draft.id);
  const dirty = !saved || JSON.stringify({ ...saved, updatedAt: 0 }) !== JSON.stringify({ ...draft, updatedAt: 0 });

  const save = () => {
    const b = { ...draft, updatedAt: Date.now() };
    setDraft(b);
    setBrands((list) => (list.some((x) => x.id === b.id) ? list.map((x) => (x.id === b.id ? b : x)) : [...list, b]));
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
    const rest = brands.filter((b) => b.id !== id);
    setBrands(rest);
    if (id === draft.id) setDraft(rest[0]);
  };
  const go = (v) => { setView(v); setNavOpen(false); if (v !== 'components') setDetail(null); };

  const common = { sys, brand: draft, appearance: theme };

  const current = NAV.find((n) => n.id === view) ?? NAV[0];

  return (
    <BrandVars.Provider value={vars}>
    <div className="app">
      <aside className={`sidebar ${navOpen ? 'open' : ''}`} aria-label="Principal">
        <div className="product">
          <svg className="mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="4" rx="1.5" /><rect x="3" y="10" width="13" height="4" rx="1.5" /><rect x="3" y="16" width="8" height="4" rx="1.5" /></svg>
          <span>Tokenforge</span>
        </div>
        <button className="switcher" onClick={() => go('home')} title="Cambiar de marca">
          <span className="sw-dots">{['accent', 'neutral', 'success', 'critical'].map((f) => <i key={f} style={{ background: draft.colors[f] }} />)}</span>
          <span className="sw-name">{draft.name}</span>
          <Icon name="chevDown" size={14} />
        </button>
        <nav className="nav-list">
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? 'on' : ''} aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
              <Icon name={n.icon} size={16} stroke={1.6} /><span>{n.label}</span>
              {n.id === 'components' && <span className="count">{draft.components?.length ?? 0}</span>}
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} stroke={1.6} /><span>{theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}</span></button>
          <a href="https://github.com/danoreusmoreno-esp/tokenforge" target="_blank" rel="noreferrer"><Icon name="github" size={15} /><span>Código fuente</span></a>
        </div>
      </aside>
      {navOpen && <div className="scrim-app" onClick={() => setNavOpen(false)} />}

      <header className="topbar-app">
        <button className="tb-btn icon only-mobile" onClick={() => setNavOpen(!navOpen)} aria-label="Menú"><Icon name="menu" size={18} /></button>
        <div className="crumbs-app"><span className="only-desktop">{draft.name}</span><Icon name="chevRight" size={12} className="only-desktop" /><b>{current.label}</b></div>
        <div className="top-actions">
          <button className="tb-btn" onClick={() => setDraft(randomize(draft))} title="Generar una marca aleatoria"><Icon name="dice" size={16} stroke={1.6} /><span className="only-desktop">Aleatoria</span></button>
          <button className="tb-btn only-mobile icon" onClick={() => setInsOpen(!insOpen)} aria-label="Ajustes de marca"><Icon name="settings" size={16} /></button>
          {view !== 'code' && <button className="tb-btn primary" onClick={() => go('code')}><Icon name="download" size={15} stroke={1.8} /><span>Exportar</span></button>}
        </div>
      </header>

      <div className="sheet">
      <main className="main ds" data-theme={theme}>
        {view === 'home' && <Home {...common} brands={brands} activeId={draft.id} go={go} onNew={createNew} onSelect={switchTo} onDelete={remove} onDuplicate={duplicate} onStarter={(s) => { setDraft(applyStarter(draft, s)); setView('board'); }} />}
        {view === 'brief' && <Brief {...common} setBrand={setDraft} go={go} />}
        {view === 'foundations' && <Foundations {...common} tab={tab} setTab={setTab} />}
        {view === 'components' && (
          <Components {...common} detail={detail} setDetail={setDetail}
            setComponents={(list) => setDraft({ ...draft, components: list })}
            setComponentToken={(id, k, val) => setDraft({ ...draft, componentTokens: { ...draft.componentTokens, [id]: { ...(draft.componentTokens?.[id] ?? {}), [k]: val } } })} />
        )}
        {view === 'board' && <Board {...common} onOpen={(id) => { setDetail(id); setView('components'); }} />}
        {view === 'code' && <Code {...common} />}
      </main>

      <div className={`ins-wrap ${insOpen ? 'open' : ''}`}>
        <Inspector brand={draft} update={setDraft} sys={sys} dirty={dirty} onSave={save} onRandom={() => setDraft(randomize(draft))} />
      </div>
      </div>
    </div>
    </BrandVars.Provider>
  );
}
