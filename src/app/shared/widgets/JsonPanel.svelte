<script lang="ts">
  import CopyButton from './CopyButton.svelte';

  interface Props {
    title?: string;
    value: unknown;
  }

  let { title = 'JSON', value }: Props = $props();

  const formatted = $derived.by(() => {
    try {
      return JSON.stringify(value ?? {}, null, 2);
    } catch {
      return String(value ?? '');
    }
  });
</script>

<section class="json-panel">
  <header class="json-panel__header">
    <p>{title}</p>
    <CopyButton value={formatted} label="Copiar JSON" />
  </header>
  <pre>{formatted}</pre>
</section>

<style>
  .json-panel {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    background: #0a0a10;
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .json-panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 12px;
    border-bottom: 1px solid var(--color-border-subtle);
    background: rgba(255, 255, 255, 0.026);
  }

  .json-panel__header p {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  pre {
    max-height: 420px;
    margin: 0;
    padding: 14px;
    overflow: auto;
    color: #c8c8dd;
    font-family: var(--font-mono);
    font-size: 0.74rem;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
