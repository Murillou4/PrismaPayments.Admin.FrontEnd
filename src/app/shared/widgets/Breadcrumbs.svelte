<script lang="ts">
  import { ChevronRight } from 'lucide-svelte';

  interface Segment {
    label: string;
    href?: string;
  }

  interface Props {
    segments: Segment[];
  }

  let { segments }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class="breadcrumbs">
  {#each segments as segment, i (i)}
    {@const isLast = i === segments.length - 1}
    {#if i > 0}
      <ChevronRight size={14} strokeWidth={1.5} class="breadcrumbs__separator" />
    {/if}
    {#if isLast}
      <span class="breadcrumbs__current" aria-current="page">
        {segment.label}
      </span>
    {:else}
      <a href={segment.href ?? '#'} class="breadcrumbs__link">
        {segment.label}
      </a>
    {/if}
  {/each}
</nav>

<style>
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }

  :global(.breadcrumbs__separator) {
    flex-shrink: 0;
    color: var(--color-foreground-secondary);
  }

  .breadcrumbs__current {
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: 1.04rem;
    font-weight: 720;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
  }

  .breadcrumbs__link {
    color: var(--color-brand-cyan);
    font-size: 0.75rem;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s;
  }

  .breadcrumbs__link:hover {
    opacity: 0.76;
  }
</style>
