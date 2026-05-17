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

<nav
  aria-label="Breadcrumb"
  style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;"
>
  {#each segments as segment, i (i)}
    {@const isLast = i === segments.length - 1}
    {#if i > 0}
      <ChevronRight size={14} strokeWidth={1.5} style="color: var(--color-foreground-secondary, #9090A8); flex-shrink: 0;" />
    {/if}
    {#if isLast}
      <span
        style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--color-foreground, #F6F6FF);
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.01em;
        "
        aria-current="page"
      >
        {segment.label}
      </span>
    {:else}
      <a
        href={segment.href ?? '#'}
        style="
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--color-brand-cyan, #01FAFB);
          text-decoration: none;
          transition: opacity 0.15s;
        "
      >
        {segment.label}
      </a>
    {/if}
  {/each}
</nav>
