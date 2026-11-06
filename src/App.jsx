import { useEffect, useMemo, useState } from 'react';
import { computeSystem } from './engine/tokens.js';
import { cssVars } from './engine/exporters.js';
import { loadBrands, saveBrands, loadActive, saveActive, newBrand, randomize, randomName, applyStarter, decodeBrand, uid } from './store.js';
import Inspector from './components/Inspector.jsx';
import { Icon } from './components/Icons.jsx';
import Home from './views/Home.jsx';
import Board from './views/Board.jsx';
import Foundations from './views/Foundations.jsx';
import Components from './views/Components.jsx';
import Code from './views/Code.jsx';

const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'foundations', label: 'Foundations', icon: 'palette' },
  { id: 'components', label: 'Components', icon: 'grid' },
  { id: 'board', label: 'Board', icon: 'layers' },
  { id: 'code', label: 'Export', icon: 'code' },
];

function readParams() {
  const p = new URLSearchParams(location.search);
  return { view: p.get('view') || 'home', tab: p.get('tab') || 'color', comp: p.get('component') };
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
    if (shared) { shared.name = `${shared.name} (shared)`; return [...list, shared]; }
    return list;
  });
  const [activeId, setActiveId] = useState(() => {
    if (location.hash.startsWith('#b=')) return null;
    const a = loadActive();
    return a;
  });
  const savedActive = brands.find((b) => b.id === activeId) ?? brands[brands.length - 1];
  const [draft, setDraft] = useState(savedActive);
  const [view, setView] = useState(init.view);
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
    setView('foundations');
  };
  const duplicate = (id) => {
    const src = id === draft.id ? draft : brands.find((b) => b.id === id);
    const b = { ...structuredClone(src), id: uid(), name: `${src.name} copy` };
    setBrands((l) => [...l, b]);
  };
  const remove = (id) => {
    const rest = brands.filter((b) => b.id !== id);
    setBrands(rest);
    if (id === draft.id) setDraft(rest[0]);
  };
  const go = (v) => { setView(v); setNavOpen(false); if (v !== 'components') setDetail(null); };

  const common = { sys, brand: draft, appearance: theme };

  return (
    <div className="app">
      <header className="topbar-app">
        <button className="chrome-btn icon only-mobile" onClick={() => setNavOpen(!navOpen)} aria-label="Menu"><Icon name="menu" size={18} /></button>
        <div className="brandmark"><span className="mark" /> Tokenforge <span className="beta">Beta</span></div>
        <span className="sep only-desktop">|</span>
        <span className="crumb only-desktop">{draft.name}</span>
        <div className="top-actions">
          <button className="chrome-btn" onClick={() => setDraft(randomize(draft))} title="Roll a random brand"><Icon name="dice" size={16} /><span className="only-desktop">Random</span></button>
          <button className="chrome-btn icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme" title="Light / dark"><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} /></button>
          <button className="chrome-btn only-mobile" onClick={() => setInsOpen(!insOpen)}><Icon name="settings" size={16} /></button>
        </div>
      </header>

      <nav className={`rail ${navOpen ? 'open' : ''}`} aria-label="Main">
        {NAV.map((n) => (
          <button key={n.id} className={view === n.id ? 'on' : ''} onClick={() => go(n.id)}>
            <Icon name={n.icon} size={18} /><span>{n.label}</span>
          </button>
        ))}
      </nav>

      <main className="main ds" data-theme={theme} style={vars}>
        {view === 'home' && <Home {...common} brands={brands} activeId={draft.id} go={go} onNew={createNew} onSelect={switchTo} onDelete={remove} onDuplicate={duplicate} onStarter={(s) => { setDraft(applyStarter(draft, s)); setView('board'); }} />}
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
  );
}
