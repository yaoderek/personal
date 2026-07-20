# derekOS Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the personal site as "derekOS" — a fake mini macOS with a menu bar, Finder window, draggable app windows, and auto-hiding dock — per `docs/superpowers/specs/2026-07-20-website-redesign-design.md`.

**Architecture:** Astro 5 static site. All content lives in content collections (markdown/YAML); `src/pages/index.astro` builds a file-system tree from the collections and mounts one Svelte 5 island (`Desktop.svelte`) that renders the whole OS shell. Window-manager and dock logic are pure TS modules (unit-tested); Svelte components are thin views over them. Every item has a real URL that deep-links into the desktop with that window open, plus a `<noscript>` static fallback.

**Tech Stack:** Astro ^5, @astrojs/svelte ^7 + Svelte ^5, Vitest ^3, @fontsource-variable/newsreader, astro:assets (sharp) for images.

## Global Constraints

- Static output only (`output: 'static'`); no SSR, no server runtime.
- One Svelte island (`Desktop.svelte`, `client:only="svelte"`); everything else static HTML.
- Chrome typography: system stack `-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif`. Pixel accent font `"ChicagoFLF"` used ONLY on window title bars and desktop/menu-bar name. Long-form body: `"Newsreader Variable", Georgia, serif`.
- Selection/accent color: `#0064e1` (system blue). Chrome grays only; wallpaper carries color.
- All animation gated behind `@media (prefers-reduced-motion: no-preference)` or a JS `reducedMotion` check.
- Every content item has a real route: `/projects/<slug>`, `/writing/<slug>`, `/art`, `/life`. Back/forward must work (History API).
- Root folder names are exactly: `README.txt`, `projects`, `writing`, `art`, `life`.
- Contact info appears ONLY in README.txt content (email yaoderek06@gmail.com, phone 425-522-3218, github.com/yaoderek, linkedin.com/in/yaoderek).
- Node scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm test` (vitest run).
- Commit after every task (steps say when).

## File Structure

```
astro.config.mjs, svelte.config.js, tsconfig.json, vitest.config.ts, package.json
public/fonts/ChicagoFLF.ttf        (freeware pixel font; fallback ok if unobtainable)
public/resume.pdf                  (user-supplied; dock icon hidden if absent)
src/styles/global.css              design tokens + chrome primitives
src/assets/wallpaper.svg           original Big Sur-style wave gradient
src/assets/projects/*, src/assets/art/*   migrated images (git mv from images/)
src/content.config.ts              collections: projects, writing, art, life
src/content/projects/*.md          5 case studies (frontmatter drives Finder metadata)
src/content/writing/*.md           4 posts
src/content/art.yaml, life.yaml    piece lists (file loader)
src/lib/os/types.ts                FSNode, Win, AppId types
src/lib/os/fs.ts                   buildTree(), findNode()      [pure, tested]
src/lib/os/format.ts               formatDate(), wordCount(), firstSentence() [pure, tested]
src/lib/os/windows.ts              window-manager reducers        [pure, tested]
src/lib/os/dock.ts                 magnification falloff math     [pure, tested]
src/components/os/Desktop.svelte   root island: state, routing, layers
src/components/os/MenuBar.svelte   menus + clock
src/components/os/Window.svelte    generic chrome: drag, traffic lights
src/components/os/Dock.svelte      auto-hide + magnification
src/components/os/Finder.svelte    column/list views + path bar
src/components/os/PreviewColumn.svelte
src/components/os/MobileFiles.svelte  small-screen drill-down
src/components/os/apps/ProjectWindow.svelte, DocWindow.svelte,
    GalleryWindow.svelte, AboutWindow.svelte, TrashWindow.svelte
src/pages/index.astro              desktop @ root
src/pages/projects/[slug].astro, writing/[slug].astro,
    projects/index.astro, writing/index.astro, art/index.astro,
    life/index.astro, 404.astro    deep-link pages (same island, initialPath prop)
src/lib/os/tree-data.ts            (astro-side) collections → TreeInput incl. getImage() URLs
.github/workflows/deploy.yml       GitHub Pages deploy
DELETED at the end: index.html, app.js, styles.css, images/
```

---

### Task 1: Scaffold Astro + Svelte + Vitest

**Files:**
- Create: `package.json`, `astro.config.mjs`, `svelte.config.js`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/styles/global.css`, `src/pages/index.astro` (placeholder), `src/env.d.ts`

**Interfaces:**
- Produces: working `npm run dev/build/test`; CSS custom properties consumed by every later component: `--chrome-font`, `--pixel-font`, `--serif-font`, `--accent`, `--win-bg`, `--win-border`, `--hairline`, `--titlebar-h: 28px`, `--menubar-h: 24px`, `--radius-win: 10px`, `--shadow-win`.

- [ ] **Step 1: Write config + package files**

`package.json`:
```json
{
  "name": "derekos",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  }
}
```
Then: `npm i astro @astrojs/svelte svelte @fontsource-variable/newsreader && npm i -D vitest typescript`

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
  integrations: [svelte()],
  output: 'static',
});
```

`svelte.config.js`:
```js
import { vitePreprocess } from '@astrojs/svelte';
export default { preprocess: vitePreprocess() };
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});
```

`.gitignore`: add `node_modules/`, `dist/`, `.astro/`.

- [ ] **Step 2: Global tokens**

`src/styles/global.css` (complete file):
```css
@import '@fontsource-variable/newsreader';

@font-face {
  font-family: 'ChicagoFLF';
  src: url('/fonts/ChicagoFLF.ttf') format('truetype');
  font-display: swap;
}

:root {
  --chrome-font: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --pixel-font: 'ChicagoFLF', var(--chrome-font);
  --serif-font: 'Newsreader Variable', Georgia, serif;
  --accent: #0064e1;
  --win-bg: #f5f5f4;
  --win-border: rgba(0, 0, 0, 0.18);
  --hairline: rgba(0, 0, 0, 0.1);
  --text: #1d1d1f;
  --text-dim: #6e6e73;
  --titlebar-h: 28px;
  --menubar-h: 24px;
  --radius-win: 10px;
  --shadow-win: 0 18px 50px rgba(0, 0, 0, 0.35), 0 0 0 0.5px rgba(0, 0, 0, 0.15);
}

* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; overflow: hidden; font-family: var(--chrome-font); color: var(--text); }
button { font: inherit; background: none; border: none; padding: 0; cursor: pointer; color: inherit; }
```

- [ ] **Step 3: Placeholder page + font**

`src/pages/index.astro`:
```astro
---
import '../styles/global.css';
---
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Derek Yao</title></head>
<body><p>derekOS boot placeholder</p></body></html>
```
Font: locate `ChicagoFLF.ttf` (freeware, Robin Casady) via WebSearch/WebFetch and save to `public/fonts/ChicagoFLF.ttf`. If a trustworthy source isn't found within a few minutes, skip the file — the `--pixel-font` stack already falls back to the system font — and note it in the commit message.

- [ ] **Step 4: Verify**

Run: `npm run build` → succeeds. `npm test` → "no test files found" exit 0 (or passes trivially).

- [ ] **Step 5: Commit** — `git add -A && git commit -m "Scaffold Astro + Svelte + Vitest for derekOS"`

---

### Task 2: Content collections + migration

**Files:**
- Create: `src/content.config.ts`, `src/content/projects/{speakeasy,dubflow,orbit,resumerag,forklift}.md`, `src/content/writing/{rue,first-note,draft-on-something-you-read,short-thought}.md`, `src/content/art.yaml`, `src/content/life.yaml`
- Move: `images/projects/*` → `src/assets/projects/`, `images/art/*` → `src/assets/art/` (`git mv`)

**Interfaces:**
- Produces: collections `projects` (frontmatter: `title, oneLiner, kind, status, created (date), stack (string[]), thumb (image), images (image[]), repo?, demo?`), `writing` (`title, created`), `art`/`life` entries (`id, title, created, medium, image`). Later tasks call `getCollection('projects')` etc.

- [ ] **Step 1: Schema**

`src/content.config.ts` (complete):
```ts
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      oneLiner: z.string(),
      kind: z.string(),
      status: z.string(),
      created: z.coerce.date(),
      stack: z.array(z.string()),
      thumb: image(),
      images: z.array(image()),
      repo: z.string().url().optional(),
      demo: z.string().url().optional(),
    }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({ title: z.string(), created: z.coerce.date() }),
});

const pieces = (name: string) =>
  defineCollection({
    loader: file(`./src/content/${name}.yaml`),
    schema: ({ image }) =>
      z.object({
        id: z.string(),
        title: z.string(),
        created: z.coerce.date(),
        medium: z.string(),
        image: image(),
      }),
  });

export const collections = { projects, writing, art: pieces('art'), life: pieces('life') };
```

- [ ] **Step 2: Port projects.** For each entry in the `PROJECTS` array in `app.js`, create `src/content/projects/<id>.md` (lowercase slug; `resumeRAG` → `resumerag.md`): frontmatter from the table below, body = the existing `description` verbatim (blank-line paragraphs and `## ` headings are already markdown).

| slug | oneLiner | kind | status | created (approx — user to correct) | stack |
|---|---|---|---|---|---|
| speakeasy | attention is all you need | Web app | hackathon | 2026-04-01 | FastAPI, React, OpenFace, Fish Audio, Claude |
| dubflow | a context-aware desktop focus companion | Desktop app | hackathon | 2026-01-15 | SvelteKit, Electron, OpenCV, AWS Rekognition, Bedrock, ElevenLabs |
| orbit | ai-powered hyperlocal networking | Mobile app | prototype | 2025-10-01 | Real-time location, semantic search |
| resumerag | graphRAG visualizations for recruiter workflows | Web app | hackathon | 2025-05-01 | Python, GraphRAG, FastAPI, React |
| forklift | your ai-powered shortcut to open source | Web app | prototype | 2025-02-01 | LLM pipeline |

`thumb`/`images` reference the moved assets with relative paths, e.g. for speakeasy:
```yaml
thumb: ../../assets/projects/speakeasy-1.jpg
images:
  - ../../assets/projects/speakeasy-1.jpg
  - ../../assets/projects/speakeasy-2.jpg
  - ../../assets/projects/speakeasy-3.png
```

- [ ] **Step 3: Port writing.** One `.md` per `WRITINGS` entry: frontmatter `title`, `created` (= `date`); body = `body` verbatim.

- [ ] **Step 4: Art + life YAML.** `src/content/art.yaml`: 24 entries — `id: art-NN`, `title: Untitled NN`, `created: 2025-01-01` (user to backfill), `medium: digital`, `image: ../assets/art/<filename>.png` (match exact existing filenames: `art-1.png`, `art-2.png`, `art-3.png`, then `art-04.png`…`art-24.png`). `src/content/life.yaml`: `[]` (empty list — folder renders an empty state until photos are added).

- [ ] **Step 5: Verify** — `npm run build` passes (schema validates all entries, images resolve).

- [ ] **Step 6: Commit** — `git add -A && git commit -m "Migrate content into Astro collections"`

---

### Task 3: Pure logic — fs tree, format, dock math

**Files:**
- Create: `src/lib/os/types.ts`, `src/lib/os/fs.ts`, `src/lib/os/format.ts`, `src/lib/os/dock.ts`
- Test: `src/lib/os/fs.test.ts`, `src/lib/os/format.test.ts`, `src/lib/os/dock.test.ts`

**Interfaces:**
- Produces:
```ts
// types.ts
export type AppId = 'finder' | 'project' | 'doc' | 'gallery' | 'about' | 'trash';
export type FSNode = {
  name: string; path: string; kind: string; icon: string;
  created?: string;                       // ISO date
  meta?: [string, string][];              // ordered label/value pairs for preview column
  previewImage?: string; blurb?: string;
  open?: { app: AppId; props: Record<string, unknown> };
  children?: FSNode[];
};
export type TreeInput = {
  readme: { text: string; created: string };
  projects: { slug: string; title: string; oneLiner: string; kind: string; status: string;
    created: string; stack: string[]; thumbUrl: string; imageUrls: string[];
    bodyHtml: string; repo?: string; demo?: string }[];
  writing: { slug: string; title: string; created: string; bodyHtml: string; bodyText: string }[];
  art: { id: string; title: string; created: string; medium: string; imageUrl: string;
    width: number; height: number }[];
  life: TreeInput['art'];
};
// fs.ts
export function buildTree(input: TreeInput): FSNode;      // root node, path '/'
export function findNode(root: FSNode, path: string): FSNode | null;
// format.ts
export function formatDate(iso: string): string;          // "Mar 1, 2026"
export function wordCount(text: string): number;
export function firstSentence(text: string): string;      // ≤140 chars, ellipsis if cut
// dock.ts
export function magnify(distPx: number, opts?: { max?: number; radius?: number }): number;
```

- [ ] **Step 1: Write failing tests** — `fs.test.ts` asserts: root children names exactly `['README.txt','projects','writing','art','life']`; `findNode(root,'/projects/speakeasy')!.kind === 'Application'`; project node `meta` includes `['Stack','FastAPI, React']`-style pair and `open.app === 'project'`; writing node kind `'Plain Text'`, `meta` includes word count; art node kind `'PNG image'` with `meta` dimensions `'1200 × 800'`; `findNode(root,'/nope') === null`. `format.test.ts`: `formatDate('2026-03-01') === 'Mar 1, 2026'`; `wordCount('a b  c\n d') === 4`; `firstSentence('One. Two.') === 'One.'`. `dock.test.ts`: `magnify(0) === 1.5`; `magnify(96) === 1`; `magnify(200) === 1`; monotonic decreasing on [0,96]. Use a small hand-built `TreeInput` fixture in the test file (1 project, 1 writing, 1 art piece).

- [ ] **Step 2: Run** `npm test` → FAIL (modules missing).

- [ ] **Step 3: Implement.** Notes: `buildTree` maps projects → `name: slug + '.app'`, `kind: input kind`, art/life → `name: id + '.png'`. Project meta order: Kind, Created (formatted), Stack (joined), Status; writing meta: Kind, Created, Words; art meta: Kind, Created, Dimensions, Medium. README node: `name 'README.txt'`, kind `'Plain Text'`, `open: { app: 'doc', props: { title: 'README.txt', html } }`. `magnify`: `d >= radius ? 1 : 1 + (max - 1) * Math.cos((Math.PI * d) / (2 * radius))` with defaults `max 1.5, radius 96`. `formatDate` via `Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })` on `new Date(y, m-1, d)` parsed from the ISO string (avoid TZ shift).

- [ ] **Step 4: Run** `npm test` → PASS.

- [ ] **Step 5: Commit** — `git commit -m "Add fs tree, format, and dock math with tests"`

---

### Task 4: Window-manager reducers

**Files:**
- Create: `src/lib/os/windows.ts`  Test: `src/lib/os/windows.test.ts`

**Interfaces:**
- Produces (all pure; return new arrays, never mutate):
```ts
export type Win = {
  id: number; app: AppId; title: string; path?: string;
  props: Record<string, unknown>;
  x: number; y: number; w: number; h: number; z: number;
  minimized: boolean; fullscreen: boolean;
};
export type OpenSpec = { app: AppId; title: string; path?: string;
  props?: Record<string, unknown>; w?: number; h?: number };
export function open(state: Win[], spec: OpenSpec, viewport: { vw: number; vh: number }): Win[];
export function close(state: Win[], id: number): Win[];
export function focus(state: Win[], id: number): Win[];
export function minimize(state: Win[], id: number): Win[];
export function restore(state: Win[], id: number): Win[];   // unminimize + focus
export function toggleFullscreen(state: Win[], id: number): Win[];
export function move(state: Win[], id: number, x: number, y: number): Win[];
export function topWindow(state: Win[]): Win | null;         // highest z, not minimized
```

- [ ] **Step 1: Failing tests** covering: `open` assigns unique incrementing ids and z = max+1; default size 720×480, cascade position offsets +32px per already-open window, clamped inside viewport; opening a spec whose `path` matches an existing window focuses it instead of duplicating; `focus` raises z above all; `close` removes; `minimize` sets flag and `topWindow` skips it; `restore` clears flag and focuses; `toggleFullscreen` flips flag; `move` updates x/y only.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implement (module-level `let nextId = 1` is fine). **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "Add window manager reducers with tests"`

---

### Task 5: Desktop shell + Window chrome

**Files:**
- Create: `src/components/os/Desktop.svelte`, `src/components/os/Window.svelte`, `src/assets/wallpaper.svg`, `src/lib/os/tree-data.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `windows.ts` reducers, `buildTree`.
- Produces: `Desktop.svelte` props `{ tree: FSNode; initialPath?: string; showResume: boolean }`. `Window.svelte` props `{ win: Win; active: boolean; onclose, onminimize, onfullscreen, onfocus, onmove }` with a default slot for content. `tree-data.ts` exports `export async function getTreeInput(): Promise<TreeInput>` (runs in Astro frontmatter: `getCollection` + `render()` for HTML bodies + `getImage()` for optimized URLs + image dimensions from metadata).

- [ ] **Step 1: `tree-data.ts`.** Markdown bodies must be rendered where `astro:content`'s `render()` is available (a page/frontmatter context), so the page renders each md entry and passes the html in: signature `getTreeInput(rendered: Record<string, string>): Promise<TreeInput>` where keys are `"projects/<slug>"` / `"writing/<slug>"`. Inside `getTreeInput`: `getCollection` for all four collections, `getImage()` (`import { getImage } from 'astro:assets'`) for every thumb/image producing URL strings, and `width/height` read from the image metadata. README text/html is authored here as a constant (contact lines per Global Constraints).
- [ ] **Step 2: `wallpaper.svg`.** Original Big Sur-style artwork: 2560×1600 SVG, 3 overlapping smooth bezier "dune" paths, layered gradients from `#e8654f` → `#7a3f9d` → `#1a2151` (warm sunset ridge over deep indigo). Hand-write the SVG (4 `<path>` elements + `<linearGradient>` defs). Set as `background: url(...) center / cover fixed` on the desktop root.
- [ ] **Step 3: `Window.svelte`.** Chrome: title bar (`height: var(--titlebar-h)`, pixel font title centered, traffic lights left — red/yellow/green 12px circles with hover glyphs ×/−/⤢), body slot below. Drag: `onpointerdown` on title bar → `setPointerCapture`, track deltas, call `onmove(x, y)`; clamp y ≥ `var(--menubar-h)`. Double-click title bar = fullscreen toggle. `active` window gets full shadow + opaque title; inactive dimmed. Fullscreen: `position: fixed; inset: 24px 0 0 0; border-radius: 0`. Transitions (open scale-in 140ms ease-out, minimize 180ms scale+translate toward dock) behind reduced-motion check.
- [ ] **Step 4: `Desktop.svelte`.** Holds `let wins = $state<Win[]>([])` and dispatches through reducers (`wins = open(wins, spec, vp)`). Renders: wallpaper root div, `{#each wins as win (win.id)}` → `<Window>` with content switch on `win.app` (placeholder `<pre>` bodies for now; real apps arrive Tasks 7–8). `openPath(path)` helper: `findNode` → if folder/file with `open` spec, open the mapped window. On mount: open Finder window (960×560) at root — Finder itself is Task 7; render "finder placeholder" slot meanwhile. Fullscreen desktop is `position: fixed; inset: 0`.
- [ ] **Step 5: Wire `index.astro`.** Frontmatter: `getCollection` + `render()` each md entry, build `rendered` map, `const input = await getTreeInput(rendered)`, `const tree = buildTree(input)`, `const showResume = fs.existsSync('public/resume.pdf')` (`import fs from 'node:fs'`). Body: `<Desktop client:only="svelte" {tree} {showResume} />`. Verify: `npm run dev`, open browser — wallpaper + a draggable placeholder window with working traffic lights.
- [ ] **Step 6: Commit** — `git commit -m "Add desktop shell and window chrome"`

---

### Task 6: Menu bar

**Files:**
- Create: `src/components/os/MenuBar.svelte`, `src/components/os/apps/AboutWindow.svelte`
- Modify: `Desktop.svelte`

**Interfaces:**
- Consumes: `openPath()`, `openWindow(spec)` callbacks passed as props.
- Produces: `MenuBar.svelte` props `{ onopenpath, onopenabout, ontogglelist, reducedMotion, ontogglereducedmotion }`.

- [ ] **Step 1:** Bar: fixed top, `height: var(--menubar-h)`, translucent light (`rgba(250,250,250,.72)` + `backdrop-filter: blur(20px)`), hairline bottom border. Left:  glyph (About this site → AboutWindow: short colophon naming Astro/Svelte and linking the repo), **Derek Yao** in pixel font (click → `onopenpath('/README.txt')`), `File` (GitHub, LinkedIn — real `<a>`s), `View` (toggle Finder list/column, toggle reduce motion). Right: clock `Ddd MMM D  H:MM AM` updated every 30s. Menus: click opens dropdown (`role="menu"`, items `role="menuitem"`), click-outside and Esc close, hover moves between open menus like macOS.
- [ ] **Step 2:** Verify in dev: menus open/close correctly, About window opens, clock ticks. **Step 3: Commit** — `git commit -m "Add menu bar with dropdowns, clock, About window"`

---

### Task 7: Finder

**Files:**
- Create: `src/components/os/Finder.svelte`, `src/components/os/PreviewColumn.svelte`
- Modify: `Desktop.svelte` (mount Finder as the `finder` app window content; on mount select `/README.txt`)

**Interfaces:**
- Consumes: `tree: FSNode`, `openPath`.
- Produces: `Finder.svelte` props `{ tree, initialSelection?: string, view: 'columns'|'list', onopen(path) }`.

- [ ] **Step 1: Column view.** Selection is a path array. Render one scrollable column per depth level (folders only), 200px wide, hairline-divided; rows: 16px icon + name, truncate middle; selected row = accent background, white text; single-click selects (updates columns to the right), double-click on openable file → `onopen(path)`; folders auto-descend on single click. Rightmost: `PreviewColumn` for the selected file — large icon or `previewImage` thumbnail, name, then `meta` pairs as a two-column grid (`--text-dim` labels), then `blurb` in serif. Icons: inline SVG set — folder (Big Sur blue folder silhouette), text doc (white page, folded corner), app (rounded-rect w/ project thumb), image (thumbnail itself, 4px radius).
- [ ] **Step 2: Path bar.** Bottom of window, 24px: `derek's mac ▸ projects ▸ speakeasy.app` — each segment a button navigating the selection to that level.
- [ ] **Step 3: List view.** Table: Name / Date Created / Kind, sortable by header click (asc/desc arrow), rows double-click to open, current folder = last folder in selection.
- [ ] **Step 4: Keyboard.** Arrow ↑/↓ move within column, ←/→ change depth, Enter opens — on the focused Finder window only.
- [ ] **Step 5:** Verify in dev: land on root with README.txt selected and preview showing name/two-liner; click into projects; double-click opens (placeholder) windows. **Step 6: Commit** — `git commit -m "Add Finder with column, list, preview, and path bar"`

---

### Task 8: App windows

**Files:**
- Create: `src/components/os/apps/ProjectWindow.svelte`, `DocWindow.svelte`, `GalleryWindow.svelte`, `TrashWindow.svelte`
- Modify: `Desktop.svelte` (replace placeholder switch bodies)

**Interfaces:**
- Consumes window `props` set by `fs.ts` `open.props`:
  - project: `{ title, oneLiner, stack, status, created, imageUrls, bodyHtml, repo?, demo? }`
  - doc: `{ title, html, created? }` (writing posts and README)
  - gallery: `{ items: {title, imageUrl, created, medium, width, height}[], index: number }`
  - trash: none.

- [ ] **Step 1: ProjectWindow** (default 980×620). Header strip: 40px app icon (thumb in rounded-rect), title (pixel font), oneLiner in `--text-dim`; right-aligned: repo/demo links as small buttons when present. Body: two panes — left 60% media area (current image large, ‹ › arrows, dot indicators, `object-fit: contain` on dark ground); right 40% scrollable sidebar: `Stack · Status · Created` as a compact metadata block on top, then the case study `bodyHtml` in serif (`max-width: 62ch`, `h2` small-caps sans headings).
- [ ] **Step 2: DocWindow** (default 640×560). TextEdit register: white page, thin ruler-like top border, title + formatted date, body `{@html html}` in serif 17px/1.65, `max-width: 65ch`, generous padding. README uses this too (its html includes the contact lines).
- [ ] **Step 3: GalleryWindow** (default 840×600). Preview.app register: near-black ground, image centered `object-fit: contain`, top toolbar: title + `formatDate(created)` + medium, ‹ › arrows + `n of N` counter cycling `items` without closing; arrows also on ← → keys.
- [ ] **Step 4: TrashWindow.** Static list of two joke files (e.g. `tabs-based-navigation.fig`, `old-portfolio-v1.html`) with "Empty Trash" button that just shakes the window (reduced-motion: does nothing).
- [ ] **Step 5:** Verify all four in dev via Finder double-clicks (art gallery opens at the clicked piece's index). **Step 6: Commit** — `git commit -m "Add project, document, gallery, and trash windows"`

---

### Task 9: Dock

**Files:**
- Create: `src/components/os/Dock.svelte`  Modify: `Desktop.svelte`

**Interfaces:**
- Consumes: `magnify()` from dock.ts, `openPath`, `wins` (for minimized windows), `restore`, `showResume`.
- Produces: `Dock.svelte` props `{ items, minimized: Win[], onrestore(id) }`.

- [ ] **Step 1: Behavior.** Fixed bottom, translucent rounded shelf (`backdrop-filter: blur(24px)`). Auto-hide: hidden (`translateY(100%)`) until pointer enters a 4px bottom hot-zone → slides up 240ms cubic-bezier(0.2, 0.8, 0.2, 1); hides 400ms after pointer leaves the dock area. On touch devices (`(hover: none)`): always visible, no magnification. Magnification: on `pointermove`, per-icon `scale = magnify(|iconCenterX - pointerX|)`, icons scale from bottom (`transform-origin: bottom`) with width easing so neighbors displace like macOS.
- [ ] **Step 2: Items.** Finder (focus or reopen Finder at root), TextEdit (→ `/writing`), Photos (→ `/art`), Résumé (opens `/resume.pdf` new tab; render only if `showResume`), Mail (`mailto:yaoderek06@gmail.com`), GitHub (external). Divider, then minimized windows as thumbnails (title tooltip, click → `onrestore`). Trash at far right (opens TrashWindow). Icons: inline SVGs in flat Big Sur style (rounded-square, single simple glyph each); tooltips = macOS-style label above icon on hover.
- [ ] **Step 3:** Verify in dev: hide/show timing, magnification falloff, minimize round-trips through dock. **Step 4: Commit** — `git commit -m "Add dock with auto-hide and magnification"`

---

### Task 10: Routing, deep links, SEO

**Files:**
- Create: `src/lib/os/router.ts`, `src/pages/projects/[slug].astro`, `src/pages/projects/index.astro`, `src/pages/writing/[slug].astro`, `src/pages/writing/index.astro`, `src/pages/art/index.astro`, `src/pages/life/index.astro`, `src/pages/404.astro`, `src/layouts/OsPage.astro`
- Modify: `Desktop.svelte`, `index.astro`

**Interfaces:**
- Produces: `router.ts`: `pathForWin(win: Win): string | null`, `syncUrl(win: Win | null)` (pushState if changed), `installPopstate(openPath, closeToRoot)`. `OsPage.astro` props `{ initialPath, title, description, ogImage? }` — renders full `<Desktop>` island + `<noscript>` slot.

- [ ] **Step 1: URL sync.** In Desktop: `$effect` on `topWindow(wins)` → `syncUrl` (`/` when only Finder-at-root). `popstate` → `openPath(location.pathname)`. Legacy hash shim on mount: `#projects/x` → `history.replaceState` to `/projects/x` (lowercased) then `openPath`.
- [ ] **Step 2: Deep-link pages.** `OsPage.astro` builds the same tree (share the frontmatter logic from index.astro by moving it into `tree-data.ts` as `getDesktopProps(Astro)`) and passes `initialPath`; Desktop on mount opens Finder AND `openPath(initialPath)`. Each `[slug].astro` uses `getStaticPaths` from its collection; `<noscript>` contains the real content (title, date, full body/images) as semantic HTML. Section indexes (`/projects`, `/writing`, `/art`, `/life`) deep-link Finder to that folder, noscript = list of links. `404.astro`: desktop with a doc window "file not found".
- [ ] **Step 3: Meta.** Per-page `<title>` (`speakeasy — Derek Yao`), description = oneLiner/firstSentence, OG image = project thumb where available.
- [ ] **Step 4:** Verify: `npm run build && npm run preview`; `curl -s localhost:4321/projects/speakeasy | grep -i speakeasy` hits title + noscript content; browser: deep URL opens window, back button returns to `/`. **Step 5: Commit** — `git commit -m "Add real URLs, deep links, and SEO fallbacks"`

---

### Task 11: Mobile adaptation

**Files:**
- Create: `src/components/os/MobileFiles.svelte`  Modify: `Desktop.svelte`, `MenuBar.svelte`, `Dock.svelte`

- [ ] **Step 1:** Breakpoint `max-width: 768px` (JS `matchMedia`, reactive). Desktop swaps Finder+windows for `MobileFiles`: iOS Files register — full-width drill-down list (folder rows with chevrons, push/pop slide animation), tapping a file opens its app window **fullscreen** (no drag, no traffic lights; top bar with ‹ Back and title). Menu bar collapses to: Derek Yao (→ README) + clock. Dock: fixed visible, 5 items (Finder/TextEdit/Photos/Mail/GitHub), no magnification.
- [ ] **Step 2:** URL sync still works (same `openPath`). Verify in dev with responsive mode: drill-down, open project, back, dock nav. **Step 3: Commit** — `git commit -m "Add mobile Files-style adaptation"`

---

### Task 12: Accessibility & reduced motion

**Files:**
- Modify: `Window.svelte`, `Finder.svelte`, `Desktop.svelte`, `MenuBar.svelte`, `global.css`

- [ ] **Step 1:** Windows: `role="dialog"`, `aria-label={title}`, focus moves into window on open, Esc closes the focused window, focus returns to Finder. Traffic lights get `aria-label`s. Menu bar: full arrow-key menu navigation. Finder rows: `role="option"`/`aria-selected`, visible focus ring (accent outline).
- [ ] **Step 2:** Reduced motion: honor `prefers-reduced-motion` everywhere (CSS media + JS flag threaded from Desktop); View-menu toggle overrides. Verify with macOS Reduce Motion on: zero animation, dock appears/disappears instantly.
- [ ] **Step 3:** Keyboard-only walkthrough: tab to Finder, arrows to a project, Enter opens, Esc closes. Fix anything unreachable. **Step 4: Commit** — `git commit -m "Add keyboard navigation, dialog semantics, reduced motion"`

---

### Task 13: Cleanup, deploy, final verification

**Files:**
- Delete: `index.html`, `app.js`, `styles.css`, any leftover `images/` files
- Create: `.github/workflows/deploy.yml`, `README.md` (repo readme: what this is, how to run)

- [ ] **Step 1:** Confirm nothing imports from the old files (`grep -r "app.js\|styles.css" src/`), then `git rm index.html app.js styles.css && git rm -r images` (all images must already be migrated in Task 2 — verify `git status` shows no orphan references and `npm run build` passes).
- [ ] **Step 2: Deploy workflow** (`withastro/action` → GitHub Pages):
```yaml
name: Deploy
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps: [{ uses: actions/checkout@v4 }, { uses: withastro/action@v3 }]
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
    steps: [{ id: deployment, uses: actions/deploy-pages@v4 }]
```
(If the domain isn't served by GitHub Pages, leave the workflow — it's inert — and flag hosting to the user.)
- [ ] **Step 3: Full verification.** `npm test` (all green), `npm run build` (no warnings that matter), `npm run preview` + spot-check `/`, `/projects/speakeasy`, `/writing/rue`, `/art` with curl; then visual verification of the running site (desktop loads with README preview visible; drag, minimize, fullscreen, dock, menus, art gallery, mobile layout via responsive mode). Fix what fails.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "Remove legacy site, add deploy workflow"`

---

## Verification checklist (maps to spec)

- Landing = desktop + Finder open, README.txt pre-selected, preview visible (spec §3).
- Menu bar: , Derek Yao, File, View, clock; no Contact menu (spec §4).
- Dock: auto-hide, magnification, Finder/TextEdit/Photos/Résumé/Mail/GitHub/Trash (spec §4 as amended).
- Single click → preview column w/ metadata; double click → app window; path bar; list view (spec §5).
- Project/doc/gallery windows per type; README holds contact (spec §6).
- Pixel font only on title bars + name; serif long-form (spec §7).
- Mobile drill-down (spec §8). Real URLs + noscript (spec §9). Old content fully migrated (spec §10).
