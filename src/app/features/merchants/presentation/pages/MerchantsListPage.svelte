<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { ColumnDef, Row } from '@tanstack/table-core';
  import { Store, ServerCrash, SearchX, Plus, RefreshCw } from 'lucide-svelte';
  import { createMerchantListController } from '../controllers/merchantListController.svelte';
  import DataTable from '$appmod/shared/widgets/DataTable.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import SearchInput from '$appmod/shared/widgets/filters/SearchInput.svelte';
  import SelectFilter from '$appmod/shared/widgets/filters/SelectFilter.svelte';
  import { Button } from '$lib/components/ui/button';
  import { formatDate, formatDocument } from '$appmod/shared/utils/formatters';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import type { MerchantStatus, MerchantListItem } from '$appmod/features/merchants/domain/entities/Merchant';
  import CreateMerchantSheet from '../components/CreateMerchantSheet.svelte';

  let { role }: { role: string | null } = $props();

  const ctrl = createMerchantListController();

  let showCreateSheet = $state(false);

  const STATUS_TABS: { key: MerchantStatus | 'ALL'; label: string }[] = [
    { key: 'ALL',       label: 'Todos' },
    { key: 'PENDING',   label: 'Pendente' },
    { key: 'ACTIVE',    label: 'Ativo' },
    { key: 'SUSPENDED', label: 'Suspenso' },
    { key: 'BLOCKED',   label: 'Bloqueado' }
  ];

  const VERIFICATION_OPTIONS = [
    { value: 'ALL',            label: 'Todas verificações' },
    { value: 'UNVERIFIED',     label: 'Não verificado' },
    { value: 'PENDING_REVIEW', label: 'Pendente revisão' },
    { value: 'VERIFIED',       label: 'Verificado' },
    { value: 'REJECTED',       label: 'Rejeitado' }
  ];

  const columns: ColumnDef<MerchantListItem, unknown>[] = [
    { id: 'legalName',          header: 'Razão Social',   accessorKey: 'legalName' },
    { id: 'documentNumber',     header: 'Documento',      accessorKey: 'documentNumber' },
    { id: 'email',              header: 'E-mail',         accessorKey: 'email' },
    { id: 'status',             header: 'Status',         accessorKey: 'status' },
    { id: 'verificationStatus', header: 'Verificação',    accessorKey: 'verificationStatus' },
    { id: 'createdAt',          header: 'Cadastro',       accessorKey: 'createdAt' }
  ];

  const isAdmin = $derived(hasPermission(role as AdminRole, 'ADMIN'));

  const tableData = $derived(
    ctrl.state.merchants.map(m => ({
      ...m,
      documentNumber: formatDocument(m.documentNumber, m.documentType),
      createdAt: formatDate(m.createdAt)
    }))
  );

  // Detecta se há filtros ativos (para diferenciar empty states)
  const hasActiveFilters = $derived(
    ctrl.state.search.trim() !== '' ||
    ctrl.state.verification !== 'ALL' ||
    ctrl.state.status !== 'ALL'
  );

  onMount(() => {
    const verif = $page.url.searchParams.get('verification');
    if (verif) {
      // Seta sem disparar loadMerchants ainda — loadAll vai cuidar disso
      ctrl.state.verification = verif as any;
    }
    ctrl.loadAll();
  });

  function handleRowClick(row: Row<MerchantListItem>) {
    goto(`/merchants/${row.original.id}`);
  }

  function clearFilters() {
    ctrl.resetFilters();
  }
</script>

