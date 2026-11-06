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

const o = (id, label, hint) => ({ id, label, hint });

export const QUESTIONS = {
  goals: [
    o('consistency', 'Inconsistent look across screens or platforms', 'The same thing looks different in different places.'),
    o('speed', 'Slow, manual updates', 'Changing a colour or a button means touching many files.'),
    o('handoff', 'Friction between design and code', 'Specs get lost between Figma and the codebase.'),
    o('onboarding', 'New people take long to get up to speed', 'No single place explains how things are built.'),
    o('scale', 'More products, brands or teams coming', 'What works for one product will not hold for three.'),
    o('a11y', 'Accessibility gaps', 'Contrast, focus and labels are fixed one by one.'),
    o('ai', 'AI agents generate off-brand UI', 'Agents guess colours and spacing instead of using tokens.'),
  ],
  success: [
    o('adoption', 'Share of screens built with system components'),
    o('time', 'Time to design and build a new screen'),
    o('oneoffs', 'Fewer one-off colours, sizes and styles'),
    o('a11y', 'Accessibility issues found in audits'),
    o('handoff', 'Design-to-dev handoff time and rework'),
    o('satisfaction', 'Team satisfaction with the system'),
  ],
  team: [o('solo', 'Just me'), o('small', '2–10 people'), o('mid', '10–50 people'), o('large', '50+ people')],
  products: [o('one', 'One product'), o('few', '2–3 products'), o('many', 'Many products or brands')],
  productType: [
    o('saas', 'Web app / SaaS'), o('commerce', 'E-commerce'), o('dashboard', 'Dashboard / internal tool'),
    o('mobile', 'Mobile app'), o('marketing', 'Marketing website'), o('content', 'Content / editorial'),
  ],
  platforms: [o('web', 'Web'), o('ios', 'iOS'), o('android', 'Android'), o('desktop', 'Desktop app'), o('email', 'Email')],
  approach: [
    o('scratch', 'Build from scratch', 'Fully tailored. More time up front.'),
    o('audit', 'Start from what we already have', 'Audit the current product, consolidate and standardise.'),
    o('adopt', 'Adopt an existing system and adapt it', 'Faster start; needs customisation to fit.'),
  ],
  assets: [
    o('guidelines', 'Brand guidelines'), o('palette', 'Colour palette'), o('fonts', 'Brand fonts'), o('logo', 'Logo'),
    o('voice', 'Voice and tone guide'), o('figma', 'Figma library'), o('code', 'Coded components'), o('icons', 'Icon set'),
  ],
  stakeholders: [
    o('design', 'Design'), o('engineering', 'Engineering'), o('product', 'Product'), o('marketing', 'Marketing / brand'),
    o('support', 'Customer support'), o('leadership', 'Leadership'), o('content', 'Content / UX writing'),
  ],
  stack: [
    o('react', 'React'), o('vue', 'Vue'), o('angular', 'Angular'), o('svelte', 'Svelte'), o('webc', 'Web components'),
    o('tailwind', 'Tailwind'), o('swiftui', 'SwiftUI'), o('compose', 'Jetpack Compose'), o('none', 'Not decided'),
  ],
  principles: [
    o('accessible', 'Accessible', 'Usable by everyone, whatever their abilities.'),
    o('clear', 'Clear', 'Say one thing at a time; no guessing what a control does.'),
    o('predictable', 'Predictable', 'Same pattern, same behaviour, everywhere.'),
    o('simple', 'Simple', 'Remove before adding; the fewest options that work.'),
    o('efficient', 'Efficient', 'Fewer steps for frequent tasks; dense when it helps.'),
    o('trustworthy', 'Trustworthy', 'Calm, honest feedback; no surprises with data or money.'),
    o('expressive', 'Expressive', 'Personality in colour, shape and motion.'),
    o('inclusive', 'Inclusive', 'Language, imagery and defaults that respect everyone.'),
    o('craft', 'Crafted', 'Details matter: alignment, rhythm, states.'),
    o('flexible', 'Flexible', 'Works across products, brands and platforms.'),
  ],
};

export const PERSONALITY = [
  { id: 'tone', left: 'Serious', right: 'Playful' },
  { id: 'energy', left: 'Calm', right: 'Energetic' },
  { id: 'density', left: 'Compact', right: 'Spacious' },
  { id: 'shape', left: 'Sharp', right: 'Rounded' },
];

