<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    wide?: boolean;
    actions?: Snippet;
    children: Snippet;
  }

  let {
    eyebrow = '',
    title,
    subtitle = '',
    wide = false,
    actions,
    children
  }: Props = $props();
</script>

<section class="page-shell" class:page-shell--wide={wide}>
  <header class="page-shell__header">
    <div class="page-shell__copy">
      {#if eyebrow}
        <p class="page-shell__eyebrow">{eyebrow}</p>
      {/if}
      <h1 class="page-shell__title">{title}</h1>
      {#if subtitle}
        <p class="page-shell__subtitle">{subtitle}</p>
      {/if}
    </div>
    {#if actions}
      <div class="page-shell__actions">
        {@render actions()}
      </div>
    {/if}
  </header>

  <div class="page-shell__content">
    {@render children()}
  </div>
</section>

<style>
  .page-shell {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
    padding: 20px 24px 46px;
    box-sizing: border-box;
    animation: page-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .page-shell--wide {
    max-width: 1440px;
  }

  .page-shell__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 16px;
    padding: 14px 16px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.036), rgba(255, 255, 255, 0.01)),
      rgba(255, 255, 255, 0.014);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
  }

  .page-shell__copy {
    min-width: 0;
  }

  .page-shell__eyebrow {
    margin: 0 0 6px;
    color: var(--color-brand-cyan);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 760;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .page-shell__title {
    margin: 0;
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: clamp(1.26rem, 2vw, 1.72rem);
    font-weight: 820;
    line-height: 1.1;
    letter-spacing: 0;
  }

  .page-shell__subtitle {
    max-width: 680px;
    margin: 6px 0 0;
    color: var(--color-foreground-secondary);
    font-size: 0.82rem;
    line-height: 1.48;
    text-wrap: pretty;
  }

  .page-shell__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .page-shell__content {
    min-width: 0;
    animation: content-in 0.38s cubic-bezier(0.16, 1, 0.3, 1) 70ms both;
  }

  @keyframes page-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes content-in {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 760px) {
    .page-shell {
      padding: 16px 14px 34px;
    }

    .page-shell__header {
      flex-direction: column;
      align-items: stretch;
      padding: 14px;
    }

    .page-shell__actions {
      justify-content: flex-start;
    }
  }
</style>
