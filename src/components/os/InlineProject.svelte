<script lang="ts">
  // Inline project case study, rendered in the Finder's preview pane so
  // projects are browsable without opening a window.
  import { formatDate } from '../../lib/os/format';

  type Props = {
    title: string;
    oneLiner: string;
    stack: string[];
    status: string;
    created: string;
    imageUrls: string[];
    bodyHtml: string;
    repo?: string | null;
    demo?: string | null;
    thumbUrl?: string | null;
  };

  let {
    title,
    oneLiner,
    stack,
    status,
    created,
    imageUrls,
    bodyHtml,
    repo = null,
    demo = null,
    thumbUrl = null,
  }: Props = $props();
</script>

<article class="project" aria-label={title}>
  <div class="inner">
    <header class="head">
      {#if thumbUrl}
        <img class="app-thumb" src={thumbUrl} alt="" draggable="false" />
      {/if}
      <div class="titles">
        <h1 class="title">{title}</h1>
        <p class="one-liner">{oneLiner}</p>
      </div>
      <div class="links">
        {#if repo}<a href={repo} target="_blank" rel="noopener">Repo ↗</a>{/if}
        {#if demo}<a href={demo} target="_blank" rel="noopener">Demo ↗</a>{/if}
      </div>
    </header>

    <p class="meta">
      {stack.join(', ')} · {status} · {formatDate(created)}
    </p>

    {#if imageUrls.length > 0}
      <div class="strip" role="list">
        {#each imageUrls as url, i (url)}
          <img src={url} alt={`${title} screenshot ${i + 1}`} loading="lazy" draggable="false" />
        {/each}
      </div>
    {/if}

    <div class="body">
      {@html bodyHtml}
    </div>
  </div>
</article>

<style>
  .project {
    height: 100%;
    overflow-y: auto;
    background: var(--paper);
    color: var(--paper-text);
  }

  .inner {
    max-width: 720px;
    margin: 0 auto;
    padding: 26px 32px 48px;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .app-thumb {
    width: 40px;
    height: 40px;
    border-radius: 9px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .titles {
    flex: 1 1 auto;
    min-width: 0;
  }

  .title {
    font-family: var(--chrome-font);
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .one-liner {
    font-size: 13px;
    color: var(--text-dim);
    margin: 2px 0 0;
  }

  .links {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .links a {
    font-size: 11px;
    color: var(--text);
    border: 1px solid var(--hairline);
    border-radius: 5px;
    padding: 3px 8px;
    text-decoration: none;
  }

  .links a:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  .meta {
    font-size: 11.5px;
    color: var(--text-dim);
    margin: 10px 0 14px;
  }

  .strip {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-bottom: 16px;
    scroll-snap-type: x proximity;
  }

  .strip img {
    height: 200px;
    border-radius: 8px;
    flex-shrink: 0;
    scroll-snap-align: start;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);
  }

  .body {
    font-family: var(--chrome-font);
    font-size: 15px;
    line-height: 1.6;
  }

  .body :global(p) {
    margin: 0 0 0.85em;
  }

  .body :global(h2) {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-dim);
    margin: 1.9em 0 0.6em;
  }

  .body :global(a) {
    color: var(--accent);
  }
</style>
