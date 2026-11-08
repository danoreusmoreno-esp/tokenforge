// Generates the React package for every catalogue component and type-checks it with tsc (strict).
// Usage: node scripts/check-react.mjs
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { computeSystem, DEFAULT_BRAND } from '../src/engine/tokens.js';
import { COMPONENTS } from '../src/engine/catalog.js';
import { toReactPackage, reactShowcase } from '../src/engine/react.js';
import { EXPORTS } from '../src/engine/exporters.js';

const out = join(tmpdir(), 'tokenforge-react-check');
rmSync(out, { recursive: true, force: true });
const sys = computeSystem({ ...DEFAULT_BRAND, components: COMPONENTS.map((c) => c.id), componentTokens: {} });
const tokensCss = EXPORTS.find((e) => e.id === 'css').fn(sys);
const files = toReactPackage(sys, { componentsCss: readFileSync('src/ds.css', 'utf8'), tokensCss });
for (const f of files) {
  const p = join(out, 'ds', f.file);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, f.text);
}
// A usage file: every export must be importable from the index.
writeFileSync(join(out, 'usage.tsx'), `import * as DS from './ds';\nexport const all = DS;\n`);
writeFileSync(join(out, 'showcase.tsx'), reactShowcase(COMPONENTS.map((c) => c.id)));
writeFileSync(join(out, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    strict: true, noEmit: true, jsx: 'react-jsx', target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'], skipLibCheck: true, noUnusedLocals: true, noUnusedParameters: true,
    typeRoots: [join(process.cwd(), 'node_modules/@types')], types: ['react', 'react-dom'],
    baseUrl: '.', paths: { react: [join(process.cwd(), 'node_modules/@types/react')], 'react/jsx-runtime': [join(process.cwd(), 'node_modules/@types/react/jsx-runtime')] },
  },
  include: ['**/*.ts', '**/*.tsx'],
}, null, 2));
try {
  execFileSync(join(process.cwd(), 'node_modules/.bin/tsc'), ['-p', out], { stdio: 'pipe' });
  console.log(`OK: ${files.length} files, ${files.filter((f) => f.file.startsWith('components/')).length} components type-check (strict).`);
  if (process.argv.includes('--render')) await render();
} catch (e) {
  console.log(String(e.stdout || e.message));
  process.exit(1);
}

/** Bundles the showcase and renders it in Chromium; fails on any runtime error. */
async function render() {
  const { build } = await import('esbuild');
  writeFileSync(join(out, 'main.tsx'), `import { createRoot } from 'react-dom/client';\nimport Showcase from './showcase';\nconst t = new URLSearchParams(location.search).get('theme') as 'light' | 'dark' | null;\ncreateRoot(document.getElementById('root')!).render(<Showcase theme={t ?? 'light'} />);\n`);
  await build({ entryPoints: [join(out, 'main.tsx')], bundle: true, outfile: join(out, 'main.js'), jsx: 'automatic', format: 'iife', logLevel: 'error',
    nodePaths: [join(process.cwd(), 'node_modules')], define: { 'process.env.NODE_ENV': '"development"' } });
  writeFileSync(join(out, 'index.html'), '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="ds/tokens.css"><link rel="stylesheet" href="ds/components.css"><body style="margin:0"><div id="root"></div><script src="main.js"></script>');
  const { createRequire } = await import('node:module');
  const { chromium } = createRequire(import.meta.url)('playwright');
  const b = await chromium.launch();
  const errors = [];
  for (const theme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width: 900, height: 900 } });
    p.on('pageerror', (e) => errors.push(theme + ': ' + e.message));
    p.on('console', (m) => m.type() === 'error' && errors.push(theme + ': ' + m.text()));
    await p.goto('file://' + join(out, 'index.html') + '?theme=' + theme);
    await p.waitForSelector('[data-id="kbd"]');
    const n = await p.$$eval('section[data-id]', (els) => els.length);
    // Interactions: dialog opens and closes with Escape, combobox filters, slider moves, tabs switch.
    await p.click('[data-id="dialog"] button');
    const dialogOpen = await p.isVisible('[role="dialog"][aria-modal="true"]');
    await p.keyboard.press('Escape');
    const dialogClosed = !(await p.isVisible('[data-id="dialog"] [role="dialog"]'));
    await p.fill('[data-id="combobox"] input', 're');
    const opts = await p.$$eval('[data-id="combobox"] [role="option"]', (els) => els.map((e) => e.textContent));
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
    const picked = await p.inputValue('[data-id="combobox"] input');
    await p.click('[data-id="tabs"] [role="tab"]:nth-child(2)');
    const panel = await p.textContent('[data-id="tabs"] [role="tabpanel"]');
    await p.focus('[data-id="slider"] input.b'); await p.keyboard.press('ArrowRight');
    const fill = await p.$eval('[data-id="slider"] .fill', (e) => e.style.width);
    // Phase 2 components.
    await p.click('[data-id="inline-edit"] .ie-view');
    await p.fill('[data-id="inline-edit"] input', '');
    await p.keyboard.press('Enter');
    const inlineError = await p.textContent('[data-id="inline-edit"] .help.err').catch(() => null);
    await p.fill('[data-id="inline-edit"] input', 'Winter launch'); await p.keyboard.press('Enter');
    const inlineSaved = await p.textContent('[data-id="inline-edit"] .ie-view');
    await p.click('[data-id="context-menu"] .ctx-area', { button: 'right' });
    const ctxItems = await p.$$eval('.ctx-menu [role="menuitem"]', (els) => els.length);
    await p.keyboard.press('Escape');
    const ctxClosed = (await p.$$('.ctx-menu')).length === 0;
    await p.click('[data-id="carousel"] button[aria-label="Next slide"]'); await p.waitForTimeout(400);
    const slide = await p.$eval('[data-id="carousel"] [role="tab"][aria-selected="true"]', (e) => e.getAttribute('aria-label'));
    await p.click('[data-id="color-picker"] .cp-swatches button:nth-child(4)');
    const hex = await p.inputValue('[data-id="color-picker"] .cp-row input');
    await p.click('[data-id="time-picker"] button.select');
    await p.click('[data-id="time-picker"] [role="option"]:has-text("11:30")');
    const time = await p.textContent('[data-id="time-picker"] button.select');
    console.log(theme, JSON.stringify({ sections: n, dialogOpen, dialogClosed, opts, picked, panel, fill }));
    console.log(theme, JSON.stringify({ inlineError, inlineSaved, ctxItems, ctxClosed, slide, hex, time }));
    await p.screenshot({ path: join(out, 'showcase-' + theme + '.png'), fullPage: true });
    await p.close();
  }
  await b.close();
  if (errors.length) { console.log('Runtime errors:\n' + errors.join('\n')); process.exit(1); }
  console.log('Rendered without errors. Screenshots in ' + out);
}
