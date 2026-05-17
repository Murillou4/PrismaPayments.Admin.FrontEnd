<script lang="ts">
  import { goto } from '$app/navigation';
  import { formatCurrency, formatDate } from '$appmod/shared/utils/formatters';
  import type { DisputeItem } from '../../domain/entities/AdminDashboardResponse';

  type Props = {
    items: DisputeItem[];
    loading: boolean;
    maxRows?: number;
  };

  let { items, loading, maxRows = 6 }: Props = $props();

  const rows = $derived(items.slice(0, maxRows));

  function shortId(id: string): string {
    if (id.length <= 10) return id;
    return `${id.slice(0, 8)}…`;
  }
</script>

<div class="panel anim">
  <div class="panel-accent" aria-hidden="true"></div>
  <div class="panel-head">
    <p class="sec-label">Disputas recentes</p>
    <button type="button" class="link-all" onclick={() => goto('/disputes')}>Ver todas</button>
  </div>
  {#if loading}
    <div class="sk-table">
      {#each [1, 2, 3, 4] as _}
        <div class="sk-row"></div>
      {/each}
    </div>
  {:else if rows.length === 0}
    <p class="empty">Nenhuma disputa na lista</p>
  {:else}
    <div class="table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th>Aberta em</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Merchant</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as d (d.id)}
            <tr>
              <td class="mono">{formatDate(d.openedAt)}</td>
              <td class="num">{formatCurrency(d.amount)}</td>
              <td><span class="pill">{d.status}</span></td>
              <td class="mono dim" title={d.merchantId}>{shortId(d.merchantId)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .panel {
    position: relative;
    background: #0f0f18;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    min-width: 0;
    overflow: hidden;
  }
  .panel-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255, 59, 92, 0.35), transparent);
  }
  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .sec-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9090a8;
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #1e1e2e;
    flex: 1;
  }
  .link-all {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #01fafb;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 0;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .link-all:hover {
    text-decoration: underline;
  }
  .link-all:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #ff00ff;
    border-radius: 4px;
  }
  .table-wrap {
    overflow-x: auto;
  }
  .data {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
    font-family: 'Outfit', sans-serif;
  }
  .data th {
    text-align: left;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #3a3a50;
    padding: 8px 10px 10px 0;
    border-bottom: 1px solid #1e1e2e;
  }
  .data td {
    padding: 10px 10px 10px 0;
    border-bottom: 1px solid #1e1e2e;
    color: #9090a8;
    vertical-align: middle;
  }
  .data tr:last-child td {
    border-bottom: none;
  }
  .mono {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .num {
    color: #f6f6ff;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .dim {
    color: #3a3a50;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .pill {
    display: inline-block;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 9999px;
    background: rgba(255, 59, 92, 0.1);
    color: #ff3b5c;
    border: 1px solid rgba(255, 59, 92, 0.22);
  }
  .empty {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #3a3a50;
    margin: 12px 0 0;
  }
  .sk-table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .sk-row {
    height: 36px;
    background: #141420;
    border-radius: 8px;
    animation: pulse 1.6s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.35;
    }
    50% {
      opacity: 0.65;
    }
  }
  .anim {
    animation: enter 0.38s cubic-bezier(0.22, 1, 0.36, 1) 180ms both;
  }
  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
