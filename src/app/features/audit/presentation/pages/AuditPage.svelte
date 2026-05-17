<script lang="ts">
  import { Activity, Filter, RefreshCw } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import MetricPanel from '$appmod/shared/widgets/MetricPanel.svelte';
  import ActionToolbar from '$appmod/shared/widgets/ActionToolbar.svelte';
  import JsonPanel from '$appmod/shared/widgets/JsonPanel.svelte';
  import CopyButton from '$appmod/shared/widgets/CopyButton.svelte';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import { appServices } from '$core/service_locator/dependencies';
  import type { AuditTimelineItem } from '../../domain/entities/Audit';

  const service = appServices.audit();

  let items = $state<AuditTimelineItem[]>([]);
  let total = $state(0);
  let loading = $state(true);
  let error = $state('');
  let actorType = $state('');
  let action = $state('');
  let selected = $state<AuditTimelineItem | null>(null);

  const actorTypes = ['ADMIN', 'MERCHANT', 'SYSTEM'];
  const commonActions = [
    'CREATE_PAYMENT',
    'CREATE_WITHDRAWAL',
    'UPDATE_MERCHANT_STATUS',
    'REVIEW_MERCHANT_VERIFICATION',
    'CREATE_FEE_RULE',
    'DELETE_FEE_RULE',
    'CREATE_ADMIN',
    'DEACTIVATE_ADMIN',
    'RESOLVE_DISPUTE'
  ];

  const adminEvents = $derived(items.filter((item) => item.actorType === 'ADMIN').length);
  const systemEvents = $derived(items.filter((item) => item.actorType === 'SYSTEM').length);
  const withTrace = $derived(items.filter((item) => item.traceId).length);

  async function loadAudit() {
    loading = true;
    error = '';
    const result = await service.list({
      actorType: actorType || undefined,
      action: action || undefined,
      page: 1,
      limit: 50
    });
    loading = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    items = result.value.items;
    total = result.value.total;
    selected = items[0] ?? null;
  }

  $effect(() => {
    void actorType;
    void action;
    loadAudit();
  });
</script>

<PageShell
  eyebrow="Governanca"
  title="Auditoria"
  subtitle="Timeline filtravel por ator e acao, com payload tecnico para investigacao e suporte."
  wide
