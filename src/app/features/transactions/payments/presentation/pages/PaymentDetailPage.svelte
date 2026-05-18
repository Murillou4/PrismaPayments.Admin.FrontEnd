<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { ArrowLeft, ServerCrash } from 'lucide-svelte';
  import { createPaymentDetailController } from '../controllers/paymentDetailController.svelte';
  import PaymentMethodCard from '../components/PaymentMethodCard.svelte';
  import Breadcrumbs from '$appmod/shared/widgets/Breadcrumbs.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import { formatCurrency, formatDate, formatShortId } from '$appmod/shared/utils/formatters';

  interface Props {
    paymentId: string;
  }

  let { paymentId }: Props = $props();

  // paymentId is a stable route param — controller created once per page mount
  const ctrl = untrack(() => createPaymentDetailController(paymentId));

  const METHOD_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    PIX:         { color: '#01FAFB', bg: 'rgba(1,250,251,0.10)',  border: 'rgba(1,250,251,0.20)' },
    BOLETO:      { color: '#FFB300', bg: 'rgba(255,179,0,0.10)',  border: 'rgba(255,179,0,0.20)' },
    CREDIT_CARD: { color: '#FF00FF', bg: 'rgba(255,0,255,0.10)',  border: 'rgba(255,0,255,0.20)' },
    DEBIT_CARD:  { color: '#9B59B6', bg: 'rgba(155,89,182,0.10)', border: 'rgba(155,89,182,0.20)' },
  };

  const METHOD_LABELS: Record<string, string> = {
    PIX: 'PIX',
    BOLETO: 'Boleto',
    CREDIT_CARD: 'Credito',
    DEBIT_CARD: 'Debito',
  };

  onMount(() => {
    ctrl.loadPayment();
  });
</script>

<div
  class="payment-detail-page"
  style="padding: 48px 24px; max-width: 900px; margin: 0 auto;"
