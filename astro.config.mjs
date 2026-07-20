import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// TODO(owner): set site: 'https://<your-domain>' in this config to enable
// canonical URLs and absolute og:url / og:image in the built output.
export default defineConfig({
  integrations: [svelte()],
  output: 'static',
});