>
  {#snippet actions()}
    <button class="ghost" type="button" onclick={loadAudit}><RefreshCw size={15} /> Atualizar</button>
  {/snippet}

  <div class="metrics">
    <MetricPanel label="Eventos" value={total} tone="cyan" caption="Total no filtro atual">
      {#snippet icon()}<Activity size={16} />{/snippet}
    </MetricPanel>
    <MetricPanel label="Admins" value={adminEvents} tone="magenta" />
    <MetricPanel label="Sistema" value={systemEvents} tone="warning" />
    <MetricPanel label="Com trace" value={withTrace} tone="success" />
  </div>

  <ActionToolbar>
    <label>
      <span>Actor type</span>
      <select bind:value={actorType}>
        <option value="">Todos</option>
        {#each actorTypes as type}<option value={type}>{type}</option>{/each}
      </select>
    </label>
    <label>
      <span>Action</span>
      <input bind:value={action} list="audit-actions" placeholder="Filtrar por acao" />
      <datalist id="audit-actions">
        {#each commonActions as item}<option value={item}></option>{/each}
      </datalist>
    </label>
    <button class="ghost" type="button" onclick={() => { actorType = ''; action = ''; }}><Filter size={15} /> Limpar</button>
  </ActionToolbar>

  {#if error}
    <div class="notice notice--error">{error}</div>
  {/if}

  <div class="audit-layout">
    <section class="timeline">
      {#if loading}
        <div class="empty">Carregando auditoria...</div>
      {:else if items.length === 0}
        <div class="empty">Nenhum evento encontrado.</div>
      {:else}
        {#each items as item}
          <button class:selected={selected?.id === item.id} class="event" type="button" onclick={() => (selected = item)}>
            <span class="event__dot"></span>
            <span class="event__body">
              <strong>{item.action ?? 'ACTION'}</strong>
              <small>{item.actorType ?? 'ACTOR'} / {item.resourceType ?? 'RESOURCE'}</small>
              <em>{formatDate(item.createdAt)}</em>
            </span>
            <span class="event__meta">{item.ipAddress ?? item.traceId ?? ''}</span>
          </button>
        {/each}
      {/if}
    </section>

    <aside class="details">
      {#if selected}
        <header>
          <div>
            <p>Detalhe</p>
            <h2>{selected.action ?? selected.id}</h2>
          </div>
          <CopyButton value={selected.traceId ?? selected.id} label="Copiar ref" />
        </header>

        <div class="kv-grid">
          <div><span>Ator</span><strong>{selected.actorType ?? '-'}</strong></div>
          <div><span>Actor ID</span><strong>{selected.actorId ?? '-'}</strong></div>
          <div><span>Resource</span><strong>{selected.resourceType ?? '-'}</strong></div>
          <div><span>Resource ID</span><strong>{selected.resourceId ?? '-'}</strong></div>
          <div><span>IP</span><strong>{selected.ipAddress ?? '-'}</strong></div>
          <div><span>Trace</span><strong>{selected.traceId ?? '-'}</strong></div>
        </div>

        <JsonPanel title="Details" value={selected.details ?? selected} />
      {:else}
        <div class="empty">Selecione um evento para ver detalhes.</div>
      {/if}
    </aside>
  </div>
</PageShell>

<style>
  .metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  .audit-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 460px;
    gap: 16px;
    align-items: start;
  }

  button,
  input,
  select {
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

  label {
    display: grid;
    gap: 7px;
  }

  label span,
  .details p,
  .kv-grid span {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  input,
  select {
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 11px;
    background: #09090f;
    color: var(--color-foreground);
    outline: none;
  }

  .timeline,
  .details {
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
    overflow: hidden;
  }

  .timeline {
    padding: 8px;
  }

  .details {
    position: sticky;
    top: 86px;
    display: grid;
    gap: 14px;
    padding: 16px;
  }

  .details header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .details p,
  h2 {
    margin: 0;
  }

  h2 {
    font-size: 1.13rem;
  }

  .event {
    width: 100%;
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 13px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--color-foreground);
    text-align: left;
    cursor: pointer;
  }

  .event:hover,
  .event.selected {
    border-color: rgba(1, 250, 251, 0.16);
    background: rgba(1, 250, 251, 0.045);
  }

  .event__dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: var(--color-brand-cyan);
    box-shadow: 0 0 0 5px rgba(1, 250, 251, 0.08);
  }

  .event__body {
    min-width: 0;
  }

  .event__body strong,
  .event__body small,
  .event__body em {
    display: block;
  }

  .event__body small,
  .event__body em,
  .event__meta {
    color: var(--color-foreground-secondary);
    font-size: 0.78rem;
  }

  .event__body strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .event__body em {
    font-style: normal;
    margin-top: 4px;
  }

  .event__meta {
    max-width: 190px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
  }

  .kv-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .kv-grid div {
    display: grid;
    gap: 6px;
    padding: 11px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    background: #08080d;
  }

  .kv-grid strong {
    min-width: 0;
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }

  .empty,
  .notice {
    padding: 16px;
    color: var(--color-foreground-secondary);
    text-align: center;
  }

  .notice {
    margin-bottom: 14px;
    border-radius: 13px;
  }

  .notice--error {
    border: 1px solid rgba(255, 59, 92, 0.2);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.08);
  }

  @media (max-width: 1050px) {
    .metrics,
    .audit-layout {
      grid-template-columns: 1fr;
    }

    .details {
      position: static;
    }
  }
</style>
