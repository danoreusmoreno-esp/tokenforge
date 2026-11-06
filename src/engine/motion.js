// Motion for components, modelled on how Motion (motion.dev) describes animation:
// springs with a bounce and a visual duration, enter/hover/tap gestures, and a few
// component-specific effects in the spirit of motion-components (sliding background,
// animated number, drawn check). Everything compiles to plain CSS so it runs without
// a library; motion.js exports the same presets for `motion/react`.

/** Spring presets per motion personality (bounce 0..1, visual duration in seconds). */
export const SPRINGS = {
  none: { bounce: 0, duration: 0 },
  snappy: { bounce: 0.1, duration: 0.25 },
  standard: { bounce: 0.2, duration: 0.35 },
  expressive: { bounce: 0.3, duration: 0.5 },
};

/**
 * Solve a damped spring from 0 to 1 and sample it into a CSS linear() easing.
 * Same parametrisation as Motion: damping ratio = 1 - bounce, stiffness from the
 * visual duration. Returns the easing and the time the spring needs to settle.
 */
export function spring(bounce = 0.2, duration = 0.35) {
  if (!duration) return { easing: 'linear', ms: 0 };
  const zeta = Math.max(0.05, 1 - bounce);
  const omega = (2 * Math.PI) / duration; // undamped angular frequency, mass 1
  const x = (t) => {
    if (zeta < 1) {
      const wd = omega * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-omega * t) * (1 + omega * t);
  };
  // Settle when within 0.1% for good; cap at 4x the visual duration.
  let end = duration;
  for (let t = duration; t < duration * 4; t += 0.005) {
    let settled = true;
    for (let u = t; u < t + 0.05; u += 0.005) if (Math.abs(1 - x(u)) > 0.001) { settled = false; break; }
    if (settled) { end = t; break; }
    end = t;
  }
  const n = 40;
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(+(x((end * i) / n)).toFixed(4));
  pts[n] = 1;
  return { easing: `linear(${pts.join(', ')})`, ms: Math.round(end * 1000) };
}

export const ENTER = {
  none: 'Sin entrada',
  fade: 'Fundido',
  'slide-up': 'Deslizar hacia arriba',
  scale: 'Escalar',
  blur: 'Desenfoque',
};
export const HOVER = {
  none: 'Ninguno',
  lift: 'Elevar',
  magnetic: 'Magnético',
  tilt: 'Inclinación 3D',
};
export const TAP = {
  none: 'Ninguna',
  press: 'Presionar',
  bounce: 'Rebote con muelle',
};
export const EFFECTS = {
  none: 'Ninguno',
  'sliding-bg': 'Fondo deslizante',
  'number': 'Número animado',
  'draw-check': 'Check que se dibuja',
  'spring-knob': 'Interruptor con muelle',
  'expand': 'Despliegue suave',
  'stagger': 'Escalonado de elementos',
};

/** Which effect makes sense for which component. */
export const EFFECT_FOR = {
  tabs: 'sliding-bg', segmented: 'sliding-bg', sidebar: 'sliding-bg', 'nav-bar': 'sliding-bg',
  stat: 'number', checkbox: 'draw-check', switch: 'spring-knob', accordion: 'expand',
  menu: 'stagger', list: 'stagger', timeline: 'stagger', 'action-sheet': 'stagger', toast: 'stagger', alert: 'stagger',
};

const OVERLAYS = ['dialog', 'popover', 'menu', 'tooltip', 'drawer', 'action-sheet', 'toast', 'combobox', 'select'];
const PRESSABLE = ['button', 'icon-button', 'fab', 'chip', 'button-group', 'toolbar', 'pagination', 'card', 'segmented', 'tabs', 'nav-bar', 'nav-rail', 'rating'];

/** Sensible defaults by component kind (Emil: overlays enter, pressables respond, nothing frequent decorates). */
export function defaultMotion(id) {
  return {
    enter: OVERLAYS.includes(id) ? (id === 'toast' || id === 'drawer' || id === 'action-sheet' ? 'slide-up' : 'scale') : 'none',
    hover: id === 'card' ? 'lift' : id === 'fab' ? 'magnetic' : 'none',
    tap: PRESSABLE.includes(id) ? (id === 'fab' || id === 'rating' ? 'bounce' : 'press') : 'none',
    effect: EFFECT_FOR[id] ?? 'none',
  };
}

export function motionFor(brand, id) {
  return { ...defaultMotion(id), ...(brand.componentMotion?.[id] ?? {}) };
}

export function systemSpring(sys) {
  const p = SPRINGS[sys.brand.motion] ?? SPRINGS.standard;
  return { ...p, ...spring(p.bounce, p.duration) };
}

// ---------------------------------------------------------------- exports

