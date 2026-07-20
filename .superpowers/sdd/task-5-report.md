# Task 5 Report: Desktop shell + Window chrome

## Status: COMPLETE

## What I implemented

### `src/assets/wallpaper.svg` (2172 bytes)
Original Big Sur-style artwork, 2560×1600, `preserveAspectRatio` slice. Sky
`<linearGradient>` runs coral `#f0836a`/`#e8654f` → purple `#9d4a86` → indigo
`#4a2e6b`/`#1a2151`. A soft radial "sun glow" sits upper-right. Four layered
"dune" ridge paths use long smooth cubic beziers (no jagged control points),
each with its own top→bottom gradient, getting progressively darker toward the
foreground. No `<script>`; valid standalone SVG.

### `src/lib/os/tree-data.ts`
`getTreeInput(rendered: Record<string,string>): Promise<TreeInput>`. Uses
`getCollection` (all four collections) + `getImage({ src, width, format:'webp' })`
to produce URL strings; widths capped at `Math.min(src.width, 1600)`. Reads
`width`/`height` from each `ImageMetadata`. Projects & writing sorted by
`created` DESCENDING; art/life keep YAML order. Authors `README_HTML` as real
semantic HTML (`<p>`s, real `<a href>` mailto/tel/github/linkedin links, and a
two-column `<dl class="contact">` contact block), created `2026-07-20`. Writing
`bodyText` derived by stripping tags from `bodyHtml`
(`.replace(/<[^>]+>/g,' ')` + whitespace collapse). Dates normalized to
`YYYY-MM-DD` via a small `isoDate` helper (collection `z.coerce.date()` yields
`Date` objects, and `formatDate` in fs.ts expects an ISO string).

### `src/components/os/Window.svelte`
Props `{ win, active, children, onclose, onminimize, onfullscreen, onfocus, onmove }`
(children is a `Snippet`, rendered via `{@render children()}`). Absolutely
positioned at win.x/y/w/h, z-index win.z. 28px title bar: traffic lights left
(12px circles #ff5f57/#febc2e/#28c840, 8px gap, 8px ×/−/⤢ glyphs revealed on
`.lights:hover`), title centered in `--pixel-font` 13px. Pointer-drag on the
title bar via `setPointerCapture`; `onmove(newX, newY)` with `y` clamped ≥ 24;
drag guarded so it does NOT start from a `<button>` (traffic lights). Buttons
`stopPropagation` so a click doesn't also start a drag. Double-click title bar →
`onfullscreen()`. `onpointerdown` on the whole window → `onfocus()`. Fullscreen:
`position:fixed; top:24px; left/right/bottom:0; border-radius:0`. Active window
gets `--shadow-win` + opaque title; inactive gets the lighter
`0 8px 24px rgba(0,0,0,.22)` shadow and title at 55% opacity. Open animation
scale .96→1 + fade 140ms ease-out, gated behind
`@media (prefers-reduced-motion: no-preference)`. Minimized windows render
nothing (`{#if !win.minimized}`).

