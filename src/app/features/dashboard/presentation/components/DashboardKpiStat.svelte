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
    min-height: 118px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.048), rgba(255, 255, 255, 0.014)),
      var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 18px;
    padding: 15px 16px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.055);
    overflow: hidden;
    transition:
      border-color 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    min-width: 0;
  }

  .kpi::after {
    content: '';
    position: absolute;
    right: -34px;
    bottom: -42px;
    width: 118px;
    height: 118px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(1, 250, 251, 0.08), transparent 68%);
    pointer-events: none;
  }

  .kpi:hover {
    border-color: var(--color-border-hover);
    transform: translateY(-2px);
  }

  .kpi--danger {
    border-color: rgba(255, 59, 92, 0.25);
  }

  .kpi--danger::after {
    background: radial-gradient(circle, rgba(255, 59, 92, 0.11), transparent 68%);
  }

  .kpi--highlight {
    border-color: rgba(1, 250, 251, 0.22);
    background:
      linear-gradient(145deg, rgba(1, 250, 251, 0.08), rgba(255, 0, 255, 0.026)),
      var(--color-surface);
  }

  .kpi-label {
    position: relative;
    z-index: 1;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-foreground-secondary);
    line-height: 1;
  }

  .kpi-value {
    position: relative;
    z-index: 1;
    font-family: var(--font-mono);
    font-size: clamp(1.08rem, 1.7vw, 1.38rem);
    font-weight: 720;
    color: var(--color-foreground);
    letter-spacing: 0;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .kpi-value--muted {
    color: var(--color-foreground-secondary);
  }

  .kpi-value--danger {
    color: var(--color-danger);
  }

  .kpi-sub {
    position: relative;
    z-index: 1;
    font-size: 0.72rem;
    color: var(--color-foreground-secondary);
    letter-spacing: 0.02em;
  }
</style>
