<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { ColumnDef, Row } from '@tanstack/table-core';
  import { CreditCard, ServerCrash, SearchX, RefreshCw } from 'lucide-svelte';
  import { createPaymentListController } from '../controllers/paymentListController.svelte';
  import DataTable from '$appmod/shared/widgets/DataTable.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import SelectFilter from '$appmod/shared/widgets/filters/SelectFilter.svelte';
  import MerchantAutocomplete from '$appmod/features/transactions/shared/components/MerchantAutocomplete.svelte';
  import DateRangePicker from '$appmod/shared/widgets/filters/DateRangePicker.svelte';
  import { Button } from '$lib/components/ui/button';
  import { formatCurrency, formatDate, formatShortId } from '$appmod/shared/utils/formatters';
  import type { Payment } from '$appmod/features/transactions/payments/domain/entities/Payment';

  const ctrl = createPaymentListController();

  const STATUS_OPTIONS = [
    { value: 'CREATED',   label: 'Criado' },
    { value: 'PENDING',   label: 'Pendente' },
    { value: 'PAID',      label: 'Pago' },
    { value: 'FAILED',    label: 'Falhou' },
    { value: 'CANCELLED', label: 'Cancelado' },
    { value: 'REFUNDED',  label: 'Estornado' },
    { value: 'EXPIRED',   label: 'Expirado' },
  ];

  const METHOD_OPTIONS = [
    { value: 'PIX',         label: 'PIX' },
    { value: 'BOLETO',      label: 'Boleto' },
    { value: 'CREDIT_CARD', label: 'Cartao de Credito' },
    { value: 'DEBIT_CARD',  label: 'Cartao de Debito' },
  ];

  const METHOD_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    PIX:         { color: '#01FAFB', bg: 'rgba(1,250,251,0.10)',  border: 'rgba(1,250,251,0.20)' },
    BOLETO:      { color: '#FFB300', bg: 'rgba(255,179,0,0.10)',  border: 'rgba(255,179,0,0.20)' },
    CREDIT_CARD: { color: '#FF00FF', bg: 'rgba(255,0,255,0.10)',  border: 'rgba(255,0,255,0.20)' },
    DEBIT_CARD:  { color: '#9B59B6', bg: 'rgba(155,89,182,0.10)', border: 'rgba(155,89,182,0.20)' },
  };

  const columns: ColumnDef<Payment, unknown>[] = [
    { id: 'id',         header: 'ID',       accessorKey: 'id' },
    { id: 'merchantId', header: 'Merchant', accessorKey: 'merchantId' },
    { id: 'method',     header: 'Metodo',   accessorKey: 'method' },
    { id: 'status',     header: 'Status',   accessorKey: 'status' },
    { id: 'amount',     header: 'Valor',    accessorKey: 'amount' },
    { id: 'feeAmount',  header: 'Taxa',     accessorKey: 'feeAmount' },
    { id: 'netAmount',  header: 'Liquido',  accessorKey: 'netAmount' },
    { id: 'createdAt',  header: 'Data',     accessorKey: 'createdAt' },
  ];

  // D-19: client-side date filter applied after API response
  const tableData = $derived(() => {
    let data = ctrl.state.payments ?? [];
    if (ctrl.state.dateStart && ctrl.state.dateEnd) {
      const start = new Date(ctrl.state.dateStart).getTime();
      const end   = new Date(ctrl.state.dateEnd).getTime() + 86400000; // include end day
      data = data.filter(p => {
        const t = new Date(p.createdAt).getTime();
        return t >= start && t < end;
      });
    }
    return data;
  });

  const hasActiveFilters = $derived(
    ctrl.state.merchantId !== '' ||
    ctrl.state.status !== '' ||
    ctrl.state.method !== '' ||
    ctrl.state.dateStart !== null
  );

  onMount(() => {
    const merchantIdParam = $page.url.searchParams.get('merchantId');
    if (merchantIdParam) {
      ctrl.state.merchantId = merchantIdParam;
    }
    ctrl.loadPayments();
  });

  function handleRowClick(row: Row<Payment>) {
    if (row.original.id) goto(`/transactions/payments/${row.original.id}`);
  }
</script>