<div class="page">
  <!-- Header -->
  <div class="page-header">
    <div class="header-left">
      <h1 class="page-title">Merchants</h1>
      <p class="page-subtitle">Gestão de estabelecimentos</p>
    </div>
    {#if isAdmin}
      <button class="btn-new" onclick={() => (showCreateSheet = true)}>
        <Plus size={16} strokeWidth={2} />
        Novo Merchant
      </button>
    {/if}
  </div>

  <!-- Tabs de status -->
  <div class="status-tabs">
    {#each STATUS_TABS as tab}
      <button
        type="button"
        class="status-tab"
        class:active={ctrl.state.status === tab.key}
        onclick={() => ctrl.setStatus(tab.key)}
      >
        {tab.label}
        {#if tab.key === 'ALL'}
          <span class="tab-count">{ctrl.state.total}</span>
        {:else if ctrl.state.counts[tab.key] !== undefined}
          <span class="tab-count">{ctrl.state.counts[tab.key]}</span>
        {/if}
      </button>
    {/each}
  </div>

  <!-- Filtros -->
  <div class="filters">
    <SearchInput
      value={ctrl.state.search}
      placeholder="Buscar por nome, documento, email..."
      onSearch={(v: string) => ctrl.setSearch(v)}
    />
    <SelectFilter
      value={ctrl.state.verification}
      options={VERIFICATION_OPTIONS}
      onChange={(v: string) => ctrl.setVerification(v as any)}
    />
  </div>

  <!-- Conteúdo principal -->
  {#if ctrl.state.loading}
    <!-- Skeleton -->
    <div class="skeleton-wrap">
      <div class="skeleton-header">
        {#each columns as _}
          <div class="skeleton-cell skeleton-cell--head"></div>
        {/each}
      </div>
      {#each Array(7) as _}
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
      <p class="state-title">Não foi possível carregar os merchants</p>
      <p class="state-desc">{ctrl.state.error}</p>
      <button class="btn-retry" onclick={() => ctrl.loadMerchants()}>
        <RefreshCw size={14} strokeWidth={2} />
        Tentar novamente
      </button>
    </div>

  {:else if ctrl.state.merchants.length === 0}
    <!-- Empty state -->
    <div class="state-wrapper">
      {#if hasActiveFilters}
        <div class="state-icon state-icon--neutral">
          <SearchX size={32} strokeWidth={1.5} />
        </div>
        <p class="state-title">Nenhum merchant encontrado</p>
        <p class="state-desc">Não há resultados para os filtros aplicados.</p>
        <button class="btn-retry" onclick={clearFilters}>
          Limpar filtros
        </button>
      {:else}
        <div class="state-icon state-icon--brand">
          <Store size={32} strokeWidth={1.5} />
        </div>
        <p class="state-title">Nenhum merchant cadastrado</p>
        <p class="state-desc">
          Quando um estabelecimento for criado, ele aparecerá aqui.
        </p>
        {#if isAdmin}
          <button class="btn-new btn-new--centered" onclick={() => (showCreateSheet = true)}>
            <Plus size={16} strokeWidth={2} />
            Criar primeiro merchant
          </button>
        {/if}
      {/if}
    </div>

  {:else}
    <!-- Tabela -->
    <DataTable
      {columns}
      data={tableData}
      pageSize={ctrl.state.limit}
      cellSnippet={cellRenderer}
      onRowClick={handleRowClick}
    />

    <!-- Paginação server-side -->
    {#if ctrl.state.total > ctrl.state.limit}
      <div class="pagination">
        <Button
          variant="outline"
          disabled={ctrl.state.page === 1}
          onclick={() => ctrl.setPage(ctrl.state.page - 1)}
        >Anterior</Button>
        <span class="page-info">
          Página {ctrl.state.page} · {ctrl.state.total} resultados
        </span>
        <Button
          variant="outline"
          disabled={ctrl.state.page * ctrl.state.limit >= ctrl.state.total}
          onclick={() => ctrl.setPage(ctrl.state.page + 1)}
        >Próxima</Button>
      </div>
    {/if}
  {/if}
</div>

<CreateMerchantSheet
  bind:open={showCreateSheet}
  onCreated={() => ctrl.loadMerchants()}
/>

{#snippet cellRenderer({ row, columnId }: { row: Row<MerchantListItem>; columnId: string })}
  {#if columnId === 'status'}
    <StatusBadge status={row.original.status} />
  {:else if columnId === 'verificationStatus'}
    <StatusBadge status={row.original.verificationStatus} />
  {:else}
    {String((row.original as unknown as Record<string, unknown>)[columnId] ?? '—')}
  {/if}
{/snippet}

<style>
  /* ── Layout base ───────────────────────────────── */
  .page {
    padding: 32px 36px;
    max-width: 1200px;
    margin: 0 auto;
    animation: page-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
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
    margin-bottom: 28px;
  }
  .page-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #F6F6FF;
    margin: 0 0 4px;
    text-transform: uppercase;
  }
  .page-subtitle {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9090A8;
    margin: 0;
  }

  /* ── Botão novo ────────────────────────────────── */
  .btn-new {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255, 0, 255, 0.35);
    background: linear-gradient(135deg, #0A0A0F 0%, #18111A 100%);
    color: #F6F6FF;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
    box-shadow: 0 0 0 0 transparent;
  }
  .btn-new:hover {
    border-color: rgba(255, 0, 255, 0.65);
    box-shadow: 0 0 16px rgba(255, 0, 255, 0.18);
    transform: translateY(-1px);
  }
  .btn-new--centered {
    margin-top: 8px;
  }

  /* ── Tabs de status ────────────────────────────── */
  .status-tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }
  .status-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 14px;
    border: none;
    background: transparent;
    color: #9090A8;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    margin-bottom: -1px;
  }
  .status-tab:hover {
    color: #F6F6FF;
  }
  .status-tab.active {
    color: #01FAFB;
    border-bottom-color: #01FAFB;
  }
  .tab-count {
    background: rgba(1, 250, 251, 0.08);
    color: #01FAFB;
    border: 1px solid rgba(1, 250, 251, 0.18);
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    min-width: 20px;
    text-align: center;
  }

  /* ── Filtros ───────────────────────────────────── */
  .filters {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    align-items: center;
  }

  /* ── Skeleton ──────────────────────────────────── */
  .skeleton-wrap {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
    background: #0F0F18;
  }
  .skeleton-header {
    display: flex;
    gap: 16px;
    padding: 12px 16px;
    background: #0A0A0F;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }
  .skeleton-row {
    display: flex;
    gap: 16px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .skeleton-row:last-child {
    border-bottom: none;
  }
  .skeleton-cell {
    height: 14px;
    border-radius: 6px;
    background: #141420;
    width: 60%;
    animation: sk-pulse 1.6s ease-in-out infinite;
  }
  .skeleton-cell--head {
    height: 11px;
    width: 80px;
    opacity: 0.6;
  }
  @keyframes sk-pulse {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 0.70; }
  }

  /* ── Empty / Error states ──────────────────────── */
  .state-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 72px 24px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    background: #0F0F18;
    text-align: center;
    gap: 0;
  }
  .state-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
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
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #F6F6FF;
    margin: 0 0 8px;
    letter-spacing: 0.01em;
  }
  .state-desc {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: #9090A8;
    margin: 0 0 20px;
    max-width: 340px;
    line-height: 1.6;
  }
  .btn-retry {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    color: #F6F6FF;
    font-family: 'Outfit', sans-serif;
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

  /* ── Paginação ─────────────────────────────────── */
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
  }
  .page-info {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #9090A8;
    letter-spacing: 0.02em;
  }
</style>
