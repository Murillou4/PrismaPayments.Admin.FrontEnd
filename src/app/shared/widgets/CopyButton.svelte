<script lang="ts">
  import { Check, Copy } from 'lucide-svelte';

  interface Props {
    value: string;
    label?: string;
  }

  let { value, label = 'Copiar' }: Props = $props();
  let copied = $state(false);

  async function copyValue() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    copied = true;
    window.setTimeout(() => (copied = false), 1400);
  }
</script>

<button type="button" class="copy-btn" onclick={copyValue} title={label}>
  {#if copied}
    <Check size={14} strokeWidth={1.7} />
    <span>Copiado</span>
  {:else}
    <Copy size={14} strokeWidth={1.7} />
    <span>{label}</span>
  {/if}
</button>

<style>
  .copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 34px;
    padding: 7px 10px;
    border: 1px solid rgba(1, 250, 251, 0.2);
    border-radius: 10px;
    background: rgba(1, 250, 251, 0.055);
    color: var(--color-brand-cyan);
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 650;
    cursor: pointer;
    transition: background 0.18s, border-color 0.18s, transform 0.18s;
  }

  .copy-btn:hover {
    background: rgba(1, 250, 251, 0.09);
    border-color: rgba(1, 250, 251, 0.32);
    transform: translateY(-1px);
  }

  .copy-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-brand-magenta);
  }
</style>
