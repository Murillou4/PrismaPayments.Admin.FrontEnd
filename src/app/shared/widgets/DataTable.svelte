<script lang="ts" generics="T">
  import {
    createTable,
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
    type Row
  } from '@tanstack/table-core';
  import { browser } from '$app/environment';
  import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-svelte';
  import * as Table from '$lib/components/ui/table/index.js';
  import Pagination from './Pagination.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    columns: ColumnDef<T, unknown>[];
    data: T[];
    pageSize?: number;
    loading?: boolean;
    cellSnippet?: Snippet<[{ row: Row<T>; columnId: string }]>;
    onRowClick?: (row: Row<T>) => void;
    rowClass?: (row: Row<T>) => string;
  }

  let {
    columns,
    data,
    pageSize = 20,
    loading = false,
    cellSnippet,
    onRowClick,
    rowClass
  }: Props = $props();

  let sorting = $state<SortingState>([]);
  let currentPage = $state(1);

  const totalPages = $derived(Math.max(1, Math.ceil(data.length / pageSize)));

  $effect(() => {
    void data.length;
    currentPage = 1;
  });

  const table = $derived(
    createTable({
      data,
      columns,
      state: {
        sorting,
        pagination: {
          pageIndex: currentPage - 1,
          pageSize
        },
        columnPinning: { left: [], right: [] },
        columnVisibility: {}
      },
      onSortingChange: (updater) => {
        sorting = typeof updater === 'function' ? updater(sorting) : updater;
      },
      onStateChange: () => {},
      renderFallbackValue: null,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      manualPagination: false
    })
  );

  const visibleRows = $derived(
    table.getRowModel().rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  const SKELETON_COUNT = 5;
</script>

{#if browser}
  <div class="data-table">
    <div class="data-table__scroller">
      <Table.Root class="data-table__root">
        <Table.Header>
          {#each table.getHeaderGroups() as headerGroup}
            <Table.Row class="data-table__head-row">
              {#each headerGroup.headers as header}
                <Table.Head
                  onclick={header.column.getToggleSortingHandler()}
                  class={`data-table__head ${header.column.getCanSort() ? 'data-table__head--sortable' : ''}`}
                >
                  <div class="data-table__head-label">
                    {#if typeof header.column.columnDef.header === 'string'}
                      {header.column.columnDef.header}
                    {/if}
                    {#if header.column.getCanSort()}
                      {#if header.column.getIsSorted() === 'asc'}
                        <ChevronUp
                          size={15}
                          strokeWidth={1.5}
                          class="data-table__sort data-table__sort--active"
                        />
                      {:else if header.column.getIsSorted() === 'desc'}
                        <ChevronDown
                          size={15}
                          strokeWidth={1.5}
                          class="data-table__sort data-table__sort--active"
                        />
                      {:else}
                        <ChevronsUpDown size={15} strokeWidth={1.5} class="data-table__sort" />
                      {/if}
                    {/if}
                  </div>
                </Table.Head>
              {/each}
            </Table.Row>
          {/each}
        </Table.Header>

        <Table.Body>
          {#if loading}
            {#each Array(SKELETON_COUNT) as _, i}
              <Table.Row>
                {#each columns as _col}
                  <Table.Cell class="data-table__cell">
                    <div
                      class="data-table__skeleton"
                      style="width: {60 + ((i * 13) % 30)}%;"
                    ></div>
                  </Table.Cell>
                {/each}
              </Table.Row>
            {/each}
          {:else if data.length === 0}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="data-table__empty">
                <p class="data-table__empty-title">Nenhum resultado</p>
                <p class="data-table__empty-subtitle">
                  Não há dados para exibir com os filtros aplicados.
                </p>
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each visibleRows as row}
              <Table.Row
                class={`data-table__row ${onRowClick ? 'data-table__row--clickable' : ''} ${rowClass?.(row) ?? ''}`}
                onclick={() => onRowClick?.(row)}
              >
                {#each row.getVisibleCells() as cell}
                  <Table.Cell class="data-table__cell">
                    {#if cellSnippet}
                      {@render cellSnippet({ row, columnId: cell.column.id })}
                    {:else}
                      {String(cell.getValue() ?? '')}
                    {/if}
                  </Table.Cell>
                {/each}
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </div>

    {#if !loading && data.length > 0}
      <Pagination {currentPage} {totalPages} onPageChange={(p) => (currentPage = p)} />
    {/if}
  </div>
{/if}

<style>
  .data-table {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
    box-shadow: var(--shadow-md);
  }

  .data-table::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(1, 250, 251, 0.34),
      rgba(255, 0, 255, 0.18),
      transparent
    );
    pointer-events: none;
  }

  .data-table__scroller {
    overflow-x: auto;
  }

  :global(.data-table__root) {
    width: 100%;
  }

  :global(.data-table__head-row) {
    border-bottom: 1px solid var(--color-border-subtle);
    background: rgba(255, 255, 255, 0.026);
  }

  :global(.data-table__head) {
    height: 40px;
    padding: 0 14px;
    color: var(--color-foreground-disabled);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 760;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    user-select: none;
  }

  :global(.data-table__head--sortable) {
    cursor: pointer;
  }

  .data-table__head-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  :global(.data-table__sort) {
    color: var(--color-foreground-disabled);
  }

  :global(.data-table__sort--active) {
    color: var(--color-brand-cyan);
  }

  :global(.data-table__row) {
    border-bottom: 1px solid var(--color-border-subtle);
    transition:
      background 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.data-table__row:hover) {
    background: rgba(255, 255, 255, 0.03);
  }

  :global(.data-table__row--clickable) {
    cursor: pointer;
  }

  :global(.data-table__cell) {
    padding: 10px 14px;
    color: var(--color-foreground);
    font-size: 0.8rem;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  :global(.data-table__empty) {
    padding: 42px 24px;
    text-align: center;
  }

  .data-table__empty-title {
    margin: 0 0 6px;
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: 0.95rem;
    font-weight: 720;
  }

  .data-table__empty-subtitle {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-size: 0.82rem;
  }

  .data-table__skeleton {
    height: 14px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.045) 0%,
      rgba(1, 250, 251, 0.11) 40%,
      rgba(255, 255, 255, 0.045) 80%
    );
    background-size: 200% 100%;
    animation: skeleton-pulse 1.45s ease-in-out infinite;
  }

  @keyframes skeleton-pulse {
    0% {
      background-position: 0% 50%;
      opacity: 0.45;
    }
    50% {
      opacity: 0.86;
    }
    100% {
      background-position: -200% 50%;
      opacity: 0.45;
    }
  }
</style>
