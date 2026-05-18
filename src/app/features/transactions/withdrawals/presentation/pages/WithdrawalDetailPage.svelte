<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { ServerCrash } from 'lucide-svelte';
  import { createWithdrawalDetailController } from '../controllers/withdrawalDetailController.svelte';
  import Breadcrumbs from '$appmod/shared/widgets/Breadcrumbs.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import { formatCurrency, formatDate, formatShortId } from '$appmod/shared/utils/formatters';

  interface Props {
    withdrawalId: string;
  }
  let { withdrawalId }: Props = $props();

  const ctrl = untrack(() => createWithdrawalDetailController(withdrawalId));

  onMount(() => {
    ctrl.loadWithdrawal();
  });
</script>

<div class="page">
  <!-- Breadcrumbs + title -->
  <div class="page-header">
    <Breadcrumbs segments={[
      { label: 'Transacoes', href: '/transactions/withdrawals' },
      { label: 'Saques', href: '/transactions/withdrawals' },
      { label: `#${formatShortId(withdrawalId)}` }
    ]} />
  </div>

  {#if ctrl.state.loading}
    <!-- Skeleton — 2 cards -->
    <div class="skeleton-cards">
      {#each Array(2) as _}
        <div class="card skeleton-card">
          <div class="skeleton-title"></div>
          {#each Array(6) as _}
            <div class="skeleton-row-item">
              <div class="skeleton-label"></div>
              <div class="skeleton-value"></div>
            </div>
          {/each}
        </div>
      {/each}
    </div>

  {:else if ctrl.state.error}
    <!-- Error state -->
    <div class="error-state">
      <div class="error-icon">
        <ServerCrash size={32} strokeWidth={1.5} />
      </div>
      <p class="error-title">Nao foi possivel carregar os detalhes</p>
      <p class="error-desc">Volte para a lista e tente novamente.</p>
      <a href="/transactions/withdrawals" class="btn-back">Voltar para saques</a>
    </div>

  {:else if ctrl.state.withdrawal}
    {@const w = ctrl.state.withdrawal}

    <!-- Card 1: Informacoes Gerais -->
    <div class="card">
      <h2 class="card-title">Informacoes Gerais</h2>
      <div class="field-grid">
        <div class="field">
          <span class="field-label">Status</span>
          <span class="field-value"><StatusBadge status={w.status} /></span>
        </div>
        <div class="field">
          <span class="field-label">Merchant</span>
          <span class="field-value">
            <a href="/merchants/{w.merchantId}" class="link-merchant">
              {formatShortId(w.merchantId)}
            </a>
          </span>
        </div>
        <div class="field">
          <span class="field-label">Valor bruto</span>
          <span class="field-value field-value--mono" style="font-variant-numeric: tabular-nums;">{formatCurrency(w.amount)}</span>
        </div>
        <div class="field">
          <span class="field-label">Taxa</span>
          <span class="field-value field-value--mono" style="font-variant-numeric: tabular-nums;">{formatCurrency(w.feeAmount)}</span>
        </div>
        <div class="field">
          <span class="field-label">Valor liquido</span>
          <span class="field-value field-value--mono" style="font-variant-numeric: tabular-nums; color: #00E676;">{formatCurrency(w.netAmount)}</span>
        </div>
        <div class="field">
          <span class="field-label">Moeda</span>
          <span class="field-value">{w.currency}</span>
        </div>
        <div class="field">
          <span class="field-label">Provedor</span>
          <span class="field-value">{w.providerName ?? '—'}</span>
        </div>
        <div class="field">
          <span class="field-label">ID externo</span>
          <span class="field-value field-value--mono">{w.externalId ?? '—'}</span>
        </div>
        <div class="field">
          <span class="field-label">Criado em</span>
          <span class="field-value">{formatDate(w.createdAt)}</span>
        </div>
        {#if w.completedAt}
          <div class="field">
            <span class="field-label">Concluido em</span>
            <span class="field-value">{formatDate(w.completedAt)}</span>
          </div>
        {/if}
        {#if w.failedAt}
          <div class="field">
            <span class="field-label">Falhou em</span>
            <span class="field-value field-value--error">{formatDate(w.failedAt)}</span>
          </div>
          {#if w.failureReason}
            <div class="field field--full">
              <span class="field-label">Motivo da falha</span>
              <span class="field-value field-value--error">{w.failureReason}</span>
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <!-- Card 2: Destinatario -->
    <div class="card">
      <h2 class="card-title">Destinatario</h2>
      <div class="field-grid">
        <div class="field">
          <span class="field-label">Chave PIX</span>
          <span class="field-value field-value--mono">{w.recipient?.pixKey || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Tipo da chave</span>
          <span class="field-value">{w.recipient?.pixKeyType || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Nome</span>
          <span class="field-value">{w.recipient?.name || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Documento</span>
          <span class="field-value field-value--mono">{w.recipient?.documentNumber || '-'}</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* ── Layout ──────────────────────────────────── */
  .page {
    padding: 48px 24px;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
    animation: page-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes page-enter {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .page-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ── Cards ───────────────────────────────────── */
  .card {
    background: var(--color-surface, #0F0F18);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.24);
  }
  .card-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #F6F6FF;
    margin: 0 0 20px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    opacity: 0.85;
  }

  /* ── Field grid ──────────────────────────────── */
  .field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px 24px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .field--full {
    grid-column: 1 / -1;
  }
  .field-label {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9090A8;
  }
  .field-value {
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    color: #F6F6FF;
    font-weight: 400;
  }
  .field-value--mono {
    font-family: 'Outfit', monospace;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }
  .field-value--error {
    color: #FF3B5C;
  }

  /* ── Merchant link ───────────────────────────── */
  .link-merchant {
    color: var(--color-brand-cyan, #01FAFB);
    text-decoration: none;
    font-variant-numeric: tabular-nums;
    transition: opacity 0.15s;
  }
  .link-merchant:hover {
    opacity: 0.75;
    text-decoration: underline;
  }

  /* ── Error state ─────────────────────────────── */
  .error-state {
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
  .error-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    background: rgba(255, 59, 92, 0.07);
    border: 1px solid rgba(255, 59, 92, 0.18);
    color: #FF3B5C;
  }
  .error-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: #F6F6FF;
    margin: 0 0 8px;
  }
  .error-desc {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: #9090A8;
    margin: 0 0 20px;
    max-width: 340px;
  }
  .btn-back {
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
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .btn-back:hover {
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.07);
  }

  /* ── Skeleton ────────────────────────────────── */
  .skeleton-cards {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .skeleton-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .skeleton-title {
    height: 16px;
    width: 140px;
    border-radius: 6px;
    background: #141420;
    animation: sk-pulse 1.6s ease-in-out infinite;
    margin-bottom: 4px;
  }
  .skeleton-row-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .skeleton-label {
    height: 10px;
    width: 80px;
    border-radius: 4px;
    background: #141420;
    animation: sk-pulse 1.6s ease-in-out infinite;
    opacity: 0.5;
  }
  .skeleton-value {
    height: 14px;
    width: 160px;
    border-radius: 4px;
    background: #141420;
    animation: sk-pulse 1.6s ease-in-out infinite;
  }
  @keyframes sk-pulse {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 0.70; }
  }
</style>
