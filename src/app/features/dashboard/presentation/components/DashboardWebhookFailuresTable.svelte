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
    return `${id.slice(0, 8)}...`;
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
    min-width: 0;
    padding: 16px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.042), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
    box-shadow: var(--shadow-md);
  }

  .panel-accent {
    position: absolute;
    inset: 0 auto 0 0;
    width: 2px;
    background: linear-gradient(
      180deg,
      var(--color-brand-cyan),
      rgba(1, 250, 251, 0.11),
      transparent
    );
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .sec-label {
    flex: 1;
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 760;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .link-all {
    padding: 5px 9px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.026);
    color: var(--color-brand-cyan);
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 760;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition:
      transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .link-all:hover {
    transform: translateY(-1px);
    border-color: rgba(1, 250, 251, 0.26);
    background: rgba(1, 250, 251, 0.055);
  }

  .link-all:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(1, 250, 251, 0.14);
  }

  .table-wrap {
    overflow-x: auto;
  }

  .data {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
  }

  .data th {
    padding: 8px 10px 9px 0;
    border-bottom: 1px solid var(--color-border-subtle);
    color: var(--color-foreground-disabled);
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 760;
    letter-spacing: 0.1em;
    text-align: left;
    text-transform: uppercase;
  }

  .data td {
    padding: 10px 10px 10px 0;
    border-bottom: 1px solid var(--color-border-subtle);
    color: var(--color-foreground-secondary);
    vertical-align: middle;
  }

  .data tbody tr {
    transition: background 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .data tbody tr:hover {
    background: rgba(255, 255, 255, 0.026);
  }

  .data tr:last-child td {
    border-bottom: none;
  }

  .evt {
    max-width: 180px;
    overflow: hidden;
    color: var(--color-foreground);
    font-weight: 680;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .http {
    color: var(--color-success);
    font-family: var(--font-mono);
    font-weight: 720;
    font-variant-numeric: tabular-nums;
  }

  .http.bad {
    color: var(--color-danger);
  }

  .mono {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .dim {
    max-width: 100px;
    color: var(--color-foreground-disabled);
  }

  .empty {
    margin: 0;
    padding: 18px;
    border: 1px dashed var(--color-border-subtle);
    border-radius: 14px;
    color: var(--color-foreground-secondary);
    font-size: 0.82rem;
    text-align: center;
  }

  .sk-table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sk-row {
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.045),
      rgba(1, 250, 251, 0.1),
      rgba(255, 255, 255, 0.045)
    );
    background-size: 200% 100%;
    animation: pulse 1.45s ease-in-out infinite;
  }

  @keyframes pulse {
    0% {
      background-position: 0% 50%;
      opacity: 0.45;
    }
    50% {
      opacity: 0.84;
    }
    100% {
      background-position: -200% 50%;
      opacity: 0.45;
    }
  }

  .anim {
    animation: enter 0.38s cubic-bezier(0.16, 1, 0.3, 1) 200ms both;
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
