<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    label: string;
    value: string;
    sub?: string;
    danger?: boolean;
    mutedValue?: boolean;
    highlight?: boolean;
  };

  let {
    label,
    value,
    sub,
    danger = false,
    mutedValue = false,
    highlight = false,
    children
  }: Props & { children?: Snippet } = $props();
</script>

<div
  class="kpi"
  class:kpi--danger={danger}
  class:kpi--highlight={highlight}
>
  {#if children}
    {@render children()}
  {/if}
  <span class="kpi-label">{label}</span>
  <span
    class="kpi-value"
    class:kpi-value--muted={mutedValue}
    class:kpi-value--danger={danger}
  >{value}</span>
  {#if sub}
    <span class="kpi-sub">{sub}</span>
  {/if}
</div>

<style>
  .kpi {
    position: relative;
    background: #0f0f18;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.4);
    transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
    min-width: 0;
  }
  .kpi:hover {
    border-color: rgba(255, 255, 255, 0.14);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.45);
  }
  .kpi--danger {
    border-color: rgba(255, 59, 92, 0.25);
  }
  .kpi--highlight {
    border-color: rgba(1, 250, 251, 0.22);
    box-shadow: 0 0 20px rgba(1, 250, 251, 0.06), 0 4px 16px rgba(0, 0, 0, 0.5);
  }
  .kpi-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9090a8;
    line-height: 1;
  }
  .kpi-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #f6f6ff;
    letter-spacing: 0.01em;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }
  .kpi-value--muted {
    color: #9090a8;
  }
  .kpi-value--danger {
    color: #ff3b5c;
  }
  .kpi-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    color: #3a3a50;
    letter-spacing: 0.02em;
  }
</style>
