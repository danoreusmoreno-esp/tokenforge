// Step 1 · Bases — the questions a team answers before building a design system,
// following the usual order: why, what problems, how to measure, what exists,
// who is involved, which approach, and the principles that guide decisions.
import { CORE_IDS, SYSTEMS } from './catalog.js';
import { normalizeHex } from './color.js';

export const EMPTY_BRIEF = {
  done: false,
  goals: [],
  why: '',
  success: [],
  scale: '',
  team: '',
  products: '',
  productType: [],
  platforms: [],
  approach: '',
  framework: '',
  assets: [],
  brandColor: '',
  brandFont: '',
  stakeholders: [],
  stack: [],
  principles: [],
  personality: { tone: 50, energy: 50, density: 50, shape: 50 },
  a11y: 'AA',
  darkMode: 'yes',
  constraints: '',
};

const o = (id, label, hint, en) => ({ id, label, hint, en });

export const QUESTIONS = {
  goals: [
    o('consistency', 'Aspecto incoherente entre pantallas o plataformas', 'Lo mismo se ve distinto según dónde estés.'),
    o('speed', 'Actualizaciones lentas y manuales', 'Cambiar un color o un botón obliga a tocar muchos archivos.'),
    o('handoff', 'Fricción entre diseño y código', 'Las especificaciones se pierden entre Figma y el código.'),
    o('onboarding', 'A la gente nueva le cuesta ponerse al día', 'No hay un sitio único que explique cómo se construye.'),
    o('scale', 'Vienen más productos, marcas o equipos', 'Lo que funciona para un producto no aguantará tres.'),
    o('a11y', 'Carencias de accesibilidad', 'Contraste, foco y etiquetas se arreglan uno a uno.'),
    o('ai', 'Los agentes de IA generan interfaces fuera de marca', 'Se inventan colores y espaciados en lugar de usar tokens.'),
  ],
  success: [
    o('adoption', 'Porcentaje de pantallas hechas con componentes del sistema'),
    o('time', 'Tiempo para diseñar y construir una pantalla nueva'),
    o('oneoffs', 'Menos colores, tamaños y estilos sueltos'),
    o('a11y', 'Problemas de accesibilidad detectados en auditorías'),
    o('handoff', 'Tiempo y retrabajo en el traspaso de diseño a desarrollo'),
    o('satisfaction', 'Satisfacción del equipo con el sistema'),
  ],
  team: [o('solo', 'Solo yo'), o('small', '2–10 personas'), o('mid', '10–50 personas'), o('large', 'Más de 50 personas')],
  products: [o('one', 'Un producto'), o('few', '2–3 productos'), o('many', 'Muchos productos o marcas')],
  productType: [
    o('saas', 'App web / SaaS'), o('commerce', 'E-commerce'), o('dashboard', 'Dashboard / herramienta interna'),
    o('mobile', 'App móvil'), o('marketing', 'Web de marketing'), o('content', 'Contenido / editorial'),
  ],
  platforms: [o('web', 'Web'), o('ios', 'iOS'), o('android', 'Android'), o('desktop', 'App de escritorio'), o('email', 'Email')],
  approach: [
    o('scratch', 'Crear desde cero', 'A tu medida. Requiere más tiempo al principio.'),
    o('audit', 'Partir de lo que ya tenemos', 'Auditar el producto actual, consolidar y estandarizar.'),
    o('adopt', 'Adoptar un sistema existente y adaptarlo', 'Arranque más rápido; necesita personalización.'),
  ],
  assets: [
    o('guidelines', 'Guía de marca'), o('palette', 'Paleta de colores'), o('fonts', 'Tipografías de marca'), o('logo', 'Logotipo'),
    o('voice', 'Guía de voz y tono'), o('figma', 'Librería de Figma'), o('code', 'Componentes en código'), o('icons', 'Set de iconos'),
  ],
  stakeholders: [
    o('design', 'Diseño'), o('engineering', 'Desarrollo'), o('product', 'Producto'), o('marketing', 'Marketing / marca'),
    o('support', 'Atención al cliente'), o('leadership', 'Dirección'), o('content', 'Contenido / UX writing'),
  ],
  stack: [
    o('react', 'React'), o('vue', 'Vue'), o('angular', 'Angular'), o('svelte', 'Svelte'), o('webc', 'Web components'),
    o('tailwind', 'Tailwind'), o('swiftui', 'SwiftUI'), o('compose', 'Jetpack Compose'), o('none', 'Sin decidir'),
  ],
  principles: [
    o('accessible', 'Accesible', 'Que lo pueda usar cualquier persona, sean cuales sean sus capacidades.', ['Accessible', 'Usable by everyone, whatever their abilities.']),
    o('clear', 'Claro', 'Una cosa cada vez; nunca hay que adivinar qué hace un control.', ['Clear', 'Say one thing at a time; no guessing what a control does.']),
    o('predictable', 'Predecible', 'Mismo patrón, mismo comportamiento, en todas partes.', ['Predictable', 'Same pattern, same behaviour, everywhere.']),
    o('simple', 'Simple', 'Quitar antes que añadir; las mínimas opciones que funcionan.', ['Simple', 'Remove before adding; the fewest options that work.']),
    o('efficient', 'Eficiente', 'Menos pasos en las tareas frecuentes; denso cuando ayuda.', ['Efficient', 'Fewer steps for frequent tasks; dense when it helps.']),
    o('trustworthy', 'Fiable', 'Feedback sereno y honesto; sin sorpresas con los datos o el dinero.', ['Trustworthy', 'Calm, honest feedback; no surprises with data or money.']),
    o('expressive', 'Expresivo', 'Personalidad en el color, la forma y el movimiento.', ['Expressive', 'Personality in colour, shape and motion.']),
    o('inclusive', 'Inclusivo', 'Lenguaje, imágenes y valores por defecto que respetan a todo el mundo.', ['Inclusive', 'Language, imagery and defaults that respect everyone.']),
    o('craft', 'Cuidado', 'Los detalles importan: alineación, ritmo y estados.', ['Crafted', 'Details matter: alignment, rhythm, states.']),
    o('flexible', 'Flexible', 'Funciona en varios productos, marcas y plataformas.', ['Flexible', 'Works across products, brands and platforms.']),
  ],
};

