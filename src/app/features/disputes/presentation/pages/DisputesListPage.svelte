<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { ColumnDef, Row } from '@tanstack/table-core';
  import { ServerCrash, RefreshCw } from 'lucide-svelte';
  import { createDisputeListController } from '../controllers/disputeListController.svelte';
  import DataTable from '$appmod/shared/widgets/DataTable.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import SelectFilter from '$appmod/shared/widgets/filters/SelectFilter.svelte';
  import MerchantAutocomplete from '$appmod/features/transactions/shared/components/MerchantAutocomplete.svelte';
  import Breadcrumbs from '$appmod/shared/widgets/Breadcrumbs.svelte';
  import { Button } from '$lib/components/ui/button';
  import { formatCurrency, formatDate } from '$appmod/shared/utils/formatters';
  import type { Dispute } from '$appmod/features/disputes/domain/entities/Dispute';

  let { role }: { role: string | null } = $props();
  const ctrl = createDisputeListController();

  // D-02: Status options
  const STATUS_OPTIONS = [
    { value: 'OPEN',         label: 'Aberta' },
    { value: 'UNDER_REVIEW', label: 'Em Análise' },
    { value: 'ACCEPTED',     label: 'Aceita' },
    { value: 'REJECTED',     label: 'Rejeitada' },
    { value: 'RESOLVED',     label: 'Resolvida' },
  ];

  // D-02: Type options
  const TYPE_OPTIONS = [
    { value: 'MED',            label: 'MED' },
    { value: 'CHARGEBACK',     label: 'Chargeback' },
    { value: 'REFUND_REQUEST', label: 'Solicitação de Reembolso' },
  ];

  // D-04: Columns
  const columns: ColumnDef<Dispute, unknown>[] = [
    { id: 'id',          header: 'ID',            accessorKey: 'id' },
    { id: 'merchantId',  header: 'Merchant',      accessorKey: 'merchantId' },
    { id: 'disputeType', header: 'Tipo',          accessorKey: 'disputeType' },
    { id: 'status',      header: 'Status',        accessorKey: 'status' },
    { id: 'amount',      header: 'Valor',         accessorKey: 'amount' },
    { id: 'openedAt',    header: 'Data Abertura', accessorKey: 'openedAt' },
  ];

  // D-05/D-06: MED row highlight via rowClass
  function getRowClass(row: Row<Dispute>): string {
    return row.original.disputeType === 'MED' ? 'dispute-row--med' : '';
  }

  const hasActiveFilters = $derived(
    ctrl.state.status !== '' ||
    ctrl.state.disputeType !== '' ||
    ctrl.state.merchantId !== ''
  );

  function clearFilters() {
    ctrl.setStatus('');
    ctrl.setType('');
    ctrl.setMerchant('');
  }

  onMount(() => ctrl.loadDisputes());
</script>

<div style="padding: 48px 24px; max-width: 1200px; margin: 0 auto;">
  <!-- Breadcrumbs -->
  <div style="margin-bottom: 24px;">
    <Breadcrumbs segments={[{ label: 'Disputas' }]} />
  </div>

  <!-- D-01: Filter bar always visible -->
  <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; margin-bottom: 24px;">
    <SelectFilter
      placeholder="Status"
      options={STATUS_OPTIONS}
      value={ctrl.state.status}
      onChange={(v) => ctrl.setStatus(v as typeof ctrl.state.status)}
    />
    <SelectFilter
      placeholder="Tipo"
      options={TYPE_OPTIONS}
      value={ctrl.state.disputeType}
      onChange={(v) => ctrl.setType(v as typeof ctrl.state.disputeType)}
    />
    <!-- D-03: MerchantAutocomplete optional filter -->
    <MerchantAutocomplete
      value={ctrl.state.merchantId}
      onChange={(id) => ctrl.setMerchant(id)}
    />
    {#if hasActiveFilters}
      <button
        onclick={clearFilters}
        style="font-size: 0.875rem; color: #01FAFB; background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline;"
      >
        Limpar filtros
      </button>
    {/if}
  </div>

  {#if ctrl.state.error}
    <!-- Error state -->
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 64px 24px; background: var(--color-surface, #0F0F18); border-radius: 16px; border: 1px solid var(--color-border, rgba(255,255,255,0.08));">
      <ServerCrash size={40} style="color: #FF3B5C;" />
      <p style="color: var(--color-foreground, #F6F6FF); font-size: 1rem; margin: 0;">
        Erro ao carregar disputas. Verifique sua conexão e tente novamente.
      </p>
      <Button variant="outline" onclick={() => ctrl.loadDisputes()}>
        <RefreshCw size={16} style="margin-right: 8px;" />
        Tentar novamente
      </Button>
    </div>
  {:else}
    <DataTable
      {columns}
      data={ctrl.state.disputes}
      loading={ctrl.state.loading}
      rowClass={getRowClass}
      onRowClick={(row) => goto(`/disputes/${row.original.id}`)}
    >
      {#snippet cellSnippet({ row, columnId })}
        {#if columnId === 'id'}
          <span style="font-family: var(--font-mono); font-size: 0.8125rem; color: var(--color-foreground-secondary, #9090A8);">
            #{row.original.id.substring(0, 8)}
          </span>
        {:else if columnId === 'merchantId'}
          <a
            href="/merchants/{row.original.merchantId}"
            onclick={(e) => e.stopPropagation()}
            style="color: #01FAFB; text-decoration: none; font-size: 0.875rem;"
            onmouseenter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onmouseleave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            {row.original.merchantId.substring(0, 8)}...
          </a>
        {:else if columnId === 'disputeType'}
          <StatusBadge status={row.original.disputeType} />
        {:else if columnId === 'status'}
          <StatusBadge status={row.original.status} />
        {:else if columnId === 'amount'}
          {formatCurrency(row.original.amount)}
        {:else if columnId === 'openedAt'}
          {formatDate(row.original.openedAt)}
        {:else}
          {String(row.getValue(columnId) ?? '')}
        {/if}
      {/snippet}
    </DataTable>

    <!-- Server-side pagination (total comes from API) -->
    {#if ctrl.state.total > ctrl.state.limit}
      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px;">
        <Button
          variant="outline"
          disabled={ctrl.state.page === 1}
          onclick={() => ctrl.setPage(ctrl.state.page - 1)}
        >
          Anterior
        </Button>
        <span style="font-size: 0.875rem; color: var(--color-foreground-secondary, #9090A8);">
          Página {ctrl.state.page} · {ctrl.state.total} resultados
        </span>
        <Button
          variant="outline"
          disabled={ctrl.state.page * ctrl.state.limit >= ctrl.state.total}
          onclick={() => ctrl.setPage(ctrl.state.page + 1)}
        >
          Próxima
        </Button>
      </div>
    {/if}
  {/if}
</div>

<style>
  /* D-05/D-06: MED row border-left highlight — row background unchanged */
  :global(.dispute-row--med) {
    border-left: 3px solid #FF3B5C !important;
    animation: med-row-pulse 1.5s ease-in-out infinite;
  }

  @keyframes -global-med-row-pulse {
    0%, 100% { border-left-color: rgba(255, 59, 92, 0.60); }
    50%       { border-left-color: rgba(255, 59, 92, 1.00); }
  }
</style>