>
  <!-- Breadcrumbs + Title -->
  <div style="margin-bottom: 24px;">
    <Breadcrumbs
      segments={[
        { label: 'Transacoes', href: '/transactions/payments' },
        { label: 'Pagamentos', href: '/transactions/payments' },
        { label: `#${formatShortId(paymentId)}` },
      ]}
    />
  </div>

  {#if ctrl.state.loading}
    <!-- Skeleton loading state -->
    <div style="display: flex; flex-direction: column; gap: 32px;">
      {#each [1, 2, 3] as _}
        <div
          style="
            background: var(--color-surface, #0F0F18);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid var(--color-border, rgba(255,255,255,0.08));
            box-shadow: var(--shadow-md);
          "
        >
          <div
            style="
              height: 16px;
              width: 160px;
              background: rgba(255,255,255,0.07);
              border-radius: 6px;
              margin-bottom: 20px;
              animation: skeleton-pulse 1.5s ease-in-out infinite;
            "
          ></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px;">
            {#each [1, 2, 3, 4, 5, 6] as __}
              <div>
                <div
                  style="
                    height: 12px;
                    width: 80px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    margin-bottom: 6px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                  "
                ></div>
                <div
                  style="
                    height: 14px;
                    width: 120px;
                    background: rgba(255,255,255,0.07);
                    border-radius: 4px;
                    animation: skeleton-pulse 1.5s ease-in-out infinite;
                  "
                ></div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

  {:else if ctrl.state.error}
    <!-- Error state -->
    <div
      style="
        background: var(--color-surface, #0F0F18);
        padding: 48px 24px;
        border-radius: 16px;
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        box-shadow: var(--shadow-md);
        text-align: center;
      "
    >
      <ServerCrash size={40} style="color: var(--color-foreground-secondary, #9090A8); margin-bottom: 16px;" />
      <p
        style="
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: var(--color-foreground-secondary, #9090A8);
          margin: 0 0 16px;
        "
      >
        Nao foi possivel carregar os detalhes. Volte para a lista e tente novamente.
      </p>
      <a
        href="/transactions/payments"
        style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: var(--color-brand-cyan, #01FAFB);
          text-decoration: none;
        "
      >
        <ArrowLeft size={14} />
        Voltar para Pagamentos
      </a>
    </div>

  {:else if ctrl.state.payment}
    {@const payment = ctrl.state.payment}
    {@const methodColors = METHOD_COLORS[payment.method] ?? { color: '#9090A8', bg: 'rgba(144,144,168,0.10)', border: 'rgba(144,144,168,0.20)' }}

    <div style="display: flex; flex-direction: column; gap: 32px;">

      <!-- Card 1: Informacoes Gerais -->
      <div
        style="
          background: var(--color-surface, #0F0F18);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--color-border, rgba(255,255,255,0.08));
          box-shadow: var(--shadow-md);
        "
      >
        <h3
          style="
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            font-weight: 400;
            color: var(--color-foreground, #F6F6FF);
            margin: 0 0 20px;
          "
        >
          Informacoes Gerais
        </h3>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px;">

          <!-- Status -->
          <div>
            <span class="field-label">Status</span>
            <div style="margin-top: 4px;">
              <StatusBadge status={payment.status} />
            </div>
          </div>

          <!-- Metodo -->
          <div>
            <span class="field-label">Metodo</span>
            <div style="margin-top: 4px;">
              <span
                style="
                  display: inline-block;
                  padding: 2px 10px;
                  border-radius: 9999px;
                  font-family: 'Outfit', sans-serif;
                  font-size: 0.75rem;
                  font-weight: 400;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  color: {methodColors.color};
                  background: {methodColors.bg};
                  border: 1px solid {methodColors.border};
                "
              >
                {METHOD_LABELS[payment.method] ?? payment.method}
              </span>
            </div>
          </div>

          <!-- Valor -->
          <div>
            <span class="field-label">Valor</span>
            <span class="field-value" style="font-variant-numeric: tabular-nums;">
              {formatCurrency(payment.amount)}
            </span>
          </div>

          <!-- Taxa -->
          <div>
            <span class="field-label">Taxa</span>
            <span class="field-value" style="font-variant-numeric: tabular-nums;">
              {formatCurrency(payment.feeAmount)}
            </span>
          </div>

          <!-- Liquido -->
          <div>
            <span class="field-label">Liquido</span>
            <span class="field-value" style="font-variant-numeric: tabular-nums;">
              {formatCurrency(payment.netAmount)}
            </span>
          </div>

          <!-- Merchant -->
          <div>
            <span class="field-label">Merchant</span>
            <a
              href="/merchants/{payment.merchantId}"
              class="field-value"
              style="color: var(--color-brand-cyan, #01FAFB); text-decoration: none; display: block; margin-top: 4px;"
            >
              {formatShortId(payment.merchantId)}
            </a>
          </div>

          <!-- Descricao -->
          {#if payment.description}
            <div>
              <span class="field-label">Descricao</span>
              <span class="field-value">{payment.description}</span>
            </div>
          {/if}

          <!-- Ambiente -->
          <div>
            <span class="field-label">Ambiente</span>
            <span class="field-value">
              {payment.isTest ? 'Teste' : 'Producao'}
            </span>
          </div>

          <!-- Criado em -->
          <div>
            <span class="field-label">Criado em</span>
            <span class="field-value">{formatDate(payment.createdAt)}</span>
          </div>

          <!-- Pago em (conditional) -->
          {#if payment.paidAt}
            <div>
              <span class="field-label">Pago em</span>
              <span class="field-value">{formatDate(payment.paidAt)}</span>
            </div>
          {/if}

          <!-- Falhou em (conditional) -->
          {#if payment.failedAt}
            <div>
              <span class="field-label">Falhou em</span>
              <span class="field-value">{formatDate(payment.failedAt)}</span>
            </div>
            {#if payment.failureReason}
              <div>
                <span class="field-label">Motivo da falha</span>
                <span class="field-value">{payment.failureReason}</span>
              </div>
            {/if}
          {/if}

          <!-- Expira em (conditional) -->
          {#if payment.expiresAt}
            <div>
              <span class="field-label">Expira em</span>
              <span class="field-value">{formatDate(payment.expiresAt)}</span>
            </div>
          {/if}

        </div>
      </div>

      <!-- Card 2: Detalhes do Metodo (conditional) -->
      {#if payment.pix || payment.boleto || payment.card}
        <PaymentMethodCard {payment} />
      {/if}

      <!-- Card 3: Pagador (conditional) -->
      {#if payment.payer}
        <div
          style="
            background: var(--color-surface, #0F0F18);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid var(--color-border, rgba(255,255,255,0.08));
            box-shadow: var(--shadow-md);
          "
        >
          <h3
            style="
              font-family: 'Outfit', sans-serif;
              font-size: 1rem;
              font-weight: 400;
              color: var(--color-foreground, #F6F6FF);
              margin: 0 0 20px;
            "
          >
            Pagador
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px;">
            <div>
              <span class="field-label">Nome</span>
              <span class="field-value">{payment.payer.name}</span>
            </div>
            <div>
              <span class="field-label">Documento</span>
              <span class="field-value">{payment.payer.maskedDocument}</span>
            </div>
            <div>
              <span class="field-label">Email</span>
              <span class="field-value">{payment.payer.email ?? '—'}</span>
            </div>
            <div>
              <span class="field-label">Telefone</span>
              <span class="field-value">{payment.payer.phone ?? '—'}</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- Card 4: Metadata (conditional) -->
      {#if payment.metadata && Object.keys(payment.metadata).length > 0}
        <div
          style="
            background: var(--color-surface, #0F0F18);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid var(--color-border, rgba(255,255,255,0.08));
            box-shadow: var(--shadow-md);
          "
        >
          <h3
            style="
              font-family: 'Outfit', sans-serif;
              font-size: 1rem;
              font-weight: 400;
              color: var(--color-foreground, #F6F6FF);
              margin: 0 0 20px;
            "
          >
            Metadata
          </h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            {#each Object.entries(payment.metadata) as [key, value]}
              <div style="display: flex; gap: 8px; align-items: baseline;">
                <span
                  style="
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.875rem;
                    color: var(--color-foreground-secondary, #9090A8);
                    min-width: 120px;
                    flex-shrink: 0;
                  "
                >
                  {key}:
                </span>
                <span
                  style="
                    font-family: 'Outfit', monospace;
                    font-size: 0.875rem;
                    color: var(--color-foreground, #F6F6FF);
                    word-break: break-all;
                  "
                >
                  {value}
                </span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

    </div>
  {/if}
</div>

<style>
  .payment-detail-page {
    animation: page-enter 0.2s ease-out;
  }

  @keyframes page-enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  :global(.field-label) {
    font-family: 'Outfit', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-foreground-secondary, #9090A8);
    display: block;
    margin-bottom: 4px;
  }

  :global(.field-value) {
    font-family: 'Outfit', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-foreground, #F6F6FF);
    display: block;
  }
</style>
