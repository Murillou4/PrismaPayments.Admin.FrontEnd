<script lang="ts">
  import { PlugZap, RefreshCw, ShieldCheck, ShieldX } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import MetricPanel from '$appmod/shared/widgets/MetricPanel.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import JsonPanel from '$appmod/shared/widgets/JsonPanel.svelte';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import { appServices } from '$core/service_locator/dependencies';
  import type { PaymentProvider } from '../../domain/entities/Provider';

  const service = appServices.providers();

  let items = $state<PaymentProvider[]>([]);
  let total = $state(0);
  let loading = $state(true);
  let error = $state('');
  let selected = $state<PaymentProvider | null>(null);

  const activeCount = $derived(items.filter((item) => item.isActive).length);
  const unhealthyCount = $derived(items.filter((item) => (item.healthStatus ?? '').toUpperCase() !== 'HEALTHY').length);
  const paymentCount = $derived(items.filter((item) => item.providerType === 'PAYMENT').length);

  function healthTone(status?: string | null) {
    const normalized = (status ?? '').toUpperCase();
    if (normalized === 'HEALTHY' || normalized === 'UP') return 'ACTIVE';
    if (normalized === 'DEGRADED') return 'PENDING';
    return 'FAILED';
  }

  async function loadProviders() {
    loading = true;
    error = '';
    const result = await service.list();
    loading = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    items = result.value.items;
    total = result.value.total;
    selected = result.value.items[0] ?? null;
  }

  $effect(() => {
    loadProviders();
  });
</script>

<PageShell
  eyebrow="Infra"
  title="Provedores"
  subtitle="Saude, metodos suportados e prioridades expostas pelo backend, sem secrets na UI."
  wide
>
  {#snippet actions()}
    <button class="ghost" type="button" onclick={loadProviders}><RefreshCw size={15} /> Atualizar</button>
  {/snippet}

  <div class="metrics">
    <MetricPanel label="Total" value={total} tone="cyan" caption="Providers registrados">
      {#snippet icon()}<PlugZap size={16} />{/snippet}
    </MetricPanel>
    <MetricPanel label="Ativos" value={activeCount} tone="success" />
    <MetricPanel label="Nao saudaveis" value={unhealthyCount} tone={unhealthyCount ? 'danger' : 'success'} />
    <MetricPanel label="Payment" value={paymentCount} tone="magenta" />
  </div>

  {#if error}
    <div class="notice notice--error">{error}</div>
  {/if}

  <div class="provider-layout">
    <section class="provider-grid">
      {#if loading}
        <div class="empty">Carregando provedores...</div>
      {:else if items.length === 0}
        <div class="empty">Nenhum provedor registrado.</div>
      {:else}
        {#each items as provider}
          <button class:selected={selected?.id === provider.id} class="provider-card" type="button" onclick={() => (selected = provider)}>
            <header>
              <span class="provider-icon">
                {#if provider.isActive}<ShieldCheck size={18} />{:else}<ShieldX size={18} />{/if}
              </span>
              <StatusBadge status={healthTone(provider.healthStatus)} />
            </header>
            <strong>{provider.displayName ?? provider.name}</strong>
            <small>{provider.providerType ?? 'PROVIDER'} / {provider.name}</small>
            <div class="chips">
              {#each provider.supportedMethods ?? [] as method}
                <span>{method}</span>
              {/each}
              {#if !provider.supportedMethods?.length}<span>Sem metodos</span>{/if}
            </div>
            <em>Ultimo check: {formatDate(provider.lastHealthCheck)}</em>
          </button>
        {/each}
      {/if}
    </section>

    <aside class="details">
      {#if selected}
        <header>
          <div>
            <p>Provider detail</p>
            <h2>{selected.displayName ?? selected.name}</h2>
          </div>
          <StatusBadge status={selected.isActive ? 'ACTIVE' : 'INACTIVE'} />
        </header>

        <div class="kv-grid">
          <div><span>Tipo</span><strong>{selected.providerType ?? '-'}</strong></div>
          <div><span>Health</span><strong>{selected.healthStatus ?? '-'}</strong></div>
          <div><span>Ultimo check</span><strong>{formatDate(selected.lastHealthCheck)}</strong></div>
          <div><span>Atualizado</span><strong>{formatDate(selected.updatedAt)}</strong></div>
        </div>

        <section class="priority-list">
          <p>Prioridades</p>
          {#each selected.priorities ?? [] as priority}
            <div>
              <strong>{priority.paymentMethod ?? 'METHOD'}</strong>
              <span>#{priority.priority ?? 0} / {priority.isActive ? 'ativo' : 'inativo'}</span>
            </div>
          {:else}
            <span class="muted">Sem prioridades configuradas.</span>
          {/each}
        </section>

        <JsonPanel title="Provider payload" value={selected} />
      {:else}
        <div class="empty">Selecione um provedor.</div>
      {/if}
    </aside>
  </div>
</PageShell>

<style>
  .metrics,
  .provider-layout,
  .provider-grid,
  .kv-grid {
    display: grid;
    gap: 14px;
  }

  .metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 16px;
  }

  .provider-layout {
    grid-template-columns: minmax(0, 1fr) 430px;
    align-items: start;
  }

  .provider-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  button {
    font: inherit;
  }

  .ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 11px;
    color: var(--color-foreground-secondary);
    background: rgba(255, 255, 255, 0.035);
    font-weight: 750;
    cursor: pointer;
  }

  .provider-card,
  .details {
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
  }

  .provider-card {
    display: grid;
    gap: 10px;
    min-height: 202px;
    padding: 16px;
    color: var(--color-foreground);
    text-align: left;
    cursor: pointer;
  }

  .provider-card:hover,
  .provider-card.selected {
    border-color: rgba(1, 250, 251, 0.18);
    background: linear-gradient(180deg, rgba(1, 250, 251, 0.055), rgba(255, 255, 255, 0.01)), var(--color-surface);
  }

  .provider-card header,
  .details header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .provider-icon {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(1, 250, 251, 0.18);
    border-radius: 13px;
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.06);
  }

  .provider-card strong {
    font-size: 1.12rem;
  }

  .provider-card small,
  .provider-card em,
  .muted {
    color: var(--color-foreground-secondary);
  }

  .provider-card em {
    font-style: normal;
    font-size: 0.78rem;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .chips span {
    padding: 5px 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.055);
    font-size: 0.76rem;
  }

  .details {
    position: sticky;
    top: 86px;
    display: grid;
    gap: 14px;
    padding: 16px;
  }

  .details p,
  .priority-list p,
  .kv-grid span {
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
    font-size: 1.13rem;
  }

  .kv-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kv-grid div,
  .priority-list div {
    display: grid;
    gap: 6px;
    padding: 11px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    background: #08080d;
  }

  .kv-grid strong,
  .priority-list strong {
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }

  .priority-list {
    display: grid;
    gap: 9px;
  }

  .priority-list div {
    grid-template-columns: 1fr auto;
    align-items: center;
  }

  .priority-list span {
    color: var(--color-foreground-secondary);
    font-size: 0.78rem;
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

  @media (max-width: 1100px) {
    .metrics,
    .provider-layout,
    .provider-grid {
      grid-template-columns: 1fr;
    }

    .details {
      position: static;
    }
  }
</style>
