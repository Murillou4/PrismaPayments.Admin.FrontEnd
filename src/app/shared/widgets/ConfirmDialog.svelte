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
  <Dialog.Content showCloseButton={false} class="confirm-dialog">
    <Dialog.Header>
      <Dialog.Title class="confirm-dialog__title">{title}</Dialog.Title>
    </Dialog.Header>

    {#if description}
      <p class="confirm-dialog__description">{description}</p>
    {/if}

    {#if requiresReason}
      <div class="confirm-dialog__field">
        <label for="confirm-reason">{reasonLabel}</label>
        <textarea
          id="confirm-reason"
          bind:value={reason}
          rows={3}
          placeholder="Descreva o motivo..."
        ></textarea>
      </div>
    {/if}

    <div class="confirm-dialog__actions">
      <button type="button" class="confirm-dialog__button" onclick={oncancel}>
        {cancelLabel}
      </button>

      <button
        type="button"
        class="confirm-dialog__button confirm-dialog__button--primary"
        class:confirm-dialog__button--danger={destructive}
        onclick={handleConfirm}
        disabled={!canConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
  :global(.confirm-dialog) {
    max-width: 448px;
    padding: 24px;
    border-color: var(--color-border);
    border-radius: var(--radius-2xl);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
    color: var(--color-foreground);
    box-shadow: var(--shadow-lg);
  }

  :global(.confirm-dialog__title) {
    margin: 0;
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: 1.28rem;
    font-weight: 760;
    line-height: 1.15;
    text-wrap: balance;
  }

  .confirm-dialog__description {
    margin: -4px 0 4px;
    color: var(--color-foreground-secondary);
    font-size: 0.86rem;
    line-height: 1.52;
    text-wrap: pretty;
  }

  .confirm-dialog__field {
    display: grid;
    gap: 7px;
  }

  .confirm-dialog__field label {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .confirm-dialog__field textarea {
    width: 100%;
    min-height: 96px;
    box-sizing: border-box;
    resize: vertical;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    background: rgba(255, 255, 255, 0.035);
    color: var(--color-foreground);
    font: inherit;
    font-size: 0.9rem;
    outline: none;
    padding: 11px 12px;
    transition: border-color 0.18s, box-shadow 0.18s;
  }

  .confirm-dialog__field textarea:focus {
    border-color: rgba(1, 250, 251, 0.38);
    box-shadow: 0 0 0 3px rgba(1, 250, 251, 0.12);
  }

  .confirm-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
  }

  .confirm-dialog__button {
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.025);
    color: var(--color-foreground-secondary);
    cursor: pointer;
    font-size: 0.84rem;
    font-weight: 700;
    transition: transform 0.18s, background 0.18s, border-color 0.18s, color 0.18s;
  }

  .confirm-dialog__button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.055);
    color: var(--color-foreground);
  }

  .confirm-dialog__button--primary {
    border-color: var(--color-foreground);
    background: var(--color-foreground);
    color: var(--color-background);
  }

  .confirm-dialog__button--danger {
    border-color: rgba(255, 59, 92, 0.34);
    background: rgba(255, 59, 92, 0.1);
    color: var(--color-danger);
  }

  .confirm-dialog__button:disabled {
    cursor: not-allowed;
    opacity: 0.38;
    transform: none;
  }
</style>
