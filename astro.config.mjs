import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

// GitHub Pages project site: served at https://yaoderek.github.io/personal/.
// If this ever moves to a custom domain, update `site` and drop `base`,
// and update the Sitemap URL in public/robots.txt.
export default defineConfig({
  site: 'https://yaoderek.github.io',
  base: '/personal',
  integrations: [svelte(), sitemap()],
  output: 'static',
});
