<script lang="ts">
  import { page } from '$app/state';
  import { Activity, GitBranch, RefreshCw, Search, Trash2 } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import MetricPanel from '$appmod/shared/widgets/MetricPanel.svelte';
  import ActionToolbar from '$appmod/shared/widgets/ActionToolbar.svelte';
  import JsonPanel from '$appmod/shared/widgets/JsonPanel.svelte';
  import CopyButton from '$appmod/shared/widgets/CopyButton.svelte';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import { appServices } from '$core/service_locator/dependencies';
  import FlowGraphPanel from '../components/FlowGraphPanel.svelte';
  import FlowNodeInspector from '../components/FlowNodeInspector.svelte';
  import FlowResourceTimeline from '../components/FlowResourceTimeline.svelte';
  import type {
    DiagnosticLogDetail,
    DiagnosticLogListItem,
    DiagnosticsStats,
    FlowGraph
  } from '../../domain/entities/Diagnostics';

  const service = appServices.diagnostics();

  let items = $state<DiagnosticLogListItem[]>([]);
  let total = $state(0);
  let stats = $state<DiagnosticsStats | null>(null);
  let selected = $state<DiagnosticLogDetail | null>(null);
  let traceItems = $state<DiagnosticLogDetail[]>([]);
  let flowGraph = $state<FlowGraph | null>(null);
  let selectedFlowNodeId = $state<string | null>(null);
  let loading = $state(true);
  let detailLoading = $state(false);
  let flowLoading = $state(false);
  let error = $state('');
  let message = $state('');
  let flowInput = $state('');
  let filters = $state({
    method: '',
    statusCode: '',
    path: '',
    traceId: '',
    flowId: '',
    merchantId: '',
    hasError: ''
  });
  let purgeDays = $state('30');
  let purgeConfirm = $state('');
  let purging = $state(false);

  const canPurge = $derived(hasPermission(page.data.adminRole as AdminRole, 'ADMIN'));
  const errorRate = $derived(stats ? `${stats.errorRate.toFixed(2)}%` : '0%');
  const avgMs = $derived(stats ? `${Math.round(stats.avgResponseTimeMs)}ms` : '0ms');
  const activeFlowId = $derived(flowGraph?.flowId ?? selected?.flowId ?? selected?.traceId ?? '');

  function statusClass(status: number) {
    if (status >= 500) return 'danger-text';
    if (status >= 400) return 'warning-text';
    return 'success-text';
  }

  function currentFilters() {
    return {
      method: filters.method || undefined,
      statusCode: filters.statusCode ? Number(filters.statusCode) : null,
      path: filters.path || undefined,
      traceId: filters.traceId || undefined,
      flowId: filters.flowId || undefined,
      merchantId: filters.merchantId || undefined,
      hasError: filters.hasError === '' ? null : filters.hasError === 'true',
      page: 1,
      limit: 40
    };
  }

  function resolveFlowId(item?: DiagnosticLogListItem | DiagnosticLogDetail | null) {
    return item?.flowId || item?.traceId || '';
  }

  async function loadDiagnostics() {
    loading = true;
    error = '';
    const [listResult, statsResult] = await Promise.all([
      service.list(currentFilters()),
      service.stats(currentFilters())
    ]);
    loading = false;

    if (!listResult.ok) {
      error = listResult.failure.message;
      return;
    }

    items = listResult.value.items;
    total = listResult.value.total;
    if (statsResult.ok) stats = statsResult.value;
    selected = null;
    traceItems = [];
  }

  async function loadDetail(item: DiagnosticLogListItem) {
    detailLoading = true;
    error = '';
    const result = await service.getById(item.id);
    detailLoading = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    selected = result.value;
    traceItems = [];
    flowInput = resolveFlowId(result.value);
  }

  async function loadTrace(traceId?: string | null) {
    if (!traceId) return;
    detailLoading = true;
    error = '';
    const result = await service.getTrace(traceId);
    detailLoading = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    traceItems = result.value;
  }

  async function loadFlow(flowId?: string | null) {
    const target = (flowId || flowInput || resolveFlowId(selected)).trim();
    if (!target) {
      error = 'Informe um flowId ou selecione um log com trace/flow.';
      return;
    }

    flowLoading = true;
    error = '';
    selectedFlowNodeId = null;
    const result = await service.getFlow(target);
    flowLoading = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    flowGraph = result.value;
    flowInput = result.value.flowId;
    selectedFlowNodeId = result.value.nodes[0]?.id ?? null;
  }

  async function purgeLogs() {
    if (!canPurge || purgeConfirm !== 'PURGE') return;
    const confirmed = window.confirm(`Purgar logs com mais de ${purgeDays} dias?`);
    if (!confirmed) return;

    purging = true;
    error = '';
    message = '';
    const result = await service.purge(Number(purgeDays));
    purging = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    message = `Purge concluido: ${result.value.deletedCount ?? result.value.deleted ?? 0} logs removidos.`;
    purgeConfirm = '';
    await loadDiagnostics();
  }

  $effect(() => {
    loadDiagnostics();
  });
