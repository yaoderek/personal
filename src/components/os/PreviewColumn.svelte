<script lang="ts">
  import type { FSNode } from '../../lib/os/types';
  import Icon from './Icon.svelte';

  type Props = {
    node: FSNode;
    onopen: (path: string) => void;
  };

  let { node, onopen }: Props = $props();

  const iconKind = $derived(node.icon as 'folder' | 'doc' | 'app' | 'image');
</script>

<div class="preview">
  <div class="visual">
    {#if node.previewImage}
      <img class="thumb" src={node.previewImage} alt="" />
    {:else}
      <Icon kind={iconKind} size={48} thumb={node.previewImage ?? null} />
    {/if}
  </div>

  <div class="name">{node.name}</div>

  {#if node.meta && node.meta.length > 0}
    <dl class="meta">
      {#each node.meta as [label, value] (label)}
        <dt>{label}</dt>
        <dd>{value}</dd>
      {/each}
    </dl>
  {/if}

  {#if node.blurb}
    <p class="blurb">{node.blurb}</p>
  {/if}

  {#if node.open}
    <button class="open" onclick={() => onopen(node.path)}>Open</button>
  {/if}
</div>

<style>
  .preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px 12px;
    height: 100%;
    overflow-y: auto;
  }

  .visual {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    margin-top: 6px;
  }

  .thumb {
    max-width: 200px;
    max-height: 140px;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  }

  .name {
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    color: var(--text);
    word-break: break-word;
    line-height: 1.3;
  }

  .meta {
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 8px;
    row-gap: 3px;
    margin: 0;
    align-self: center;
    max-width: 100%;
  }

  .meta dt {
    font-size: 11px;
    text-align: right;
    color: var(--text-dim);
  }

  .meta dd {
    font-size: 11px;
    text-align: left;
    margin: 0;
    color: var(--text);
    word-break: break-word;
  }

  .blurb {
    font-family: var(--serif-font);
    font-size: 12px;
    font-style: italic;
    color: var(--text-dim);
    text-align: left;
    line-height: 1.45;
    margin: 2px 0 0;
    padding: 0 4px;
    align-self: stretch;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .open {
    margin-top: 2px;
    font-size: 12px;
    color: var(--accent);
    padding: 2px 10px;
  }

  .open:hover {
    text-decoration: underline;
  }
</style>
