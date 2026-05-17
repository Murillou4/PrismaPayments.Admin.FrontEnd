<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    value: string | number;
    tone?: 'default' | 'cyan' | 'magenta' | 'success' | 'warning' | 'danger';
    caption?: string;
    icon?: Snippet;
  }

  let {
    label,
    value,
    tone = 'default',
    caption = '',
    icon
  }: Props = $props();
</script>

<article class="metric metric--{tone}">
  <div class="metric__top">
    <p class="metric__label">{label}</p>
    {#if icon}
      <span class="metric__icon">{@render icon()}</span>
    {/if}
  </div>
  <p class="metric__value">{value}</p>
  {#if caption}
    <p class="metric__caption">{caption}</p>
  {/if}
</article>

<style>
  .metric {
    min-height: 112px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
    box-sizing: border-box;
    overflow: hidden;
  }

  .metric__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .metric__label {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .metric__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.045);
    color: var(--color-foreground-secondary);
  }

  .metric__value {
    margin: 0;
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: clamp(1.45rem, 3vw, 2rem);
    font-weight: 760;
    line-height: 1.05;
    font-variant-numeric: tabular-nums;
  }

  .metric__caption {
    margin: 8px 0 0;
    color: var(--color-foreground-secondary);
    font-size: 0.82rem;
    line-height: 1.45;
  }

  .metric--cyan {
    border-color: rgba(1, 250, 251, 0.18);
  }

  .metric--cyan .metric__icon,
  .metric--cyan .metric__value {
    color: var(--color-brand-cyan);
  }

  .metric--magenta {
    border-color: rgba(255, 0, 255, 0.18);
  }

  .metric--magenta .metric__icon,
  .metric--magenta .metric__value {
    color: var(--color-brand-magenta);
  }

  .metric--success .metric__icon,
  .metric--success .metric__value {
    color: var(--color-success);
  }

  .metric--warning .metric__icon,
  .metric--warning .metric__value {
    color: var(--color-warning);
  }

  .metric--danger .metric__icon,
  .metric--danger .metric__value {
    color: var(--color-danger);
  }
</style>
