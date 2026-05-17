<script lang="ts">
  import { Copy } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import type { Payment } from '../../domain/entities/Payment';

  interface Props {
    payment: Payment;
  }

  let { payment }: Props = $props();

  async function copyPixCode() {
    if (payment.pix?.qrCode) {
      await navigator.clipboard.writeText(payment.pix.qrCode);
      toast.success('Codigo PIX copiado');
    }
  }
</script>

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
      margin: 0 0 16px;
    "
  >
    Detalhes do Metodo
  </h3>

  {#if payment.method === 'PIX' && payment.pix}
    <p
      style="
        font-family: 'Outfit', sans-serif;
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--color-foreground-secondary, #9090A8);
        margin: 0 0 8px;
      "
    >
      PIX
    </p>

    <div style="margin-bottom: 8px;">
      <span
        style="
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: var(--color-foreground-secondary, #9090A8);
          display: block;
          margin-bottom: 6px;
        "
      >
        Codigo PIX
      </span>
      <div style="display: flex; align-items: flex-start; gap: 8px;">
        <code
          style="
            display: block;
            background: rgba(255,255,255,0.04);
            padding: 12px;
            border-radius: 8px;
            font-family: 'Outfit', monospace;
            font-size: 0.875rem;
            color: var(--color-foreground, #F6F6FF);
            overflow-x: auto;
            white-space: nowrap;
            flex: 1;
            word-break: break-all;
          "
        >{payment.pix.qrCode}</code>
        <button
          onclick={copyPixCode}
          style="
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px;
            color: var(--color-foreground, #F6F6FF);
            font-family: 'Outfit', sans-serif;
            font-size: 0.75rem;
            cursor: pointer;
            white-space: nowrap;
            flex-shrink: 0;
            transition: background 0.15s;
          "
          onmouseenter={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.10)'}
          onmouseleave={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'}
        >
          <Copy size={14} />
          Copiar
        </button>
      </div>
    </div>

  {:else if payment.method === 'BOLETO' && payment.boleto}
    <p
      style="
        font-family: 'Outfit', sans-serif;
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--color-foreground-secondary, #9090A8);
        margin: 0 0 12px;
      "
    >
      Boleto
    </p>

    <div style="margin-bottom: 12px;">
      <span
        style="
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: var(--color-foreground-secondary, #9090A8);
          display: block;
          margin-bottom: 6px;
        "
      >
        Codigo de barras
      </span>
      <code
        style="
          display: block;
          background: rgba(255,255,255,0.04);
          padding: 12px;
          border-radius: 8px;
          font-family: 'Outfit', monospace;
          font-size: 0.875rem;
          color: var(--color-foreground, #F6F6FF);
          overflow-x: auto;
          white-space: nowrap;
        "
      >{payment.boleto.barcode}</code>
    </div>

    {#if payment.boleto.boletoUrl}
      <div style="margin-bottom: 12px;">
        <a
          href={payment.boleto.boletoUrl}
          target="_blank"
          rel="noopener"
          style="
            font-family: 'Outfit', sans-serif;
            font-size: 0.875rem;
            color: var(--color-brand-cyan, #01FAFB);
            text-decoration: none;
          "
        >
          Ver boleto
        </a>
      </div>
    {/if}

    <div>
      <span
        style="
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: var(--color-foreground-secondary, #9090A8);
        "
      >
        Vencimento:
      </span>
      <span
        style="
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          color: var(--color-foreground, #F6F6FF);
          margin-left: 4px;
        "
      >
        {formatDate(payment.boleto.dueDate)}
      </span>
    </div>

  {:else if (payment.method === 'CREDIT_CARD' || payment.method === 'DEBIT_CARD') && payment.card}
    <p
      style="
        font-family: 'Outfit', sans-serif;
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--color-foreground-secondary, #9090A8);
        margin: 0 0 12px;
      "
    >
      Cartao
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px;">
      <div>
        <span
          style="
            font-family: 'Outfit', sans-serif;
            font-size: 0.875rem;
            color: var(--color-foreground-secondary, #9090A8);
            display: block;
          "
        >
          Numero
        </span>
        <span
          style="
            font-family: 'Outfit', sans-serif;
            font-size: 0.875rem;
            color: var(--color-foreground, #F6F6FF);
          "
        >
          **** {payment.card.lastFourDigits} ({payment.card.brand})
        </span>
      </div>

      <div>
        <span
          style="
            font-family: 'Outfit', sans-serif;
            font-size: 0.875rem;
            color: var(--color-foreground-secondary, #9090A8);
            display: block;
          "
        >
          Parcelas
        </span>
        <span
          style="
            font-family: 'Outfit', sans-serif;
            font-size: 0.875rem;
            color: var(--color-foreground, #F6F6FF);
          "
        >
          {payment.card.installments}x
        </span>
      </div>
    </div>
  {/if}
</div>
