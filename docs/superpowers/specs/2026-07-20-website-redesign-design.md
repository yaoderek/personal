# derekOS — Personal Website Redesign

**Date:** 2026-07-20
**Status:** Draft for review

## 1. Concept

The website is a fake mini macOS — "Derek's Mac." Visitors land on a desktop:
a menu bar on top, a wallpaper, and a Finder window already open in the
center of the screen. All content — projects, writing, art, life photos — lives
in a file system browsed through that Finder. There are no tabs and no nav
bar; the folder tree *is* the information architecture, and everyone already
knows how to use it.

The aesthetic is a blend of clean flat Finder (~El Capitan/Big Sur era) with
classic Mac accents (Chicago-style pixel type in select places). The metaphor
is played straight and quiet: faithful Finder behavior, real metadata, real
window management — never costume.

## 2. Goals & audience

- **Primary (70%):** projects and writing. A recruiter/engineer with 90
  seconds must immediately understand who Derek is and what he's built —
  value and technical depth — without learning a UI.
- **Secondary (30%):** personality — art, life photos, voice. Rewarding for
  anyone who stays and wanders.
- Feel: elegant, professional, quietly conceptual, literary at its core.
  "Clean like the Notes app — a concept that just works."
- Fast: static-first, no heavy runtime. The current site's 7.2 MB of
  unoptimized PNGs gets fixed as part of this.

## 3. Information architecture

```
derek's mac /
├── README.txt        ← title card: name, two-liner, contact, GitHub/LinkedIn
├── projects/         ← the flagship section
│   ├── speakeasy.app
│   ├── dubflow.app
│   ├── orbit.app
│   ├── resumerag.app
│   └── forklift.app
├── writing/          ← posts as documents: rue.txt, first-note.txt, …
├── art/              ← pieces as images: 24 files (subfolders per collection later)
└── life/             ← personal photographs
```

- No `contact` item anywhere else — contact info lives in `README.txt`.
- Every location and item has a real, shareable URL: `/projects/speakeasy`,
  `/writing/rue`, `/art`, etc. Deep links open the desktop with that window
  already open. Back/forward buttons behave like a normal website.

### Default state (the 90-second path)

On load: desktop appears instantly (no boot screen), Finder window open at
root in column view, `README.txt` pre-selected so its preview — name,
two-liner, links — is already showing in the rightmost column. Who Derek is
requires zero clicks; `projects/` is one click away.

## 4. The desktop shell

### Menu bar

Period-faithful macOS menu bar, personalized:

- ** glyph** (or personal monogram) → "About this site" (a small window:
  colophon, what the site is built with).
- **Derek Yao** (bold, app-name position) → opens README.txt.
- **File** → links to GitHub/LinkedIn.
- **View** → toggle Finder list/column view; toggle reduced motion.
- **Right side:** live clock. Menus are real dropdowns with correct hover/
  click behavior.

### Wallpaper

An original Big Sur-style abstract wave gradient (Apple's actual wallpapers
are copyrighted — we recreate the vibe, not the file). Warm, not loud;
content chrome stays gray/neutral so the wallpaper carries the color.

### Dock

- Auto-hides; slides up when the cursor reaches the bottom edge, with
  Apple-matching timing and easing. Magnification on hover with the classic
  neighbor-falloff curve.
- Contents (each a real function, no filler): **Finder** (focuses/reopens the
  Finder window), **TextEdit** (opens `writing/`), **Photos** (opens `art/`),
  **Résumé** (opens the résumé PDF), **Mail** (mailto: link), **GitHub**
  (external), **Trash** (easter egg — a couple of joke files). Minimized
  windows dock to the right of the divider.
- On touch devices the dock is always visible (no hover on touch).

### Window manager

- Multiple windows open simultaneously; drag by title bar; click to focus
  (z-order); traffic lights: close, minimize (animates into the dock —
  simplified scale/slide, not a full genie), and green = fullscreen
  (window expands to fill the viewport under the menu bar).
- Windows open with a subtle scale-in, positioned cascaded from the Finder.
- All motion respects `prefers-reduced-motion` (instant state changes, no
  animation).

## 5. The Finder window

- **Column view** (default): root columns → folder contents → preview column.
- **Single click** on any file: preview column shows thumbnail + metadata,
  Finder-faithful:
  - Projects: Kind (`Electron app`, `Web app`…), Created, Stack, Status
    (`shipped` / `open source` / `research`), one-line value statement.
  - Writing: Kind (`Plain text`), Created, word count, first sentence.
  - Art/Life: Kind (`PNG image`), Created, dimensions, medium/caption.
- **Double click** (single tap on mobile): opens the item in its app window
  (§6).
- **Path bar** at the bottom of the window: `derek's mac ▸ projects ▸
  speakeasy.app` — each segment clickable to navigate up.
- **List view** available via the View menu (columns: Name, Date Created,
  Kind), sortable by clicking headers.
