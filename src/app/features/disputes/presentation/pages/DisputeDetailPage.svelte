<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { ArrowLeft, ServerCrash } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { createDisputeDetailController } from '../controllers/disputeDetailController.svelte';
  import DisputeTimeline from '../components/DisputeTimeline.svelte';
  import DisputeResolutionForm from '../components/DisputeResolutionForm.svelte';
  import Breadcrumbs from '$appmod/shared/widgets/Breadcrumbs.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import { Button } from '$lib/components/ui/button';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import { formatCurrency, formatDate, formatShortId } from '$appmod/shared/utils/formatters';
  import type { ResolveDisputePayload } from '$appmod/features/disputes/domain/entities/Dispute';

  interface Props {
    disputeId: string;
    role: string | null;
  }

  let { disputeId, role }: Props = $props();

  // disputeId is stable per route mount — create controller once
  const ctrl = untrack(() => createDisputeDetailController(disputeId));

  // D-14: SUPPORT+ role guard — form HIDDEN (not disabled) for VIEWER
  const isSupport = $derived(hasPermission(role as AdminRole, 'SUPPORT'));

  // D-13: Hide form also when dispute is already resolved
  const RESOLVED_STATUSES = ['ACCEPTED', 'REJECTED', 'RESOLVED'] as const;
  const isAlreadyResolved = $derived(
    ctrl.state.dispute ? RESOLVED_STATUSES.includes(ctrl.state.dispute.status as typeof RESOLVED_STATUSES[number]) : false
  );

  async function handleResolve(payload: ResolveDisputePayload) {
    const ok = await ctrl.resolveDispute(payload);
    if (ok) {
      toast.success('Disputa resolvida com sucesso.');
      goto('/disputes');
    } else {
      toast.error('Erro ao salvar resolução. Tente novamente.');
    }
  }

  onMount(() => ctrl.loadDispute());
</script>

