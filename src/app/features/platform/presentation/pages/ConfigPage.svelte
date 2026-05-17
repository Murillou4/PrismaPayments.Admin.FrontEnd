<script lang="ts">
  import { page } from '$app/state';
  import { Gauge, LockKeyhole, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import MetricPanel from '$appmod/shared/widgets/MetricPanel.svelte';
  import JsonPanel from '$appmod/shared/widgets/JsonPanel.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import { appServices } from '$core/service_locator/dependencies';
  import type { PlatformConfig, RateLimitStatus } from '../../domain/entities/Platform';

  const service = appServices.platform();

  let config = $state<PlatformConfig | null>(null);
  let rateLimit = $state<RateLimitStatus | null>(null);
  let loading = $state(true);
  let toggling = $state(false);
  let error = $state('');
  let message = $state('');
  let ttlMinutes = $state('15');
  let confirmText = $state('');

  const canToggle = $derived(hasPermission(page.data.adminRole as AdminRole, 'SUPER_ADMIN'));
  const counters = $derived(config?.counters ?? {});
  const activeProviders = $derived(Number(counters.activeProviders ?? 0));
  const degradedProviders = $derived(Number(counters.degradedProviders ?? 0));

  async function loadConfig() {
    loading = true;
    error = '';
    const [configResult, rateLimitResult] = await Promise.all([
      service.config(),
      service.rateLimit()
    ]);
    loading = false;

    if (!configResult.ok) {
      error = configResult.failure.message;
      return;
    }

    config = configResult.value;
    if (rateLimitResult.ok) rateLimit = rateLimitResult.value;
  }

  async function toggleRateLimit(enabled: boolean) {
    if (!canToggle) return;
    if (!enabled && confirmText !== 'DISABLE') return;
    if (enabled && confirmText !== 'ENABLE') return;

    const confirmed = window.confirm(enabled ? 'Reativar rate limiting global?' : 'Desativar rate limiting global?');
    if (!confirmed) return;

    toggling = true;
    error = '';
    message = '';
    const result = await service.toggleRateLimit({
      enabled,
      ttlMinutes: enabled ? null : Number(ttlMinutes)
    });
    toggling = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    rateLimit = result.value;
    message = result.value.message ?? 'Rate limit atualizado.';
    confirmText = '';
  }

  $effect(() => {
    loadConfig();
  });
</script>

<PageShell
  eyebrow="Platform"
  title="Configuracao"
  subtitle="Snapshot read-only da plataforma e controle global de rate limit para emergencia."
  wide
>
  {#snippet actions()}
    <button class="ghost" type="button" onclick={loadConfig}><RefreshCw size={15} /> Atualizar</button>
  {/snippet}

  {#if loading}
    <div class="empty">Carregando configuracao...</div>
  {:else}
    <div class="metrics">
      <MetricPanel label="Ambiente" value={config?.environment ?? '-'} tone="cyan" caption={config?.appName ?? 'Prisma Payments'}>
        {#snippet icon()}<Gauge size={16} />{/snippet}
      </MetricPanel>
      <MetricPanel label="Versao" value={config?.version ?? '-'} tone="magenta" caption={config?.apiPrefix ?? '/api/v1'} />
      <MetricPanel label="Providers ativos" value={activeProviders} tone="success" />
      <MetricPanel label="Degradados" value={degradedProviders} tone={degradedProviders ? 'danger' : 'success'} />
    </div>

    {#if error}<div class="notice notice--error">{error}</div>{/if}
    {#if message}<div class="notice notice--success">{message}</div>{/if}

    <div class="config-grid">
      <section class="panel">
        <header>
          <div>
            <p>Snapshot</p>
            <h2>Features e limites</h2>
          </div>
          <StatusBadge status={config?.environment ?? 'UNKNOWN'} />
        </header>

        <div class="kv-grid">
          {#each Object.entries(config?.features ?? {}) as [key, value]}
            <div><span>{key}</span><strong>{String(value)}</strong></div>
          {/each}
          {#each Object.entries(config?.limits ?? {}) as [key, value]}
            <div><span>{key}</span><strong>{String(value)}</strong></div>
          {/each}
        </div>
      </section>

      <section class="panel rate">
        <header>
          <div>
            <p>Rate limit</p>
            <h2>{rateLimit?.enabled ? 'Ativo' : 'Desativado'}</h2>
          </div>
          {#if rateLimit?.enabled}<ToggleRight size={24} />{:else}<ToggleLeft size={24} />{/if}
        </header>
        <div class="rate-state">
          <span>Global disabled</span>
          <strong>{String(rateLimit?.globallyDisabled ?? !rateLimit?.enabled)}</strong>
        </div>
        {#if rateLimit?.reason}
          <p class="muted">{rateLimit.reason}</p>
        {/if}
        <label><span>TTL ao desativar (min)</span><input bind:value={ttlMinutes} inputmode="numeric" /></label>
        <label><span>Confirmacao</span><input bind:value={confirmText} placeholder={rateLimit?.enabled ? 'DISABLE' : 'ENABLE'} /></label>
        <div class="buttons">
          <button class="danger" type="button" onclick={() => toggleRateLimit(false)} disabled={!canToggle || !rateLimit?.enabled || confirmText !== 'DISABLE' || toggling}>
            <LockKeyhole size={14} /> Desativar
          </button>
          <button class="primary" type="button" onclick={() => toggleRateLimit(true)} disabled={!canToggle || rateLimit?.enabled || confirmText !== 'ENABLE' || toggling}>
            Reativar
          </button>
        </div>
      </section>
    </div>

    <JsonPanel title="Platform config" value={config} />
  {/if}
</PageShell>

<style>
  .metrics,
  .config-grid,
  .kv-grid {
    display: grid;
    gap: 14px;
  }

  .metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 16px;
  }

  .config-grid {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
    margin-bottom: 16px;
  }

  button,
  input {
    font: inherit;
  }

  .primary,
  .ghost,
  .danger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 12px;
    border-radius: 11px;
    font-weight: 750;
    cursor: pointer;
  }

  .primary {
    border: 1px solid rgba(1, 250, 251, 0.24);
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.06);
  }

  .ghost {
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--color-foreground-secondary);
    background: rgba(255, 255, 255, 0.035);
  }

  .danger {
    border: 1px solid rgba(255, 59, 92, 0.2);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.07);
  }

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .panel {
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  header p,
  label span,
  .kv-grid span,
  .rate-state span {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h2 {
    margin: 4px 0 0;
    font-size: 1.14rem;
  }

  .kv-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kv-grid div,
  .rate-state {
    display: grid;
    gap: 6px;
    padding: 11px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    background: #08080d;
  }

  .kv-grid strong,
  .rate-state strong {
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }

  .rate {
    display: grid;
    gap: 12px;
  }

  label {
    display: grid;
    gap: 7px;
  }

  input {
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 11px;
    background: #09090f;
    color: var(--color-foreground);
    outline: none;
  }

  .buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }

  .muted {
    margin: 0;
    color: var(--color-foreground-secondary);
    line-height: 1.45;
  }

  .empty,
  .notice {
    padding: 18px;
    border-radius: 14px;
    color: var(--color-foreground-secondary);
    text-align: center;
  }

  .notice {
    margin-bottom: 14px;
  }

  .notice--error {
    border: 1px solid rgba(255, 59, 92, 0.2);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.08);
  }

  .notice--success {
    border: 1px solid rgba(0, 230, 118, 0.2);
    color: var(--color-success);
    background: rgba(0, 230, 118, 0.08);
  }

  @media (max-width: 1050px) {
    .metrics,
    .config-grid,
    .kv-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