- Fullscreenable, closable (close = desktop with nothing open; Finder
  reopens from the dock).

## 6. App windows (per content type)

All are draggable, focusable, closable, fullscreenable windows layered over
the Finder.

- **Projects — "app windows."** The flagship experience. Layout: a large
  media area (actual screenshots/photos, swipeable carousel) with a
  **write-up sidebar** alongside — the case study: what it is, why I built
  it, how it works, reflections. Header shows the app icon + name + one-line
  value statement. The technical-impressiveness signals (stack, links to
  repo/demo) sit at the top of the sidebar, not buried.
- **Writing — document windows.** TextEdit/Pages-like: a clean white page,
  title, date, then beautifully typeset long-form text. Reading is the whole
  point of these windows; generous measure (~65ch), serif body.
- **Art — Preview-style windows.** Image-forward: the piece at large size on
  a neutral ground, thin toolbar with title + created date, arrows to move
  through the folder without closing the window.
- **Life —** same Preview treatment as art, with casual captions.
- **README.txt —** a TextEdit window: name, two-liner, contact (email),
  GitHub/LinkedIn, and one warm human line. Short enough to read in ten
  seconds.

## 7. Visual language

- **UI chrome type:** system stack (`-apple-system, "Helvetica Neue", …`) —
  the flat, clean Finder register.
- **Classic accent:** a Chicago-style pixel webfont used *only* for window
  title bars and desktop icon labels. Nowhere near body text.
- **Long-form body:** a quality serif (e.g. Newsreader or Source Serif) for
  writing posts and project write-ups — the literary core.
- **Color:** neutral grays for all chrome; wallpaper provides the color;
  one restrained accent (selection blue) used system-wide.
- **Texture:** subtle window shadows, 1px hairline dividers, period-correct
  traffic lights. No glassmorphism, no gradients on chrome.

## 8. Mobile adaptation

Faithful window management doesn't work on a phone, so small screens get the
iOS register of the same idea:

- Finder becomes a **Files-app-style drill-down list** (full-width, push
  navigation, back button top-left).
- Opening an item pushes a **fullscreen view** (no draggable windows).
- Menu bar collapses to: name (→ README) + clock. Dock is fixed and visible
  with the same shortcuts.
- Same URLs, same content, same metadata.

## 9. Technical architecture

- **Framework:** Astro (static output). Content as **content collections**:
  `projects/`, `writing/`, `art/`, `life/` — each item a Markdown/MDX file
  (or image + YAML sidecar for art/life) whose frontmatter (`created`,
  `kind`, `stack`, `status`, `oneLiner`, …) drives the Finder metadata.
  Writing a post = adding a `.md` file.
- **The OS shell** (desktop, window manager, Finder, dock, menu bar) is one
  Svelte 5 island. Window/route state syncs with the URL via the History
  API. Everything else is static HTML.
- **SEO / no-JS:** every item also renders as a plain static page (the
  content inside its window, standalone). Crawlers and no-JS visitors get
  real readable pages; with JS, the shell hydrates and presents the same
  content as windows. Titles/meta/OG images per item.
- **Images:** `astro:assets` — responsive sizes, WebP/AVIF, lazy loading.
  Kills the current 7.2 MB payload.
- **Accessibility:** windows are focus-trapped dialogs with correct ARIA;
  full keyboard support (arrow keys navigate Finder columns, Enter opens,
  Esc closes); `prefers-reduced-motion` honored globally.
- **Hosting:** static output — GitHub Pages/Netlify/Vercel all fine; keep
  whatever currently serves the domain.

## 10. Content migration

- Port 5 projects (speakeasy, dubflow, orbit, resumerag, forklift) from
  `app.js` arrays into content collections; write/adapt one-line value
  statements and sidebar case studies from existing copy.
- Port 4 writing posts to `.md`.
- Port 24 art images (+ metadata: title, created, medium) and optimize.
- `life/` starts small — a handful of photos with captions.
- Old hash URLs (`#projects/speakeasy`) get a tiny redirect shim to the new
  routes.

## 11. Out of scope (YAGNI)

- No boot screen, no login screen, no startup chime.
- No terminal app, games, or other fake apps beyond the dock list above.
- No CMS, comments, analytics dashboards, or dark/light theme toggle (one
  designed look).
- No genie-effect minimize (simplified animation instead).
- Trash easter egg is one static window — nothing interactive inside.

## 12. Risks & mitigations

- **Gimmick risk:** the metaphor must never block content. Mitigation: the
  default state already shows the README preview; every URL deep-links; the
  no-JS fallback is plain readable pages.
- **Scope risk:** the window manager is the big build. Mitigation: build
  order is shell-first with a single window type, then Finder, then app
  window variants; mobile is a separate simpler layout, not a cramped port.
- **Font/wallpaper licensing:** use an open Chicago-style face (e.g.
  ChiKareGo2 or similar with a permissive license) and an original
  wallpaper artwork.