/** Keyframes and gesture classes appended to tokens.css. */
export function motionCSS(sys, ids = []) {
  const s = systemSpring(sys);
  const lines = [
    `/* Motion: springs compiled to linear(). Personality "${sys.brand.motion}" = bounce ${s.bounce}, ${s.duration}s. */`,
    `:root {\n  --spring: ${s.easing};\n  --spring-duration: ${s.ms}ms;\n  --ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);\n}`,
    `@keyframes enter-fade { from { opacity: 0; } }`,
    `@keyframes enter-slide-up { from { opacity: 0; transform: translateY(12px); } }`,
    `@keyframes enter-scale { from { opacity: 0; transform: scale(0.96); } }`,
    `@keyframes enter-blur { from { opacity: 0; filter: blur(6px); } }`,
    `[data-enter="fade"] { animation: enter-fade var(--duration-base) var(--ease-out-strong) both; }`,
    `[data-enter="slide-up"] { animation: enter-slide-up var(--spring-duration) var(--spring) both; }`,
    `[data-enter="scale"] { animation: enter-scale var(--spring-duration) var(--spring) both; transform-origin: var(--transform-origin, center); }`,
    `[data-enter="blur"] { animation: enter-blur var(--duration-slow) var(--ease-out-strong) both; }`,
    `[data-tap] { transition: transform var(--spring-duration) var(--spring); }`,
    `[data-tap="press"]:active { transform: scale(0.97); transition-duration: 100ms; transition-timing-function: var(--ease-out-strong); }`,
    `[data-tap="bounce"]:active { transform: scale(0.92); transition-duration: 90ms; }`,
    `@media (hover: hover) and (pointer: fine) {\n  [data-hover="lift"] { transition: transform var(--spring-duration) var(--spring), box-shadow var(--duration-base) var(--ease-out-strong); }\n  [data-hover="lift"]:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }\n}`,
    `@media (prefers-reduced-motion: reduce) {\n  [data-enter] { animation-name: enter-fade; animation-duration: 1ms; }\n  [data-tap], [data-hover] { transition: none; transform: none !important; }\n}`,
  ];
  if (ids.length) {
    lines.push(`/* Per component: put the attributes on the root element.\n${ids.map((id) => {
      const m = motionFor(sys.brand.__master ?? sys.brand, id);
      const attrs = [m.enter !== 'none' && `data-enter="${m.enter}"`, m.hover !== 'none' && `data-hover="${m.hover}"`, m.tap !== 'none' && `data-tap="${m.tap}"`].filter(Boolean).join(' ');
      return attrs || m.effect !== 'none' ? `   ${id}: ${attrs || '—'}${m.effect !== 'none' ? ` · effect ${m.effect}` : ''}` : null;
    }).filter(Boolean).join('\n')}\n*/`);
  }
  return lines.join('\n');
}

/** motion.js — presets for motion/react (motion.dev). */
export function toMotionJS(sys) {
  const brand = sys.brand.__master ?? sys.brand;
  const p = SPRINGS[brand.motion] ?? SPRINGS.standard;
  const ids = brand.components ?? [];
  const enter = {
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
    'slide-up': { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } },
    scale: { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 } },
    blur: { initial: { opacity: 0, filter: 'blur(6px)' }, animate: { opacity: 1, filter: 'blur(0px)' } },
  };
  const comp = {};
  for (const id of ids) {
    const m = motionFor(brand, id);
    const o = {};
    if (m.enter !== 'none') Object.assign(o, enter[m.enter], { exit: enter[m.enter].initial });
    if (m.hover === 'lift') o.whileHover = { y: -3 };
    if (m.tap === 'press') o.whileTap = { scale: 0.97 };
    if (m.tap === 'bounce') o.whileTap = { scale: 0.92 };
    if (m.effect !== 'none') o.effect = m.effect;
    if (Object.keys(o).length) comp[id] = o;
  }
  return `// ${brand.name} — motion presets for motion/react (https://motion.dev).
// Usage: import { motion } from 'motion/react'; import { spring, components } from './motion.js';
//        <motion.button {...components.button} transition={spring}>Guardar</motion.button>
// Respect reduced motion: wrap the app in <MotionConfig reducedMotion="user">.

export const spring = ${JSON.stringify(p.duration ? { type: 'spring', bounce: p.bounce, visualDuration: p.duration } : { duration: 0 }, null, 2)};

export const easeOut = [0.23, 1, 0.32, 1];

/** Stagger children by 50 ms (lists, menus, toasts). */
export const stagger = { animate: { transition: { staggerChildren: 0.05 } } };

/** Per component, as chosen in Tokenforge. "effect" names a pattern to build:
 *  sliding-bg → a shared layoutId highlight behind the active item; number → animate the value;
 *  draw-check → animate pathLength; spring-knob → layout transition on the knob; expand → height: 'auto'. */
export const components = ${JSON.stringify(comp, null, 2)};
`;
}

export function motionAgents(sys) {
  const brand = sys.brand.__master ?? sys.brand;
  const p = SPRINGS[brand.motion] ?? SPRINGS.standard;
  return `\n## Motion\nPersonality "${brand.motion}": spring bounce ${p.bounce}, visual duration ${p.duration}s (\`--spring\`, \`--spring-duration\` in tokens.css; \`spring\` in motion.js).\n- Animate only transform and opacity (and filter for blur). Never animate layout properties.\n- Overlays enter with scale 0.96 + fade from their trigger; never from scale(0).\n- Buttons scale to 0.97 while pressed. Nothing that is used many times a minute gets an entrance.\n- Use the per-component presets in motion.js; honour prefers-reduced-motion (MotionConfig reducedMotion="user").\n`;
}
