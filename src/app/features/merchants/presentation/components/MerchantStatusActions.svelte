<script lang="ts">
  import ConfirmDialog from '$appmod/shared/widgets/ConfirmDialog.svelte';
  import { Button } from '$lib/components/ui/button';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import type { Merchant, MerchantStatus, MerchantStatusUpdate } from '$appmod/features/merchants/domain/entities/Merchant';

  let {
    merchant,
    role,
    updating = false,
    onStatusUpdate
  }: {
    merchant: Merchant;
    role: string | null;
    updating?: boolean;
    onStatusUpdate: (payload: MerchantStatusUpdate) => Promise<void>;
  } = $props();

  const isSupport = $derived(hasPermission(role as AdminRole, 'SUPPORT'));
  const isAdmin   = $derived(hasPermission(role as AdminRole, 'ADMIN'));

  type StatusAction = {
    label: string;
    newStatus: MerchantStatus;
    variant: 'default' | 'destructive' | 'outline';
    requiresAdmin: boolean;
    title: string;
    description: string;
  };

  const availableActions = $derived((): StatusAction[] => {
    const s = merchant.status;
    const actions: StatusAction[] = [];

    if (s === 'PENDING') {
      actions.push({
        label: 'Aprovar',
        newStatus: 'ACTIVE',
        variant: 'default',
        requiresAdmin: false,
        title: 'Aprovar Merchant',
        description: `Aprovar ${merchant.legalName} e ativar a conta. Informe o motivo da aprovação.`
      });
    }

    if (s === 'ACTIVE') {
      actions.push({
        label: 'Suspender',
        newStatus: 'SUSPENDED',
        variant: 'outline',
        requiresAdmin: false,
        title: 'Suspender Merchant',
        description: `Suspender temporariamente ${merchant.legalName}. O motivo é obrigatório.`
      });
      actions.push({
        label: 'Bloquear',
        newStatus: 'BLOCKED',
        variant: 'destructive',
        requiresAdmin: false,
        title: 'Bloquear Merchant',
        description: `Bloquear permanentemente ${merchant.legalName}. Esta ação requer motivo detalhado.`
      });
    }

    if (s === 'SUSPENDED') {
      actions.push({
        label: 'Reativar',
        newStatus: 'ACTIVE',
        variant: 'default',
        requiresAdmin: false,
        title: 'Reativar Merchant',
        description: `Reativar ${merchant.legalName}. Informe o motivo da reativação.`
      });
    }

    if (s === 'BLOCKED') {
      actions.push({
        label: 'Desbloquear',
        newStatus: 'ACTIVE',
        variant: 'outline',
        requiresAdmin: true,
        title: 'Desbloquear Merchant',
        description: `Desbloquear ${merchant.legalName}. Requer permissão ADMIN e motivo obrigatório.`
      });
    }

    return actions;
  });

  let dialogOpen   = $state(false);
  let activeAction = $state<StatusAction | null>(null);

  function openDialog(action: StatusAction) {
    activeAction = action;
    dialogOpen = true;
  }

  async function handleConfirm(reason?: string) {
    if (!activeAction || !reason?.trim()) return;
    await onStatusUpdate({ status: activeAction.newStatus, reason: reason.trim() });
    dialogOpen = false;
    activeAction = null;
  }

  function handleClose() {
    dialogOpen = false;
    activeAction = null;
  }
</script>

<div class="status-actions">
  {#each availableActions() as action}
    {@const canExecute = action.requiresAdmin ? isAdmin : isSupport}
    {#if canExecute}
      <Button
        variant={action.variant}
        size="sm"
        disabled={updating}
        onclick={() => openDialog(action)}
        class="action-btn"
      >
        {action.label}
      </Button>
    {/if}
  {/each}
</div>

{#if activeAction}
  <ConfirmDialog
    bind:open={dialogOpen}
    title={activeAction.title}
    description={activeAction.description}
    requiresReason={true}
    onconfirm={handleConfirm}
    oncancel={handleClose}
  />
{/if}

<style>
  .status-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  :global(.action-btn) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
</style>
