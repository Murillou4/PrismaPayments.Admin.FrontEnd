<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';

  interface Props {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    requiresReason?: boolean;
    reasonLabel?: string;
    onconfirm: (reason?: string) => void;
    oncancel: () => void;
  }

  let {
    open = $bindable(),
    title,
    description = '',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    destructive = false,
    requiresReason = false,
    reasonLabel = 'MOTIVO',
    onconfirm,
    oncancel
  }: Props = $props();

  let reason = $state('');

  const canConfirm = $derived(!requiresReason || reason.trim().length > 0);

  function handleConfirm() {
    onconfirm(requiresReason ? reason : undefined);
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      reason = '';
      oncancel();
    }
  }
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Content
    showCloseButton={false}
    style="
      background: var(--color-surface, #0F0F18);
      border: 1px solid var(--color-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-2xl, 24px);
      box-shadow: var(--shadow-lg, 0 16px 48px rgba(0,0,0,0.60));
      padding: 32px;
      max-width: 448px;
      width: 100%;
      color: var(--color-foreground, #F6F6FF);
    "
  >
    <Dialog.Header>
      <Dialog.Title
        style="
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-foreground, #F6F6FF);
          margin: 0 0 8px;
          text-wrap: balance;
        "
      >
        {title}
      </Dialog.Title>
    </Dialog.Header>

    {#if description}
      <p
        style="
          font-size: 0.875rem;
          color: var(--color-foreground-secondary, #9090A8);
          margin: 0 0 24px;
          line-height: 1.55;
          text-wrap: pretty;
        "
      >
        {description}
      </p>
    {/if}

    {#if requiresReason}
      <div style="margin-bottom: 24px;">
        <label
          for="confirm-reason"
          style="
            display: block;
            font-size: 0.75rem;
            font-weight: 400;
            color: var(--color-foreground-secondary, #9090A8);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
          "
        >
          {reasonLabel}
        </label>
        <textarea
          id="confirm-reason"
          bind:value={reason}
          rows={3}
          placeholder="Descreva o motivo..."
          style="
            width: 100%;
            box-sizing: border-box;
            background: var(--color-surface-overlay, #1A1A28);
            border: 1px solid var(--color-border, rgba(255,255,255,0.08));
            border-radius: var(--radius-md, 12px);
            padding: 12px 16px;
            color: var(--color-foreground, #F6F6FF);
            font-size: 1rem;
            font-family: var(--font-body, Outfit, sans-serif);
            resize: vertical;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
          "
          onfocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-hover, rgba(255,255,255,0.14))';
            e.currentTarget.style.boxShadow = '0 0 0 2px #FF00FF';
          }}
          onblur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border, rgba(255,255,255,0.08))';
            e.currentTarget.style.boxShadow = 'none';
          }}
        ></textarea>
      </div>
    {/if}

    <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px;">
      <button
        type="button"
        onclick={oncancel}
        style="
          background: transparent;
          border: 1px solid var(--color-border, rgba(255,255,255,0.08));
          border-radius: var(--radius-md, 12px);
          padding: 12px 24px;
          color: var(--color-foreground-secondary, #9090A8);
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
          min-height: 44px;
        "
      >
        {cancelLabel}
      </button>

      <button
        type="button"
        onclick={handleConfirm}
        disabled={!canConfirm}
        style="
          background: {destructive ? 'rgba(255,59,92,0.10)' : 'linear-gradient(135deg, #0A0A0F 0%, #18111A 100%)'};
          border: 1px solid {destructive ? '#FF3B5C' : '#FF00FF'};
          border-radius: var(--radius-md, 12px);
          padding: 12px 24px;
          color: {destructive ? '#FF3B5C' : 'var(--color-foreground, #F6F6FF)'};
          font-size: 1rem;
          font-weight: 700;
          cursor: {canConfirm ? 'pointer' : 'not-allowed'};
          opacity: {canConfirm ? '1' : '0.38'};
          transition: opacity 0.15s;
          min-height: 44px;
        "
      >
        {confirmLabel}
      </button>
    </div>
  </Dialog.Content>
</Dialog.Root>
