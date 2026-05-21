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
    position: relative;
    min-height: 100px;
    padding: 15px;
    border: 1px solid var(--color-border);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
    box-shadow: var(--shadow-md);
    box-sizing: border-box;
    overflow: hidden;
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .metric::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(1, 250, 251, 0.22), transparent);
    opacity: 0.72;
  }

  .metric::after {
    content: '';
    position: absolute;
    right: -24px;
    bottom: -34px;
    width: 118px;
    height: 118px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(1, 250, 251, 0.06), transparent 66%);
    pointer-events: none;
  }

  .metric:hover {
    transform: translateY(-2px);
    border-color: var(--color-border-hover);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.014)),
      var(--color-surface);
  }

  .metric__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 9px;
  }

  .metric__label {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 760;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .metric__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 27px;
    height: 27px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.045);
    color: var(--color-foreground-secondary);
  }

  .metric__value {
    margin: 0;
    color: var(--color-foreground);
    font-family: var(--font-mono);
    font-size: clamp(1.18rem, 2.3vw, 1.58rem);
    font-weight: 720;
    line-height: 1.05;
    font-variant-numeric: tabular-nums;
  }

  .metric__caption {
    margin: 7px 0 0;
    color: var(--color-foreground-secondary);
    font-size: 0.76rem;
    line-height: 1.45;
  }

  .metric--cyan {
    border-color: rgba(1, 250, 251, 0.18);
  }

  .metric--cyan::before {
    background: linear-gradient(90deg, transparent, rgba(1, 250, 251, 0.42), transparent);
  }

  .metric--cyan::after {
    background: radial-gradient(circle, rgba(1, 250, 251, 0.12), transparent 66%);
  }

  .metric--cyan .metric__icon,
  .metric--cyan .metric__value {
    color: var(--color-brand-cyan);
  }

  .metric--magenta {
    border-color: rgba(255, 0, 255, 0.18);
  }

  .metric--magenta::before {
    background: linear-gradient(90deg, transparent, rgba(255, 0, 255, 0.36), transparent);
  }

  .metric--magenta::after {
    background: radial-gradient(circle, rgba(255, 0, 255, 0.12), transparent 66%);
  }

  .metric--magenta .metric__icon,
  .metric--magenta .metric__value {
    color: var(--color-brand-magenta);
  }

  .metric--success .metric__icon,
  .metric--success .metric__value {
    color: var(--color-success);
  }

  .metric--success::before {
    background: linear-gradient(90deg, transparent, rgba(0, 230, 118, 0.34), transparent);
  }

  .metric--warning .metric__icon,
  .metric--warning .metric__value {
    color: var(--color-warning);
  }

  .metric--warning::before {
    background: linear-gradient(90deg, transparent, rgba(255, 179, 0, 0.34), transparent);
  }

  .metric--danger .metric__icon,
  .metric--danger .metric__value {
    color: var(--color-danger);
  }

  .metric--danger::before {
    background: linear-gradient(90deg, transparent, rgba(255, 59, 92, 0.34), transparent);
  }
</style>