<div style="padding: 48px 24px; max-width: 900px; margin: 0 auto;">

  <!-- Breadcrumbs — D-15: Disputas > #abc12345 (8 chars) -->
  <div style="margin-bottom: 24px;">
    <Breadcrumbs segments={[
      { label: 'Disputas', href: '/disputes' },
      { label: `#${formatShortId(disputeId)}` },
    ]} />
  </div>

  {#if ctrl.state.loading}
    <!-- Skeleton: 3 placeholder cards -->
    <div style="display: flex; flex-direction: column; gap: 32px;">
      {#each [1, 2, 3] as _}
        <div style="
          background: var(--color-surface, #0F0F18);
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--color-border, rgba(255,255,255,0.08));
          box-shadow: var(--shadow-md);
        ">
          <div style="height: 16px; width: 160px; background: rgba(255,255,255,0.07); border-radius: 6px; margin-bottom: 20px; animation: skeleton-pulse 1.5s ease-in-out infinite;"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px;">
            {#each [1, 2, 3, 4] as __}
              <div>
                <div style="height: 11px; width: 80px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 6px; animation: skeleton-pulse 1.5s ease-in-out infinite;"></div>
                <div style="height: 14px; width: 120px; background: rgba(255,255,255,0.07); border-radius: 4px; animation: skeleton-pulse 1.5s ease-in-out infinite;"></div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

  {:else if ctrl.state.error || !ctrl.state.dispute}
    <!-- Error state — matches PaymentDetailPage pattern -->
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 64px 24px; background: var(--color-surface, #0F0F18); border-radius: 16px; border: 1px solid var(--color-border, rgba(255,255,255,0.08));">
      <ServerCrash size={40} style="color: #FF3B5C;" />
      <p style="color: var(--color-foreground, #F6F6FF); font-size: 1rem; margin: 0;">
        Erro ao carregar disputa.
      </p>
      <Button variant="outline" onclick={() => goto('/disputes')}>
        <ArrowLeft size={16} style="margin-right: 8px;" />
        Voltar para Disputas
      </Button>
    </div>

  {:else}
    {@const dispute = ctrl.state.dispute}
    <div style="display: flex; flex-direction: column; gap: 32px;">

      <!-- Card 1: Informações da Disputa — D-12 -->
      <div style="
        background: var(--color-surface, #0F0F18);
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--shadow-md);
      ">
        <h2 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--color-foreground, #F6F6FF); margin: 0 0 20px;">
          Informações da Disputa
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px;">

          <div>
            <p style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Tipo</p>
            <StatusBadge status={dispute.disputeType} />
          </div>

          <div>
            <p style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Status</p>
            <StatusBadge status={dispute.status} />
          </div>

          <div>
            <p style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Valor</p>
            <p style="font-size: 0.875rem; color: var(--color-foreground, #F6F6FF); margin: 0; font-variant-numeric: tabular-nums;">
              {formatCurrency(dispute.amount)}
            </p>
          </div>

          <div>
            <p style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Data de Abertura</p>
            <p style="font-size: 0.875rem; color: var(--color-foreground, #F6F6FF); margin: 0;">
              {formatDate(dispute.openedAt)}
            </p>
          </div>

          {#if dispute.reason}
            <div style="grid-column: 1 / -1;">
              <p style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">Motivo</p>
              <p style="font-size: 0.875rem; color: var(--color-foreground, #F6F6FF); margin: 0; line-height: 1.55;">
                {dispute.reason}
              </p>
            </div>
          {/if}

          {#if dispute.externalId}
            <div>
              <p style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">ID Externo</p>
              <p style="font-size: 0.875rem; color: var(--color-foreground, #F6F6FF); margin: 0; font-family: var(--font-mono);">
                {dispute.externalId}
              </p>
            </div>
          {/if}

        </div>
      </div>

      <!-- Card 2: Timeline — D-12, D-07 to D-09 -->
      <div style="
        background: var(--color-surface, #0F0F18);
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--shadow-md);
      ">
        <h2 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--color-foreground, #F6F6FF); margin: 0 0 24px;">
          Timeline
        </h2>
        <DisputeTimeline
          status={dispute.status}
          openedAt={dispute.openedAt}
          resolvedAt={dispute.resolvedAt}
        />
      </div>

      <!-- Card 3: Pagamento Relacionado — D-12, D-16 (no extra API call) -->
      <div style="
        background: var(--color-surface, #0F0F18);
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: 16px;
        padding: 24px;
        box-shadow: var(--shadow-md);
      ">
        <h2 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--color-foreground, #F6F6FF); margin: 0 0 16px;">
          Pagamento Relacionado
        </h2>
        <div>
          <p style="font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">ID do Pagamento</p>
          <!-- D-16: paymentId as link only — no extra API call -->
          <a
            href="/transactions/payments/{dispute.paymentId}"
            style="font-family: var(--font-mono); font-size: 0.875rem; color: #01FAFB; text-decoration: none;"
            onmouseenter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onmouseleave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            #{formatShortId(dispute.paymentId)}
          </a>
        </div>
      </div>

      <!-- Card 4: Formulário de Resolução — D-12, D-13, D-14 -->
      <!-- D-14: HIDDEN (not disabled) for VIEWER — {#if isSupport && !isAlreadyResolved} -->
      {#if isSupport && !isAlreadyResolved}
        <div style="
          background: var(--color-surface, #0F0F18);
          border: 1px solid var(--color-border, rgba(255,255,255,0.08));
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--shadow-md);
        ">
          <h2 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--color-foreground, #F6F6FF); margin: 0 0 20px;">
            Resolução
          </h2>
          <DisputeResolutionForm
            onResolve={handleResolve}
            submitting={ctrl.state.submitting}
          />
        </div>
      {/if}

    </div>
  {/if}

</div>

<style>
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.8; }
  }
</style>