export const PERSONALITY = [
  { id: 'tone', left: 'Serio', right: 'Lúdico' },
  { id: 'energy', left: 'Calmado', right: 'Enérgico' },
  { id: 'density', left: 'Compacto', right: 'Espacioso' },
  { id: 'shape', left: 'Anguloso', right: 'Redondeado' },
];

export const WIZARD_STEPS = [
  { id: 'why', title: '¿Por qué un sistema de diseño?', intro: 'Poneos de acuerdo primero en los motivos. Todo lo demás sale de ahí.' },
  { id: 'scope', title: '¿Para quién y para qué?', intro: 'Una diseñadora sola y una empresa de 50 personas necesitan sistemas muy distintos.' },
  { id: 'start', title: '¿Por dónde empiezas?', intro: 'Haz inventario de lo que existe y elige un enfoque.' },
  { id: 'people', title: '¿Quién participa?', intro: 'Un sistema de diseño es un trabajo de equipo. Nombra a las personas y la tecnología.' },
  { id: 'principles', title: 'Principios rectores', intro: 'Elige hasta tres. Son la estrella polar de cada decisión.' },
  { id: 'personality', title: 'Personalidad y estándares', intro: 'Estos deslizadores definen la primera versión de tus foundations.' },
];

const pick = (v, steps) => steps[Math.min(steps.length - 1, Math.floor((v / 101) * steps.length))];

/** Turn answers into a starting brand: foundations + component set. Pure. */
export function recommend(brief, brand) {
  const p = brief.personality;
  const types = new Set(brief.productType);
  const plats = new Set(brief.platforms);

  let density = pick(p.density, ['compact', 'snug', 'default', 'comfortable', 'spacious']);
  if (types.has('dashboard') && p.density > 40 && p.density < 60) density = 'snug';
  const shapeSteps = ['none', 'subtle', 'soft', 'rounded', 'large'];
  const boxes = pick(p.shape, shapeSteps);
  const fields = p.shape > 85 ? 'pill' : pick(p.shape, shapeSteps.slice(0, 4));
  const selectors = p.shape > 70 ? 'pill' : pick(p.shape, ['none', 'subtle', 'soft']);
  const motion = pick(p.energy, ['none', 'snappy', 'standard', 'expressive']);
  const shadow = pick(p.energy, ['none', 'subtle', 'medium']);
  const spacing = pick(p.density, ['tight', 'quiet', 'roomy']);

  let font = 'Inter';
  let headingFont = 'Inter';
  if (types.has('content')) { font = 'Source Serif 4'; headingFont = 'Fraunces'; }
  else if (p.tone > 70) { font = 'DM Sans'; headingFont = 'Outfit'; }
  else if (p.tone > 50) { font = 'Plus Jakarta Sans'; headingFont = 'Plus Jakarta Sans'; }
  else if (p.tone < 25) { font = 'IBM Plex Sans'; headingFont = 'IBM Plex Sans'; }
  if (brief.brandFont.trim()) { font = brief.brandFont.trim(); headingFont = font; }

  const primary = normalizeHex(brief.brandColor || '') || brand.colors.primary;

  const comps = new Set(CORE_IDS);
  const add = (...ids) => ids.forEach((i) => comps.add(i));
  if (types.has('saas')) add('breadcrumb', 'pagination', 'combobox', 'search', 'popover', 'empty-state', 'skeleton', 'save-bar', 'segmented', 'inline-edit', 'context-menu', 'page-banner');
  if (types.has('dashboard')) add('stat', 'pagination', 'search', 'segmented', 'date-picker', 'skeleton', 'empty-state', 'toolbar', 'topbar', 'inline-edit', 'context-menu', 'time-picker');
  if (types.has('commerce')) add('rating', 'number-input', 'search', 'breadcrumb', 'pagination', 'drawer', 'save-bar', 'file-upload', 'product-card', 'carousel', 'page-banner', 'hero');
  if (types.has('marketing')) add('accordion', 'link', 'divider', 'hero', 'media-card', 'pricing-card', 'carousel', 'page-banner');
  if (types.has('content')) add('accordion', 'breadcrumb', 'pagination', 'divider', 'code', 'hero', 'media-card', 'profile-card');
  if (types.has('mobile') || plats.has('ios') || plats.has('android')) add('nav-bar', 'action-sheet', 'drawer', 'segmented', 'page-control');
  if (plats.has('desktop')) add('toolbar', 'nav-rail', 'kbd', 'menu', 'context-menu');
  if (brief.goals.includes('ai')) add('code');

  return {
    ...brand,
    colors: { ...brand.colors, primary },
    font,
    headingFont,
    density,
    radius: { boxes, fields, selectors },
    shadow,
    spacing,
    motion,
    components: [...comps],
    brief: { ...brief, done: true },
  };
}