export const WIZARD_STEPS = [
  { id: 'why', title: 'Why a design system?', intro: 'Agree on the reasons first. Everything else follows from them.' },
  { id: 'scope', title: 'Who and what is it for?', intro: 'A solo designer and a 50-person org need very different systems.' },
  { id: 'start', title: 'Where do you start?', intro: 'Inventory what exists and choose an approach.' },
  { id: 'people', title: 'Who is involved?', intro: 'A design system is a team effort. Name the people and the stack.' },
  { id: 'principles', title: 'Guiding principles', intro: 'Pick up to three. They are the north star for every decision.' },
  { id: 'personality', title: 'Personality and standards', intro: 'These sliders set the first version of your foundations.' },
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

  const accent = normalizeHex(brief.brandColor || '') || brand.colors.accent;

  const comps = new Set(CORE_IDS);
  const add = (...ids) => ids.forEach((i) => comps.add(i));
  if (types.has('saas')) add('breadcrumb', 'pagination', 'combobox', 'search', 'popover', 'empty-state', 'skeleton', 'save-bar', 'segmented');
  if (types.has('dashboard')) add('stat', 'pagination', 'search', 'segmented', 'date-picker', 'skeleton', 'empty-state', 'toolbar', 'topbar');
  if (types.has('commerce')) add('rating', 'number-input', 'search', 'breadcrumb', 'pagination', 'drawer', 'save-bar', 'file-upload');
  if (types.has('marketing')) add('accordion', 'link', 'divider');
  if (types.has('content')) add('accordion', 'breadcrumb', 'pagination', 'divider', 'code');
  if (types.has('mobile') || plats.has('ios') || plats.has('android')) add('nav-bar', 'action-sheet', 'drawer', 'segmented', 'page-control');
  if (plats.has('desktop')) add('toolbar', 'nav-rail', 'kbd', 'menu');
  if (brief.goals.includes('ai')) add('code');

  return {
    ...brand,
    colors: { ...brand.colors, accent },
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
  const t = { solo: 'a solo designer', small: 'a small team', mid: 'a mid-size team', large: 'a large organisation' }[brief.team] ?? 'a team';
  const pr = { one: 'one product', few: 'a few products', many: 'many products or brands' }[brief.products] ?? 'its products';
  return `${t} working on ${pr}`;
}

export function recommendedScope(brief) {
  if (brief.team === 'solo' || (brief.team === 'small' && brief.products === 'one')) {
    return { level: 'Lean', text: 'Start lean: tokens, a core set of components and a few templates. Grow it as the team and products grow.' };
  }
  if (brief.team === 'large' || brief.products === 'many') {
    return { level: 'Full', text: 'Plan a full system: multi-brand tokens, governance, contribution model, versioning and documentation site.' };
  }
  return { level: 'Standard', text: 'A standard system: complete foundations, a documented component library and a release process.' };
}

const label = (list, id) => QUESTIONS[list].find((x) => x.id === id)?.label ?? id;

/** BRIEF.md — the shared agreement the guide recommends writing down first. */
export function toBrief(sys) {
  const b = sys.brand.brief ?? EMPTY_BRIEF;
  const name = sys.brand.name;
  const scope = recommendedScope(b);
  const list = (key, ids) => (ids.length ? ids.map((id) => `- ${label(key, id)}`).join('\n') : '- _Not answered yet_');
  const pr = b.principles.map((id) => QUESTIONS.principles.find((x) => x.id === id)).filter(Boolean);
  return `# ${name} — design system brief

## Why we are building it
${list('goals', b.goals)}
${b.why ? `\n${b.why}\n` : ''}
## How we will know it works
${list('success', b.success)}

## Scope
Built for ${scaleLabel(b)}.
- Product types: ${b.productType.map((x) => label('productType', x)).join(', ') || '—'}
- Platforms: ${b.platforms.map((x) => label('platforms', x)).join(', ') || '—'}
- Recommended scope: **${scope.level}**. ${scope.text}

## Starting point
- Approach: ${b.approach ? label('approach', b.approach) : '—'}${b.approach === 'adopt' && b.framework ? ` (${SYSTEMS[b.framework]?.name})` : ''}
- Existing assets: ${b.assets.map((x) => label('assets', x)).join(', ') || 'none listed'}

## People
- Involved: ${b.stakeholders.map((x) => label('stakeholders', x)).join(', ') || '—'}
- Tech stack: ${b.stack.map((x) => label('stack', x)).join(', ') || '—'}

## Principles
${pr.length ? pr.map((x) => `### ${x.label}\n${x.hint}`).join('\n\n') : '_Pick up to three principles._'}

## Standards
- Accessibility target: WCAG 2.2 ${b.a11y}
- Dark mode: ${b.darkMode === 'yes' ? 'from day one' : b.darkMode === 'later' ? 'planned' : 'not needed'}
${b.constraints ? `- Constraints: ${b.constraints}\n` : ''}
## Roadmap
1. **Bases** — this brief, a visual inventory of the current product, champions in each discipline.
2. **Foundations** — accessibility, colour (aim for roughly 60% neutrals, 30% primary, 10% accent), typography around a 16px base, elevation, iconography, spacing and grids, primitive → semantic tokens.
3. **Components** — ${sys.brand.components?.length ?? 0} components chosen; build simple parts first, then compose them. Name by purpose, not by look.
4. **Library and rollout** — publish tokens and components, document usage, gather feedback, iterate.
`;
}
