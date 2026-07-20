<script lang="ts">
  import wallpaper from '../../assets/wallpaper.svg';
  import type { FSNode, AppId } from '../../lib/os/types';
  import type { Win } from '../../lib/os/windows';
  import { findNode } from '../../lib/os/fs';
  import { onMount } from 'svelte';
  import {
    open,
    close,
    focus,
    minimize,
    toggleFullscreen,
    move,
  } from '../../lib/os/windows';
  import Window from './Window.svelte';
  import MenuBar from './MenuBar.svelte';
  import AboutWindow from './apps/AboutWindow.svelte';

  type Props = {
    tree: FSNode;
    initialPath?: string | null;
    // showResume is accepted now for a stable page contract; used in Task 9.
    showResume: boolean;
  };

  let { tree, initialPath = null, showResume }: Props = $props();
  // showResume is intentionally unused until the Dock arrives (Task 9).
  void showResume;

  let wins = $state<Win[]>([]);

  // Finder view state — Task 7 Finder will consume this.
  let finderView = $state<'columns' | 'list'>('columns');

  // Reduced motion state — initialised from matchMedia with jsdom guard.
  let reducedMotion = $state(
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  // Per-app default window sizes.
  const SIZES: Record<AppId, { w: number; h: number }> = {
    project: { w: 980, h: 620 },
    doc: { w: 640, h: 560 },
    gallery: { w: 840, h: 600 },
    finder: { w: 960, h: 560 },
    about: { w: 420, h: 260 },
    trash: { w: 480, h: 320 },
  };

  function viewport() {
    return { vw: window.innerWidth, vh: window.innerHeight };
  }

  /**
   * Open (or focus) the appropriate window for a filesystem path.
   * - A node with an `open` spec launches that app.
   * - A folder or the root opens/focuses the single Finder window.
   */
  function openPath(path: string) {
    const node = findNode(tree, path);
    if (!node) return;

    if (node.open) {
      const { w, h } = SIZES[node.open.app];
      wins = open(
        wins,
        {
          app: node.open.app,
          title: node.name,
          path: node.path,
          props: node.open.props,
          w,
          h,
        },
        viewport()
      );
      return;
    }

    // Folder or root -> single Finder window.
    const isFolder = node.kind === 'Folder' || node.path === '/';
    if (isFolder) {
      const { w, h } = SIZES.finder;
      const initialSelection = node.path === '/' ? undefined : node.path;
      wins = open(
        wins,
        {
          app: 'finder',
          title: "derek's mac",
          path: '/',
          props: { initialSelection },
          w,
          h,
        },
        viewport()
      );
    }
  }

  /** Open the About window (no filesystem node needed). */
  function openAbout() {
    wins = open(
      wins,
      {
        app: 'about',
        title: 'About this site',
        path: '/__about__',
        props: {},
        w: SIZES.about.w,
        h: SIZES.about.h,
      },
      viewport()
    );
  }

  /** Toggle finder view state. */
  function toggleList(view: 'columns' | 'list') {
    finderView = view;
  }

  /** Toggle reduced motion preference. */
  function toggleReducedMotion() {
    reducedMotion = !reducedMotion;
  }

  onMount(() => {
    // Open Finder at root on mount, then any deep-linked path.
    openPath('/');
    if (initialPath) openPath(initialPath);
  });

  function activeId(): number | null {
    const visible = wins.filter((w) => !w.minimized);
    if (visible.length === 0) return null;
    return visible.reduce((top, w) => (w.z > top.z ? w : top)).id;
  }
</script>

<div class="desktop" style:background-image={`url(${wallpaper})`}>
  <MenuBar
    onopenpath={openPath}
    onopenabout={openAbout}
    ontogglelist={toggleList}
    {finderView}
    {reducedMotion}
    ontogglereducedmotion={toggleReducedMotion}
  />

  {#each wins as win (win.id)}
    <Window
      {win}
      active={win.id === activeId()}
      onfocus={() => (wins = focus(wins, win.id))}
      onclose={() => (wins = close(wins, win.id))}
      onminimize={() => (wins = minimize(wins, win.id))}
      onfullscreen={() => (wins = toggleFullscreen(wins, win.id))}
      onmove={(x, y) => (wins = move(wins, win.id, x, y))}
    >
      {#if win.app === 'finder'}
        <p style="padding:16px">finder placeholder</p>
      {:else if win.app === 'about'}
        <AboutWindow />
      {:else}
        <pre style="padding:16px; overflow:auto; height:100%">{JSON.stringify(
            win.props,
            null,
            2
          )}</pre>
      {/if}
    </Window>
  {/each}
</div>

<style>
  .desktop {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
</style>
