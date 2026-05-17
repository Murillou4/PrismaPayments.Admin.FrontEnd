<script lang="ts">
  import type { ResolveDisputePayload } from '$appmod/features/disputes/domain/entities/Dispute';
  import { Button } from '$lib/components/ui/button';
  import { Loader2 } from 'lucide-svelte';

  interface Props {
    onResolve: (payload: ResolveDisputePayload) => Promise<void>;
    submitting?: boolean;
  }

  let { onResolve, submitting = false }: Props = $props();

  // D-13: Both fields required before submit (per user decision)
  const RESOLVE_OPTIONS = [
    { value: 'ACCEPTED',  label: 'Aceita' },
    { value: 'REJECTED',  label: 'Rejeitada' },
    { value: 'RESOLVED',  label: 'Resolvida' },
  ];

  let resolveStatus = $state<'ACCEPTED' | 'REJECTED' | 'RESOLVED' | ''>('');
  let resolution = $state('');

  // D-13: submit disabled until both fields filled
  const canSubmit = $derived(resolveStatus !== '' && resolution.trim().length > 0);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    await onResolve({
      status: resolveStatus as 'ACCEPTED' | 'REJECTED' | 'RESOLVED',
      resolution: resolution.trim(),
    });
  }
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">

  <!-- Status dropdown label -->
  <div>
    <label
      for="resolve-status"
      style="display: block; font-size: 0.75rem; font-family: var(--font-body); color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;"
    >
      Status de Resolução
    </label>
    <select
      id="resolve-status"
      bind:value={resolveStatus}
      disabled={submitting}
      style="
        width: 100%;
        background: var(--color-surface-elevated, #141420);
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 0.875rem;
        color: {resolveStatus ? 'var(--color-foreground, #F6F6FF)' : 'var(--color-foreground-secondary, #9090A8)'};
        cursor: pointer;
        outline: none;
      "
      onfocus={(e) => (e.currentTarget.style.borderColor = '#FF00FF')}
      onblur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
    >
      <option value="" disabled>Selecione o status...</option>
      {#each RESOLVE_OPTIONS as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>

  <!-- Resolution textarea -->
  <div>
    <label
      for="resolve-text"
      style="display: block; font-size: 0.75rem; font-family: var(--font-body); color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;"
    >
      Texto de Resolução
    </label>
    <textarea
      id="resolve-text"
      bind:value={resolution}
      disabled={submitting}
      placeholder="Descreva a resolução da disputa..."
      rows={4}
      style="
        width: 100%;
        min-height: 96px;
        background: var(--color-surface-elevated, #141420);
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 1rem;
        font-family: var(--font-body);
        color: var(--color-foreground, #F6F6FF);
        resize: vertical;
        outline: none;
        box-sizing: border-box;
      "
      onfocus={(e) => (e.currentTarget.style.borderColor = '#FF00FF')}
      onblur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
    ></textarea>
  </div>

  <!-- Submit button — magenta gradient per UI-SPEC -->
  <Button
    onclick={handleSubmit}
    disabled={!canSubmit || submitting}
    style="
      background: {canSubmit && !submitting ? 'linear-gradient(135deg, #FF00FF, #CC00CC)' : 'transparent'};
      border: 1px solid {canSubmit && !submitting ? '#FF00FF' : 'rgba(255,255,255,0.08)'};
      color: {canSubmit && !submitting ? '#fff' : 'var(--color-foreground-disabled, #3A3A50)'};
      opacity: {canSubmit && !submitting ? '1' : '0.38'};
      cursor: {canSubmit && !submitting ? 'pointer' : 'not-allowed'};
      display: inline-flex; align-items: center; gap: 8px;
    "
  >
    {#if submitting}
      <Loader2 size={16} style="animation: spin 1s linear infinite;" />
      Salvando...
    {:else}
      Salvar Resolução
    {/if}
  </Button>
</div>

<style>
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
</style>
