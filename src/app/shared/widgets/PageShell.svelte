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
    max-width: 1240px;
    margin: 0 auto;
    padding: 30px 32px 52px;
    box-sizing: border-box;
    animation: page-in 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .page-shell--wide {
    max-width: 1500px;
  }

  .page-shell__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .page-shell__copy {
    min-width: 0;
  }

  .page-shell__eyebrow {
    margin: 0 0 8px;
    color: var(--color-brand-cyan);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .page-shell__title {
    margin: 0;
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 3vw, 2.35rem);
    font-weight: 750;
    line-height: 1.02;
    letter-spacing: 0;
  }

  .page-shell__subtitle {
    max-width: 680px;
    margin: 9px 0 0;
    color: var(--color-foreground-secondary);
    font-size: 0.92rem;
    line-height: 1.55;
    text-wrap: pretty;
  }

  .page-shell__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .page-shell__content {
    min-width: 0;
  }

  @keyframes page-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 760px) {
    .page-shell {
      padding: 18px 14px 36px;
    }

    .page-shell__header {
      flex-direction: column;
      align-items: stretch;
    }

    .page-shell__actions {
      justify-content: flex-start;
    }
  }
</style>