<div class="page">
  <!-- Header -->
  <div class="page-header">
    <div class="header-left">
      <h1 class="page-title">Pagamentos</h1>
      <p class="page-subtitle">Transacoes cross-merchant</p>
    </div>
  </div>

  <!-- Filtros — sempre visiveis acima da tabela (D-02) -->
  <div class="filters">
    <MerchantAutocomplete value={ctrl.state.merchantId} onChange={(id) => ctrl.setMerchant(id)} />
    <SelectFilter
      value={ctrl.state.status}
      options={STATUS_OPTIONS}
      placeholder="Status"
      onChange={(v) => ctrl.setStatus(v as any)}
    />
    <SelectFilter
      value={ctrl.state.method}
      options={METHOD_OPTIONS}
      placeholder="Metodo"
      onChange={(v) => ctrl.setMethod(v as any)}
    />
    <DateRangePicker
      startDate={ctrl.state.dateStart}
      endDate={ctrl.state.dateEnd}
      onChange={(s, e) => ctrl.setDateRange(s, e)}
    />
  </div>

  <!-- Conteudo principal -->
  {#if ctrl.state.loading}
    <!-- Skeleton -->
    <div class="skeleton-wrap">
      <div class="skeleton-header">
        {#each columns as _}
          <div class="skeleton-cell skeleton-cell--head"></div>
        {/each}
      </div>
      {#each Array(5) as _}
        <div class="skeleton-row">
          {#each columns as _, i}
            <div class="skeleton-cell" style="width: {55 + (i * 17 % 35)}%"></div>
          {/each}
        </div>
      {/each}
    </div>

  {:else if ctrl.state.error}
    <!-- Error state -->
    <div class="state-wrapper">
      <div class="state-icon state-icon--error">
        <ServerCrash size={32} strokeWidth={1.5} />
      </div>
      <p class="state-title">Erro ao carregar dados</p>
      <p class="state-desc">Erro ao carregar dados. Verifique sua conexao e tente novamente.</p>
      <button class="btn-retry" onclick={() => ctrl.loadPayments()}>
        <RefreshCw size={14} strokeWidth={2} />
        Tentar novamente
      </button>
    </div>

  {:else if tableData().length === 0}
    <!-- Empty state -->
    <div class="state-wrapper">
      {#if hasActiveFilters}
        <div class="state-icon state-icon--neutral">
          <SearchX size={32} strokeWidth={1.5} />
        </div>
        <p class="state-title">Nenhum pagamento encontrado</p>
        <p class="state-desc">Ajuste os filtros acima ou aguarde novas transacoes.</p>
      {:else}
        <div class="state-icon state-icon--brand">
          <CreditCard size={32} strokeWidth={1.5} />
        </div>
        <p class="state-title">Nenhum pagamento encontrado</p>
        <p class="state-desc">Quando houver transacoes, elas aparecerão aqui.</p>
      {/if}
    </div>

  {:else}
    <!-- Tabela -->
    <DataTable
      {columns}
      data={tableData()}
      pageSize={ctrl.state.limit}
      cellSnippet={cellRenderer}
      onRowClick={handleRowClick}
    />

    <!-- Paginacao server-side -->
    {#if ctrl.state.total > ctrl.state.limit}
      <div class="pagination">
        <Button
          variant="outline"
          disabled={ctrl.state.page === 1}
          onclick={() => ctrl.setPage(ctrl.state.page - 1)}
        >Anterior</Button>
        <span class="page-info">
          Pagina {ctrl.state.page} · {ctrl.state.total} resultados
        </span>
        <Button
          variant="outline"
          disabled={ctrl.state.page * ctrl.state.limit >= ctrl.state.total}
          onclick={() => ctrl.setPage(ctrl.state.page + 1)}
        >Proxima</Button>
      </div>
    {/if}
  {/if}
</div>

{#snippet cellRenderer({ row, columnId }: { row: Row<Payment>; columnId: string })}
  {#if columnId === 'id'}
    <a
      href="/transactions/payments/{row.original.id}"
      style="color: var(--color-brand-cyan, #01FAFB); text-decoration: none; font-variant-numeric: tabular-nums;"
      onclick={(e) => e.stopPropagation()}
    >
      {formatShortId(row.original.id)}
    </a>
  {:else if columnId === 'merchantId'}
    <a
      href="/merchants/{row.original.merchantId}"
      style="color: var(--color-brand-cyan, #01FAFB); text-decoration: none;"
      onclick={(e) => e.stopPropagation()}
    >
      {formatShortId(row.original.merchantId)}
    </a>
  {:else if columnId === 'method'}
    {@const mc = METHOD_COLORS[row.original.method] ?? { color: '#9090A8', bg: 'rgba(144,144,168,0.10)', border: 'rgba(144,144,168,0.20)' }}
    <span style="color: {mc.color}; background: {mc.bg}; border: 1px solid {mc.border}; border-radius: 9999px; padding: 4px 10px; font-size: 0.75rem; white-space: nowrap;">
      {row.original.method ?? '-'}
    </span>
  {:else if columnId === 'status'}
    <StatusBadge status={row.original.status} />
  {:else if columnId === 'amount' || columnId === 'feeAmount' || columnId === 'netAmount'}
    <span style="font-variant-numeric: tabular-nums;">
      {formatCurrency((row.original as unknown as Record<string, number>)[columnId])}
    </span>
  {:else if columnId === 'createdAt'}
    {formatDate(row.original.createdAt)}
  {:else}
    {String((row.original as unknown as Record<string, unknown>)[columnId] ?? '—')}
  {/if}
{/snippet}

<style>
  /* ── Layout base ─────────────────────────────── */
  .page {
    padding: 20px 24px 46px;
    max-width: 1320px;
    margin: 0 auto;
    box-sizing: border-box;
    animation: page-enter 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes page-enter {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Header ────────────────────────────────────── */
  .page-header {
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
  .page-title {
    font-family: var(--font-display);
    font-size: clamp(1.26rem, 2vw, 1.72rem);
    font-weight: 820;
    letter-spacing: 0;
    color: var(--color-foreground);
    margin: 0 0 4px;
  }
  .page-subtitle {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--color-foreground-secondary);
    margin: 0;
  }

  /* ── Filtros ───────────────────────────────────── */
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    align-items: flex-end;
    padding: 9px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.036), rgba(255, 255, 255, 0.01)),
      rgba(255, 255, 255, 0.014);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
  }

  /* ── Skeleton ──────────────────────────────────── */
  .skeleton-wrap {
    border: 1px solid var(--color-border);
    border-radius: 20px;
    overflow: hidden;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
    box-shadow: var(--shadow-md);
  }
  .skeleton-header {
    display: flex;
    gap: 16px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.025);
    border-bottom: 1px solid var(--color-border-subtle);
  }
  .skeleton-row {
    display: flex;
    gap: 16px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--color-border-subtle);
  }
  .skeleton-row:last-child { border-bottom: none; }
  .skeleton-cell {
    height: 14px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.045),
      rgba(1, 250, 251, 0.11),
      rgba(255, 255, 255, 0.045)
    );
    background-size: 200% 100%;
    width: 60%;
    animation: sk-pulse 1.45s ease-in-out infinite;
  }
  .skeleton-cell--head {
    height: 11px;
    width: 80px;
    opacity: 0.6;
  }
  @keyframes sk-pulse {
    0% { background-position: 0% 50%; opacity: 0.45; }
    50% { opacity: 0.84; }
    100% { background-position: -200% 50%; opacity: 0.45; }
  }

  /* ── Empty / Error states ──────────────────────── */
  .state-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 46px 24px;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background:
      radial-gradient(circle at 50% 0%, rgba(1, 250, 251, 0.06), transparent 34%),
      linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
    box-shadow: var(--shadow-md);
    text-align: center;
    gap: 0;
  }
  .state-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .state-icon--brand {
    background: rgba(1, 250, 251, 0.07);
    border: 1px solid rgba(1, 250, 251, 0.15);
    color: #01FAFB;
  }
  .state-icon--neutral {
    background: rgba(144, 144, 168, 0.07);
    border: 1px solid rgba(144, 144, 168, 0.15);
    color: #9090A8;
  }
  .state-icon--error {
    background: rgba(255, 59, 92, 0.07);
    border: 1px solid rgba(255, 59, 92, 0.18);
    color: #FF3B5C;
  }
  .state-title {
    font-family: var(--font-display);
    font-size: 0.96rem;
    font-weight: 740;
    color: var(--color-foreground);
    margin: 0 0 8px;
    letter-spacing: 0.01em;
  }
  .state-desc {
    font-size: 13px;
    color: var(--color-foreground-secondary);
    margin: 0 0 20px;
    max-width: 340px;
    line-height: 1.6;
  }
  .btn-retry {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: #F6F6FF;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, transform 0.15s;
  }
  .btn-retry:hover {
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.07);
    transform: translateY(-1px);
  }

  /* ── Paginacao ─────────────────────────────────── */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 20px;
    padding: 10px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.014);
  }
  .page-info {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-foreground-secondary);
    letter-spacing: 0.02em;
  }
</style>