### `src/components/os/Desktop.svelte`
Props `{ tree, initialPath = null, showResume }` (showResume accepted but unused
until Task 9 — `void showResume` documents the intent). `let wins = $state<Win[]>([])`.
Imports `wallpaper` and sets it as a `background-size: cover` root. Per-app default
sizes exactly per brief (project 980×620, doc 640×560, gallery 840×600, finder
960×560, about 420×260, trash 480×320). Central `openPath(path)`: `findNode` →
if node has `open` → dispatch `open(...)` with per-app size; if folder or `/` →
open/focus single Finder window (app 'finder', title "derek's mac", path '/',
props `{ initialSelection }` set to the folder path when it wasn't root). `$effect`
opens Finder at root on mount then any `initialPath`. Content switch: finder →
`finder placeholder`; everything else → the temporary `<pre>` JSON dump. Active
window computed from highest-z non-minimized window. 24px translucent
`.menubar-placeholder` strip at the top (real MenuBar is Task 6). Root is
`position:fixed; inset:0; overflow:hidden`.

### `src/pages/index.astro`
Frontmatter: `getCollection('projects'/'writing')`, `render(entry)` each,
build `rendered` map from `entry.rendered.html`, then `getTreeInput(rendered)` →
`buildTree(input)`. `showResume = fs.existsSync('public/resume.pdf')`. Mounts
`<Desktop client:only="svelte" tree={tree} showResume={showResume} />`. Keeps
`<title>Derek Yao</title>`, adds the description meta. Global style zeroes body
margin and makes html/body full-viewport with `overflow:hidden`.

## How the rendered-HTML question resolved
Primary approach worked. On Astro 7.1.1, after `await render(entry)` the
markdown entry exposes its rendered body as a string at `entry.rendered.html`
(the glob content loader populates it; confirmed in
`node_modules/astro/dist/content/runtime.js` where `render()` reads
`entry.rendered.html`). No Container API fallback was needed. Verified the HTML
strings land in the client island props in the built page (README contact links
`mailto:yaoderek06@gmail.com` / `tel:+14255223218` and project bodies are all
present in `dist/index.html`).

Note: the repo is actually Astro **7.1.1** (brief said "Astro 5"); the
`entry.rendered.html` contract is identical.

## Verification output
- `npm test` → 4 files, **72 tests passed** (unchanged; this is a view-layer task, no new unit tests).
- `npm run build` → **Complete!**, 1 page built, 42 images optimized (24 art + 18 project images; `life.yaml` is empty `[]` so no life images), wallpaper emitted to `dist/_astro/wallpaper.*.svg`.
- `npm run dev` (background) → served `http://localhost:4321/`; `curl` returned the page with exactly 1 `astro-island`, correct `<title>`, and tree data (orbit/speakeasy) present. No errors/warnings in the dev log.
- `npm run build && npm run preview` (background) → served on `:4322`; `curl` confirmed the island present in the built output too.
- SVG is 2172 bytes (< 15KB), no `<script>`.

## Files changed
- Created: `src/assets/wallpaper.svg`
- Created: `src/lib/os/tree-data.ts`
- Created: `src/components/os/Window.svelte`
- Created: `src/components/os/Desktop.svelte`
- Modified: `src/pages/index.astro`

## Self-review
- Svelte 5 runes throughout: `$props()`, `$state`, `$effect`, `$derived` not
  needed; `onclick=`/`onpointerdown=` (not `on:`); `{@render children()}` snippet slot. ✓
- No `astro:*` imports in the island — all astro:content/astro:assets access is
  confined to `tree-data.ts` and `index.astro`; the island receives plain
  serializable `FSNode` props with URL strings. ✓
- Traffic lights: drag guarded against buttons; buttons `stopPropagation`. ✓
- Clamp `y ≥ 24` on drag. ✓
- Legacy `index.html`/`app.js`/`styles.css` untouched. ✓
- `getImage` called with the imported image object + `format:'webp'` + width cap. ✓

## Concerns / notes for later tasks
- Content bodies (`bodyHtml`) are serialized into the client island props, which
  inflates the HTML payload somewhat. Acceptable for a small site; if it grows,
  consider passing only what each window needs or fetching lazily. Not a blocker.
- `initialSelection` is passed to Finder as a prop now; the Finder (Task 7) will
  consume it. `showResume` is threaded through for Task 9's Dock.
- The menu-bar placeholder is a plain translucent strip; real MenuBar is Task 6.

## Fix round 1

### What changed

**Critical fix — `$effect` → `onMount` in `src/components/os/Desktop.svelte`:**
The mount logic that called `openPath('/')` (and optionally `openPath(initialPath)`)
was inside a `$effect`. Since `openPath` both reads `wins` (to look up existing
windows for deduplication via `open()`) and writes `wins` (assigns the returned
array), the effect registered a dependency on `wins` and immediately mutated it,
causing Svelte 5 to re-run the effect on every cycle until it hit the
`effect_update_depth_exceeded` abort at depth 100. The desktop rendered blank and
the test timed out.

Fix: replaced `$effect(() => { ... })` with `onMount(() => { ... })` (imported
from `'svelte'`). `onMount` runs once after the component is mounted into the DOM
and never re-runs, so it is the correct primitive for one-time initialization.
No other `$effect` blocks in Desktop.svelte read and write `wins`; event-handler
paths (onclick, etc.) are fine.

**Minor fix — `src/assets/wallpaper.svg`:**
Middle gradient stop in the sky `linearGradient` was `#9d4a86` (warm-pink); the
binding palette value is `#7a3f9d` (cooler indigo-purple). Replaced accordingly.
Endpoints `#e8654f` (coral) and `#1a2151` (deep indigo) unchanged.

**Infrastructure — regression net:**
- `npm i -D jsdom @sveltejs/vite-plugin-svelte@7.2.0` added to devDependencies.
- `vitest.config.ts` updated to include `@sveltejs/vite-plugin-svelte` plugin and
  `resolve: { conditions: ['browser'] }` (guarded by `process.env.VITEST`) so
  Svelte components compile correctly under Vitest.
- New test file `src/components/os/desktop.smoke.test.ts` (jsdom environment).
  Two tests: (1) mount with no `initialPath` — expects "derek's mac" in DOM;
  (2) mount with `initialPath: '/README.txt'` — expects 'README.txt' in DOM.
  Minimal browser API stubs: `window.matchMedia`, `window.ResizeObserver`,
  `Element.prototype.setPointerCapture/releasePointerCapture`.

### RED / GREEN evidence

**RED (before fix):** `npm test` with the smoke tests but the original `$effect`:
- Both smoke tests timed out at 5000ms.
- Two unhandled exceptions: `Svelte error: effect_update_depth_exceeded —
  Maximum update depth exceeded.`
- Stack trace pointed directly to `openPath` called from `$effect` in Desktop.svelte.
- 72 existing tests passed, 2 new tests failed.

**GREEN (after fix):** `npm test`:
```
 Test Files  5 passed (5)
      Tests  74 passed (74)
   Duration  846ms
```
All 74 tests pass (72 existing + 2 new smoke tests).

**Build:** `npm run build` — `Complete!`, 1 page built, 42 images optimized,
no errors or warnings.
