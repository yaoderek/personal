# derekOS

A personal site styled as a fake mini-macOS desktop environment. Built with Astro 5 + Svelte 5.

The "desktop" runs entirely in a single Svelte island (`client:only`). Every URL is a real route with a noscript fallback so content is crawlable without JS.

## Stack

- **Astro 5** (static output) — routing, content collections, SSG
- **Svelte 5** (runes) — interactive desktop shell
- **Vitest** — unit tests for pure logic (fs tree, window manager, dock)

## Commands

```bash
npm run dev       # start dev server (localhost:4321)
npm run build     # build to dist/
npm run preview   # preview the dist/ build locally
npm test          # run unit tests
```

## Content editing

| What | Where |
|------|-------|
| Writing posts | Drop a `.md` file in `src/content/writing/` (frontmatter: `title`, `date`, `description`) |
| Projects | Drop a `.md` file in `src/content/projects/` (frontmatter: `title`, `description`, `thumb`, `year`) |
| Art entries | Edit `src/content/art.yaml` |
| Resume | Drop `public/resume.pdf` to enable the Résumé dock icon |

## Hosting

### GitHub Pages

A deploy workflow lives at `.github/workflows/deploy.yml`. To activate it:

1. Set `site: 'https://<your-username>.github.io'` in `astro.config.mjs` (or your custom domain).
2. In GitHub repo Settings → Pages, set source to **GitHub Actions**.

> **Note:** If deployed as a project page (`github.io/personal/`), you will need to add `base: '/personal'` to `astro.config.mjs` and all internal links will need the base prefix. The workflow does not set a base — add it manually if needed.

### Netlify / Vercel

Point your provider at:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

Set `site:` in `astro.config.mjs` to your production URL so canonical and og:url tags are emitted correctly.
