<script lang="ts">
  import { goto } from '$app/navigation';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import type { WebhookFailureItem } from '../../domain/entities/AdminDashboardResponse';

  type Props = {
    items: WebhookFailureItem[];
    loading: boolean;
    maxRows?: number;
  };

  let { items, loading, maxRows = 8 }: Props = $props();

  const rows = $derived(items.slice(0, maxRows));

  function shortId(id: string): string {
    if (id.length <= 10) return id;
    return `${id.slice(0, 8)}…`;
  }
</script>

<div class="panel anim">
  <div class="panel-accent" aria-hidden="true"></div>
  <div class="panel-head">
    <p class="sec-label">Webhooks com falha</p>
    <button type="button" class="link-all" onclick={() => goto('/diagnostics')}>Diagnóstico</button>
  </div>
  {#if loading}
    <div class="sk-table">
      {#each [1, 2, 3, 4, 5] as _}
        <div class="sk-row"></div>
      {/each}
    </div>
  {:else if rows.length === 0}
    <p class="empty">Nenhum registro recente</p>
  {:else}
    <div class="table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th>Evento</th>
            <th>HTTP</th>
            <th>Merchant</th>
            <th>Quando</th>
          </tr>
        </thead>
        <tbody>
          {#each rows as w (w.id)}
            <tr>
              <td class="evt">{w.eventType}</td>
              <td class="http" class:bad={w.responseStatus >= 400}>{w.responseStatus}</td>
              <td class="mono dim" title={w.merchantId}>{shortId(w.merchantId)}</td>
              <td class="mono">{formatDate(w.createdAt)}</td>
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
    background: linear-gradient(90deg, transparent, rgba(1, 250, 251, 0.35), transparent);
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
  .evt {
    color: #f6f6ff;
    font-weight: 500;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .http {
    font-variant-numeric: tabular-nums;
    color: #00e676;
    font-weight: 600;
  }
  .http.bad {
    color: #ff3b5c;
  }
  .mono {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .dim {
    color: #3a3a50;
    max-width: 100px;
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
    animation: enter 0.38s cubic-bezier(0.22, 1, 0.36, 1) 200ms both;
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
