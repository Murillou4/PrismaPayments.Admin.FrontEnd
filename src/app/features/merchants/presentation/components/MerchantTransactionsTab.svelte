<script lang="ts">
  import { formatCurrency, formatDate } from '$appmod/shared/utils/formatters';

  // Shape básico de transação — a feature completa de transações é fase futura
  interface RecentTransaction {
    id: string;
    type: string;
    amount: number;    // em centavos
    status: string;
    createdAt: string;
  }

  let {
    merchantId,
    transactions
  }: {
    merchantId: string;
    transactions: RecentTransaction[];
  } = $props();

  // Mapa de tipos para labels legíveis
  const TYPE_LABELS: Record<string, string> = {
    PAYMENT:    'Pagamento',
    WITHDRAWAL: 'Saque',
    REFUND:     'Estorno',
    FEE:        'Taxa'
  };

  // Status color map
  function statusColor(status: string): string {
    const map: Record<string, string> = {
      COMPLETED:  'rgba(80, 200, 120, 0.75)',
      PENDING:    'rgba(218, 168, 80, 0.75)',
      FAILED:     'rgba(255, 59, 92, 0.75)',
      PROCESSING: 'rgba(1, 250, 251, 0.65)',
      CANCELLED:  'rgba(218, 212, 196, 0.30)'
    };
    return map[status] ?? 'rgba(218, 212, 196, 0.45)';
  }
</script>

<div class="txns-tab">
  {#if transactions.length === 0}
    <div class="empty-state">
      <p class="empty-text">Nenhuma transação recente encontrada.</p>
    </div>
  {:else}
    <div class="txns-list">
      {#each transactions as txn (txn.id)}
        <div class="txn-row">
          <div class="txn-type">{TYPE_LABELS[txn.type] ?? txn.type}</div>
          <div class="txn-amount">{formatCurrency(txn.amount)}</div>
          <div class="txn-status" style="color: {statusColor(txn.status)}">{txn.status}</div>
          <div class="txn-date">{formatDate(txn.createdAt)}</div>
          <div class="txn-id">{txn.id.substring(0, 8)}...</div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="txns-footer">
    <a
      href="/transactions/payments?merchantId={merchantId}"
      class="link-all"
    >
      Ver todas as transações deste merchant →
    </a>
  </div>
</div>

<style>
  .txns-tab { display: flex; flex-direction: column; gap: 16px; }

  .empty-state { padding: 40px; text-align: center; }
  .empty-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(218, 212, 196, 0.30);
  }

  .txns-list { display: flex; flex-direction: column; gap: 2px; }

  .txn-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 4px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
    align-items: center;
    transition: background 0.15s;
  }
  .txn-row:hover { background: rgba(255,255,255,0.04); }

  .txn-type {
    font-size: 12px;
    color: rgba(218, 212, 196, 0.75);
    font-weight: 500;
  }
  .txn-amount {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(218, 212, 196, 0.80);
    font-weight: 600;
  }
  .txn-status {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
  }
  .txn-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(218, 212, 196, 0.35);
  }
  .txn-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(218, 212, 196, 0.25);
  }

  .txns-footer {
    display: flex;
    justify-content: center;
    padding-top: 4px;
  }
  .link-all {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--color-brand-cyan, #01FAFB);
    text-decoration: none;
    letter-spacing: 0.06em;
    transition: opacity 0.18s;
  }
  .link-all:hover { opacity: 0.75; text-decoration: underline; }
</style>