/** A short scale label used in the summary and docs. */
export function scaleLabel(brief) {
  const t = { solo: 'una sola persona', small: 'un equipo pequeño', mid: 'un equipo mediano', large: 'una organización grande' }[brief.team] ?? 'un equipo';
  const pr = { one: 'un producto', few: 'varios productos', many: 'muchos productos o marcas' }[brief.products] ?? 'sus productos';
  return `${t} que trabaja en ${pr}`;
}

export function recommendedScope(brief) {
  if (brief.team === 'solo' || (brief.team === 'small' && brief.products === 'one')) {
    return { level: 'Ligero', text: 'Empieza ligero: tokens, un set básico de componentes y algunas plantillas. Hazlo crecer al ritmo del equipo y los productos.' };
  }
  if (brief.team === 'large' || brief.products === 'many') {
    return { level: 'Completo', text: 'Planifica un sistema completo: tokens multimarca, gobierno, modelo de contribución, versionado y web de documentación.' };
  }
  return { level: 'Estándar', text: 'Un sistema estándar: foundations completas, librería de componentes documentada y un proceso de publicación.' };
}

const label = (list, id) => QUESTIONS[list].find((x) => x.id === id)?.label ?? id;

/** BRIEF.md — the shared agreement written down first (in Spanish, for the team). */
export function toBrief(sys) {
  const b = { ...EMPTY_BRIEF, ...(sys.brand.brief ?? {}) };
  const name = sys.brand.name;
  const scope = recommendedScope(b);
  const list = (key, ids) => (ids.length ? ids.map((id) => `- ${label(key, id)}`).join('\n') : '- _Sin responder todavía_');
  const pr = b.principles.map((id) => QUESTIONS.principles.find((x) => x.id === id)).filter(Boolean);
  const dark = { yes: 'desde el primer día', later: 'más adelante', no: 'no se necesita' }[b.darkMode];
  return `# ${name} — brief del sistema de diseño

## Por qué lo construimos
${list('goals', b.goals)}
${b.why ? `\n${b.why}\n` : ''}
## Cómo sabremos que funciona
${list('success', b.success)}

## Alcance
Pensado para ${scaleLabel(b)}.
- Tipo de producto: ${b.productType.map((x) => label('productType', x)).join(', ') || '—'}
- Plataformas: ${b.platforms.map((x) => label('platforms', x)).join(', ') || '—'}
- Alcance recomendado: **${scope.level}**. ${scope.text}

## Punto de partida
- Enfoque: ${b.approach ? label('approach', b.approach) : '—'}${b.approach === 'adopt' && b.framework ? ` (${SYSTEMS[b.framework]?.name})` : ''}
- Recursos existentes: ${b.assets.map((x) => label('assets', x)).join(', ') || 'ninguno'}

## Personas
- Participan: ${b.stakeholders.map((x) => label('stakeholders', x)).join(', ') || '—'}
- Tecnología: ${b.stack.map((x) => label('stack', x)).join(', ') || '—'}

## Principios
${pr.length ? pr.map((x) => `### ${x.label}\n${x.hint}`).join('\n\n') : '_Elige hasta tres principios._'}

## Estándares
- Accesibilidad: WCAG 2.2 ${b.a11y}
- Modo oscuro: ${dark}
${b.constraints ? `- Restricciones: ${b.constraints}\n` : ''}
## Hoja de ruta
1. **Bases** — este brief, un inventario visual del producto actual y personas que lo defiendan en cada disciplina.
2. **Foundations** — accesibilidad, color (aprox. 60 % neutros, 30 % primario, 10 % acento), tipografía sobre una base de 16 px, elevación, iconografía, espaciado y cuadrículas, tokens primitivos → semánticos.
3. **Componentes** — ${sys.brand.components?.length ?? 0} componentes elegidos; primero las piezas simples y luego las compuestas. Nómbralos por su función, no por su aspecto.
4. **Librería y despliegue** — publica tokens y componentes, documenta su uso, recoge feedback e itera.
`;
}
