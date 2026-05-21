<script lang="ts">
  import { Inbox, Webhook, ShieldAlert, CreditCard } from 'lucide-svelte';
  import type { QueuesSection } from '../../domain/entities/AdminDashboardResponse';

  type Props = {
    queues: QueuesSection | null;
    loading: boolean;
  };

  let { queues, loading }: Props = $props();

  const items = $derived(
    queues
      ? [
          {
            key: 'kyc',
            label: 'Verificação merchant',
            value: queues.pendingMerchantVerification,
            icon: Inbox
          },
          {
            key: 'wh',
            label: 'Webhooks falhos',
            value: queues.failedWebhooks,
            icon: Webhook
          },
          {
            key: 'disp',
            label: 'Disputas abertas',
            value: queues.openDisputes,
            icon: ShieldAlert
          },
          {
            key: 'pay',
            label: 'Pagamentos falhos',
            value: queues.failedPayments,
            icon: CreditCard
          }
        ]
      : []
  );
</script>

<div class="panel anim">
  <div class="panel-accent" aria-hidden="true"></div>
  <div class="panel-head">
    <p class="sec-label">Filas críticas</p>
    <p class="panel-hint">Pendências que exigem atenção</p>
  </div>
  {#if loading}
    <div class="strip">
      {#each [1, 2, 3, 4] as _}
        <div class="q sk"></div>
      {/each}
    </div>
  {:else}
    <div class="strip">
      {#each items as it (it.key)}
        {@const Icon = it.icon}
        <div class="q" class:q--hot={it.value > 0}>
          <div class="q-ic">
            <Icon size={14} strokeWidth={1.5} />
          </div>
          <span class="q-label">{it.label}</span>
          <span class="q-val">{it.value.toLocaleString('pt-BR')}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .panel {
    position: relative;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.014)),
      var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 20px;
    padding: 20px 20px 18px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.055);
  }

  .panel-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 0, 255, 0.35) 35%,
      rgba(1, 250, 251, 0.4) 70%,
      transparent 100%
    );
  }
  .panel-head {
    margin-bottom: 14px;
  }

  .sec-label {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--color-foreground-secondary);
    margin: 0 0 4px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .panel-hint {
    font-size: 0.74rem;
    color: var(--color-foreground-secondary);
    margin: 0;
    letter-spacing: 0.04em;
  }

  .strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  @media (max-width: 900px) {
    .strip {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .q {
    background: var(--color-surface-inset);
    border: 1px solid var(--color-border-subtle);
    border-radius: 14px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    transition:
      border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .q:hover {
    border-color: var(--color-border-hover);
    transform: translateY(-1px);
  }

  .q--hot {
    border-color: rgba(255, 179, 0, 0.28);
    background: rgba(255, 179, 0, 0.04);
  }

  .q-ic {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(1, 250, 251, 0.06);
    border: 1px solid rgba(1, 250, 251, 0.12);
    color: #01fafb;
  }
  .q--hot .q-ic {
    background: rgba(255, 179, 0, 0.08);
    border-color: rgba(255, 179, 0, 0.2);
    color: var(--color-warning);
  }

  .q-label {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-foreground-secondary);
    line-height: 1.25;
  }

  .q-val {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 720;
    color: var(--color-foreground);
    font-variant-numeric: tabular-nums;
  }

  .sk {
    min-height: 96px;
    animation: pulse 1.6s ease-in-out infinite;
    background: var(--color-surface-inset);
    border-radius: 14px;
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
    animation: enter 0.38s cubic-bezier(0.22, 1, 0.36, 1) 40ms both;
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