</script>

<PageShell
  eyebrow="Developer observability"
  title="Logs do Developer"
  subtitle="Logs HTTP, trace tecnico e grafo de fluxo para acompanhar tudo que nasceu de uma autenticacao, API key, checkout ou transacao."
  wide
>
  {#snippet actions()}
    <button class="ghost" type="button" onclick={loadDiagnostics}><RefreshCw size={15} /> Atualizar</button>
  {/snippet}

  <div class="metrics">
    <MetricPanel label="Requests" value={stats?.totalRequests ?? total} tone="cyan" caption="Janela filtrada">
      {#snippet icon()}<Activity size={16} />{/snippet}
    </MetricPanel>
    <MetricPanel label="Erros" value={stats?.totalErrors ?? items.filter((item) => item.hasError).length} tone="danger" />
    <MetricPanel label="Error rate" value={errorRate} tone="warning" />
    <MetricPanel label="Flow atual" value={activeFlowId ? 'aberto' : 'vazio'} tone="magenta" />
  </div>

  <ActionToolbar>
    <label><span>Metodo</span><select bind:value={filters.method}><option value="">Todos</option><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option></select></label>
    <label><span>Status</span><input bind:value={filters.statusCode} inputmode="numeric" placeholder="500" /></label>
    <label><span>Path</span><input bind:value={filters.path} placeholder="/api/v1/..." /></label>
    <label><span>Trace</span><input bind:value={filters.traceId} placeholder="traceId" /></label>
    <label><span>Flow</span><input bind:value={filters.flowId} placeholder="flowId" /></label>
    <label><span>Merchant</span><input bind:value={filters.merchantId} /></label>
    <label><span>Erro</span><select bind:value={filters.hasError}><option value="">Todos</option><option value="true">Com erro</option><option value="false">Sem erro</option></select></label>
    <button class="primary" type="button" onclick={loadDiagnostics}><Search size={15} /> Filtrar</button>
  </ActionToolbar>

  {#if error}<div class="notice notice--error">{error}</div>{/if}
  {#if message}<div class="notice notice--success">{message}</div>{/if}

  <section class="flow-search">
    <div>
      <p>Empacotamento de fluxo</p>
      <h2>Abra um flowId e veja a cadeia completa</h2>
      <span>Use o flowId do header X-Flow-Id, de um log selecionado ou de uma sessao autenticada.</span>
    </div>
    <label>
      <span>Flow ID</span>
      <input bind:value={flowInput} placeholder="cole um flowId ou traceId" />
    </label>
    <button class="primary" type="button" onclick={() => loadFlow(flowInput)} disabled={flowLoading}>
      <GitBranch size={15} /> {flowLoading ? 'Montando...' : 'Abrir grafo'}
    </button>
  </section>

  <div class="workspace">
    <section class="logs-panel">
      <header class="panel-head">
        <div>
          <p>Eventos recentes</p>
          <h2>{total} logs encontrados</h2>
        </div>
        <span>{avgMs} media</span>
      </header>

      {#if loading}
        <div class="empty">Carregando logs...</div>
      {:else if items.length === 0}
        <div class="empty">Nenhum log encontrado.</div>
      {:else}
        <div class="table">
          <div class="row head">
            <span>Flow</span>
            <span>Metodo</span>
            <span>Path</span>
            <span>Status</span>
            <span>Duracao</span>
            <span>Data</span>
          </div>
          {#each items as item}
            <button
              class="row"
              class:row--active={selected?.id === item.id}
              type="button"
              onclick={() => loadDetail(item)}
            >
              <span class="mono">{item.flowId ?? item.traceId ?? item.id}</span>
              <span>{item.method ?? '-'}</span>
              <span class="path">{item.path ?? '-'}</span>
              <span class={statusClass(item.statusCode)}>{item.statusCode}</span>
              <span>{item.durationMs}ms</span>
              <span>{formatDate(item.createdAt)}</span>
            </button>
          {/each}
        </div>
      {/if}
    </section>

    <aside class="details">
      <section class="purge">
        <p>Purge</p>
        <div class="purge-row">
          <input bind:value={purgeDays} inputmode="numeric" aria-label="Dias de retencao" />
          <input bind:value={purgeConfirm} placeholder="Digite PURGE" aria-label="Confirmacao de purge" />
          <button class="danger-action" type="button" onclick={purgeLogs} disabled={!canPurge || purgeConfirm !== 'PURGE' || purging}>
            <Trash2 size={14} /> {purging ? 'Purgando...' : 'Purgar'}
          </button>
        </div>
      </section>

      {#if detailLoading}
        <div class="empty">Carregando detalhe...</div>
      {:else if selected}
        <header class="detail-head">
          <div>
            <p>Log detail</p>
            <h2>{selected.method} {selected.path}</h2>
          </div>
          {#if selected.traceId}<CopyButton value={selected.traceId} label="Trace" />{/if}
        </header>

        <div class="kv-grid">
          <div><span>Status</span><strong class={statusClass(selected.statusCode)}>{selected.statusCode}</strong></div>
          <div><span>Duracao</span><strong>{selected.durationMs}ms</strong></div>
          <div><span>Flow</span><strong>{selected.flowId ?? '-'}</strong></div>
          <div><span>Auth</span><strong>{selected.authResourceType ?? '-'} {selected.authResourceId ?? ''}</strong></div>
          <div><span>IP</span><strong>{selected.clientIp ?? '-'}</strong></div>
          <div><span>User</span><strong>{selected.userId ?? selected.merchantId ?? '-'}</strong></div>
        </div>

        <div class="detail-actions">
          <button class="ghost" type="button" onclick={() => loadTrace(selected?.traceId)}>Ver trace HTTP</button>
          <button class="primary" type="button" onclick={() => loadFlow(resolveFlowId(selected))}>Abrir fluxo</button>
        </div>

        {#if traceItems.length > 0}
          <section class="trace-list">
            <p>Trace HTTP</p>
            {#each traceItems as item}
              <div>
                <strong>{item.method} {item.path}</strong>
                <span>{item.statusCode} / {item.durationMs}ms / {formatDate(item.createdAt)}</span>
              </div>
            {/each}
          </section>
        {/if}

        <JsonPanel title="Request/response" value={selected} />
      {:else}
        <div class="empty">Selecione um log para ver request, response, auth resource e flow.</div>
      {/if}
    </aside>
  </div>

  <div class="flow-layout">
    <FlowGraphPanel graph={flowGraph} loading={flowLoading} bind:selectedNodeId={selectedFlowNodeId} />
    <aside class="flow-side">
      <FlowNodeInspector graph={flowGraph} selectedNodeId={selectedFlowNodeId} />
      <FlowResourceTimeline resources={flowGraph?.resources ?? []} />
    </aside>
  </div>
</PageShell>

<style>
  .metrics,
  .workspace,
  .flow-layout,
  .kv-grid {
    display: grid;
    gap: 14px;
  }

  .metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 16px;
  }

  .flow-search {
    display: grid;
    grid-template-columns: minmax(240px, 1fr) minmax(280px, 460px) auto;
    gap: 14px;
    align-items: end;
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid rgba(1, 250, 251, 0.12);
    border-radius: 18px;
    background:
      linear-gradient(135deg, rgba(1, 250, 251, 0.07), transparent 46%),
      var(--color-surface);
  }

  .flow-search h2,
  .flow-search p,
  .flow-search span,
  .panel-head h2,
  .panel-head p,
  .details p,
  .purge p,
  .trace-list p,
  .kv-grid span {
    margin: 0;
  }

  .flow-search h2,
  .panel-head h2,
  .detail-head h2 {
    font-size: 1.03rem;
  }

  .flow-search > div > span {
    display: block;
    margin-top: 6px;
    color: var(--color-foreground-secondary);
    font-size: 0.86rem;
  }

  .workspace {
    grid-template-columns: minmax(0, 1fr) 470px;
    align-items: start;
    margin-bottom: 16px;
  }

  .flow-layout {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
  }

  .flow-side {
    display: grid;
    gap: 14px;
  }

  button,
  input,
  select {
    font: inherit;
  }

  .primary,
  .ghost,
  .danger-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 12px;
    border-radius: 11px;
    font-weight: 750;
    cursor: pointer;
    transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
  }

  .primary:active,
  .ghost:active,
  .danger-action:active {
    transform: translateY(1px) scale(0.99);
  }

  .primary {
    border: 1px solid rgba(255, 0, 255, 0.32);
    color: var(--color-foreground);
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.18), rgba(1, 250, 251, 0.08));
  }

  .ghost {
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--color-foreground-secondary);
    background: rgba(255, 255, 255, 0.035);
  }

  .danger-action {
    border: 1px solid rgba(255, 59, 92, 0.2);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.07);
  }

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  label {
    display: grid;
    gap: 7px;
  }

  label span,
  .flow-search p,
  .panel-head p,
  .details p,
  .purge p,
  .trace-list p,
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

  input:focus,
  select:focus {
    border-color: rgba(1, 250, 251, 0.32);
  }

  .logs-panel,
  .details {
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
  }

  .logs-panel {
    overflow-x: auto;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.065);
  }

  .panel-head > span {
    color: var(--color-brand-cyan);
    font-family: var(--font-mono);
    font-size: 0.72rem;
  }

  .table {
    min-width: 1040px;
  }

  .row {
    width: 100%;
    display: grid;
    grid-template-columns: 1.25fr 0.5fr 1.45fr 0.5fr 0.6fr 0.85fr;
    gap: 12px;
    align-items: center;
    padding: 13px 15px;
    border: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.065);
    background: transparent;
    color: var(--color-foreground);
    text-align: left;
  }

  button.row {
    cursor: pointer;
  }

  button.row:hover,
  .row--active {
    background: rgba(1, 250, 251, 0.045);
  }

  .head {
    color: var(--color-foreground-secondary);
    background: #0a0a0f;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .mono,
  .path {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }

  .success-text {
    color: var(--color-success);
  }

  .warning-text {
    color: var(--color-warning);
  }

  .danger-text {
    color: var(--color-danger);
  }

  .details {
    position: sticky;
    top: 86px;
    display: grid;
    gap: 14px;
    padding: 16px;
  }

  .detail-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .detail-head h2 {
    margin: 4px 0 0;
    word-break: break-word;
  }

  .detail-actions {
    display: flex;
    gap: 9px;
    flex-wrap: wrap;
  }

  .kv-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kv-grid div,
  .trace-list div,
  .purge {
    padding: 11px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    background: #08080d;
  }

  .kv-grid strong {
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }

  .purge {
    display: grid;
    gap: 10px;
  }

  .purge-row {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) auto;
    gap: 8px;
  }

  .trace-list {
    display: grid;
    gap: 8px;
  }

  .trace-list div {
    display: grid;
    gap: 4px;
  }

  .trace-list span {
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

  .notice--success {
    border: 1px solid rgba(0, 230, 118, 0.2);
    color: var(--color-success);
    background: rgba(0, 230, 118, 0.08);
  }

  @media (max-width: 1240px) {
    .workspace,
    .flow-layout {
      grid-template-columns: 1fr;
    }

    .details {
      position: static;
    }
  }

  @media (max-width: 860px) {
    .metrics,
    .flow-search {
      grid-template-columns: 1fr;
    }

    .purge-row,
    .kv-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
