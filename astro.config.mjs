import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// GitHub Pages project site: served at https://yaoderek.github.io/personal/.
// If this ever moves to a custom domain, update `site` and drop `base`.
export default defineConfig({
  site: 'https://yaoderek.github.io',
  base: '/personal',
  integrations: [svelte()],
  output: 'static',
});
