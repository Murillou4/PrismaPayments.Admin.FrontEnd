<script lang="ts">
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
  } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';

  let {
    open = false,
    publicKey,
    secretKey,
    onClose
  }: {
    open?: boolean;
    publicKey: string;
    secretKey: string;
    onClose: () => void;
  } = $props();

  let copiedPublic = $state(false);
  let copiedSecret = $state(false);

  async function copyToClipboard(text: string, which: 'public' | 'secret') {
    try {
      await navigator.clipboard.writeText(text);
      if (which === 'public') {
        copiedPublic = true;
        setTimeout(() => (copiedPublic = false), 2000);
      } else {
        copiedSecret = true;
        setTimeout(() => (copiedSecret = false), 2000);
      }
    } catch {
      // fallback silencioso
    }
  }

  // Prevenir fechar ao clicar fora do dialog
  function handleInteractOutside(e: Event) {
    e.preventDefault();
  }
</script>

<Dialog
  {open}
  onOpenChange={(val) => { if (!val) { /* não fechar pelo overlay — só o botão fecha */ } }}
>
  <DialogContent
    class="secret-key-dialog"
    showCloseButton={false}
    onInteractOutside={handleInteractOutside}
  >
    <DialogHeader>
      <DialogTitle>Credencial criada com sucesso</DialogTitle>
      <DialogDescription>
        Guarde o Secret Key agora. Ele não poderá ser visto novamente após fechar esta janela.
      </DialogDescription>
    </DialogHeader>

    <div class="warning-banner">
      <span class="warning-icon">!</span>
      <span class="warning-text">
        Este é o único momento em que o <strong>secretKey</strong> completo é exibido.
        Após fechar, só o último trecho (last4) estará disponível.
      </span>
    </div>

    <div class="keys-section">
      <!-- Public Key -->
      <div class="key-field">
        <span class="key-label">Public Key</span>
        <div class="key-value-row">
          <code class="key-value">{publicKey}</code>
          <button
            type="button"
            class="copy-btn"
            onclick={() => copyToClipboard(publicKey, 'public')}
          >
            {copiedPublic ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <!-- Secret Key -->
      <div class="key-field key-field--secret">
        <span class="key-label">Secret Key <span class="one-time-label">(exibido uma única vez)</span></span>
        <div class="key-value-row">
          <code class="key-value key-value--secret">{secretKey}</code>
          <button
            type="button"
            class="copy-btn copy-btn--secret"
            onclick={() => copyToClipboard(secretKey, 'secret')}
          >
            {copiedSecret ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <Button onclick={onClose} variant="default" class="close-btn">
        Entendi, fechar
      </Button>
    </div>
  </DialogContent>
</Dialog>

<style>
  :global(.secret-key-dialog) {
    max-width: 560px;
    background: #0a0910;
    border: 1px solid rgba(255,255,255,0.10);
  }

  .warning-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: rgba(218, 168, 80, 0.08);
    border: 1px solid rgba(218, 168, 80, 0.25);
    border-radius: 6px;
    padding: 12px 14px;
    margin-top: 4px;
  }
  .warning-icon {
    font-weight: 700;
    font-size: 14px;
    color: rgba(218, 168, 80, 0.85);
    flex-shrink: 0;
    font-family: 'JetBrains Mono', monospace;
    width: 18px;
    text-align: center;
  }
  .warning-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 168, 80, 0.75);
    line-height: 1.5;
  }

  .keys-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 8px;
  }
  .key-field {
    background: rgba(0,0,0,0.30);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .key-field--secret {
    border-color: rgba(218, 168, 80, 0.20);
    background: rgba(218, 168, 80, 0.03);
  }
  .key-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(218, 212, 196, 0.35);
  }
  .one-time-label {
    color: rgba(218, 168, 80, 0.60);
    text-transform: none;
    letter-spacing: 0;
    font-size: 9px;
  }
  .key-value-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .key-value {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.80);
    word-break: break-all;
    overflow-wrap: anywhere;
  }
  .key-value--secret {
    color: rgba(218, 168, 80, 0.85);
  }
  .copy-btn {
    flex-shrink: 0;
    background: rgba(1, 250, 251, 0.08);
    border: 1px solid rgba(1, 250, 251, 0.20);
    color: var(--color-brand-cyan, #01FAFB);
    padding: 4px 10px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    transition: background 0.18s;
  }
  .copy-btn:hover { background: rgba(1, 250, 251, 0.14); }
  .copy-btn--secret {
    border-color: rgba(218, 168, 80, 0.30);
    color: rgba(218, 168, 80, 0.80);
    background: rgba(218, 168, 80, 0.06);
  }
  .copy-btn--secret:hover { background: rgba(218, 168, 80, 0.12); }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
  }
</style>
