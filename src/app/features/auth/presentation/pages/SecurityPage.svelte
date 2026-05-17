<script lang="ts">
  import { page } from '$app/state';
  import * as QRCode from 'qrcode';
  import { CheckCircle2, KeyRound, ShieldCheck, ShieldOff } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import MetricPanel from '$appmod/shared/widgets/MetricPanel.svelte';
  import CopyButton from '$appmod/shared/widgets/CopyButton.svelte';
  import { appServices } from '$core/service_locator/dependencies';

  const authService = appServices.auth();

  let loading = $state(false);
  let verifying = $state(false);
  let disabling = $state(false);
  let setupError = $state('');
  let message = $state('');
  let setupSecret = $state('');
  let setupUri = $state('');
  let qrDataUrl = $state('');
  let verifyCode = $state('');
  let disableCode = $state('');
  let twoFactorEnabled = $state(Boolean(page.data.admin?.twoFactorEnabled));

  $effect(() => {
    twoFactorEnabled = Boolean(page.data.admin?.twoFactorEnabled);
  });

  async function generateQr(uri: string) {
    qrDataUrl = uri
      ? await QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: '#070707', light: '#ffffff' } })
      : '';
  }

  async function startSetup() {
    loading = true;
    setupError = '';
    message = '';
    const result = await authService.setupTwoFactor();
    loading = false;

    if (!result.ok) {
      setupError = result.failure.message;
      return;
    }

    setupSecret = result.value.secret ?? result.value.manualEntryKey ?? '';
    setupUri = result.value.otpAuthUri ?? result.value.qrCodeUri ?? '';
    await generateQr(setupUri);
  }

  async function verifySetup() {
    verifying = true;
    setupError = '';
    message = '';
    const result = await authService.verifyTwoFactor(verifyCode);
    verifying = false;

    if (!result.ok) {
      setupError = result.failure.message;
      return;
    }

    twoFactorEnabled = true;
    verifyCode = '';
    setupSecret = '';
    setupUri = '';
    qrDataUrl = '';
    message = result.value.message ?? '2FA ativado com sucesso.';
  }

  async function disableTwoFactor() {
    disabling = true;
    setupError = '';
    message = '';
    const result = await authService.disableTwoFactor(disableCode);
    disabling = false;

    if (!result.ok) {
      setupError = result.failure.message;
      return;
    }

    twoFactorEnabled = false;
    disableCode = '';
    message = result.value.message ?? '2FA desativado com sucesso.';
  }
</script>

<PageShell
  eyebrow="Auth admin"
  title="Seguranca"
  subtitle="Ative, confirme ou desative o segundo fator do admin logado com TOTP."
>
  <div class="metrics">
    <MetricPanel
      label="Status 2FA"
      value={twoFactorEnabled ? 'Ativo' : 'Inativo'}
      tone={twoFactorEnabled ? 'success' : 'warning'}
      caption={twoFactorEnabled ? 'Login protegido por app autenticador.' : 'Conta ainda usa apenas senha.'}
    >
      {#snippet icon()}<ShieldCheck size={16} />{/snippet}
    </MetricPanel>
    <MetricPanel
      label="Admin"
      value={page.data.admin?.role ?? 'ADMIN'}
      tone="cyan"
      caption={page.data.admin?.email ?? 'Sessao autenticada'}
    >
      {#snippet icon()}<KeyRound size={16} />{/snippet}
    </MetricPanel>
  </div>

  {#if message}
    <div class="notice notice--success"><CheckCircle2 size={16} /> {message}</div>
  {/if}
  {#if setupError}
    <div class="notice notice--error">{setupError}</div>
  {/if}

  <div class="security-grid">
    <section class="panel">
      <div class="panel__header">
        <div>
          <p>Setup</p>
          <h2>Ativar 2FA</h2>
        </div>
        <button type="button" onclick={startSetup} disabled={loading || twoFactorEnabled}>
          {loading ? 'Gerando...' : twoFactorEnabled ? 'Ja ativo' : 'Gerar QR'}
        </button>
      </div>

      {#if qrDataUrl || setupSecret}
        <div class="setup-grid">
          {#if qrDataUrl}
            <div class="qr-box">
              <img src={qrDataUrl} alt="QR Code 2FA" />
            </div>
          {/if}
          <div class="setup-copy">
            <span>Chave manual</span>
            <strong>{setupSecret || 'Use o QR code'}</strong>
            {#if setupSecret}
              <CopyButton value={setupSecret} label="Copiar chave" />
            {/if}
          </div>
        </div>

        <div class="code-row">
          <input bind:value={verifyCode} inputmode="numeric" maxlength="6" placeholder="000000" />
          <button type="button" onclick={verifySetup} disabled={verifying}>
            {verifying ? 'Verificando...' : 'Confirmar'}
          </button>
        </div>
      {:else}
        <p class="muted">Gere um QR code, leia com Google Authenticator, Authy ou app equivalente e confirme o codigo.</p>
      {/if}
    </section>

    <section class="panel panel--danger">
      <div class="panel__header">
        <div>
          <p>Controle</p>
          <h2>Desativar 2FA</h2>
        </div>
        <ShieldOff size={20} />
      </div>
      <p class="muted">Para remover o segundo fator, confirme com um codigo atual do app autenticador.</p>
      <div class="code-row">
        <input bind:value={disableCode} inputmode="numeric" maxlength="6" placeholder="000000" disabled={!twoFactorEnabled} />
        <button type="button" onclick={disableTwoFactor} disabled={disabling || !twoFactorEnabled}>
          {disabling ? 'Desativando...' : 'Desativar'}
        </button>
      </div>
    </section>
  </div>
</PageShell>

<style>
  .metrics,
  .security-grid {
    display: grid;
    gap: 16px;
  }

  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 16px;
  }

  .security-grid {
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  }

  .panel {
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
  }

  .panel--danger {
    border-color: rgba(255, 59, 92, 0.16);
  }

  .panel__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 16px;
  }

  .panel__header p {
    margin: 0 0 5px;
    color: var(--color-brand-cyan);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: 1.18rem;
  }

  button {
    min-height: 38px;
    padding: 0 13px;
    border: 1px solid rgba(1, 250, 251, 0.22);
    border-radius: 11px;
    background: rgba(1, 250, 251, 0.065);
    color: var(--color-brand-cyan);
    font-weight: 750;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .setup-grid {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 18px;
    align-items: center;
  }

  .qr-box {
    display: grid;
    place-items: center;
    padding: 10px;
    border-radius: 16px;
    background: #fff;
  }

  .qr-box img {
    width: 220px;
    height: 220px;
  }

  .setup-copy {
    display: grid;
    gap: 10px;
    min-width: 0;
  }

  .setup-copy span,
  .muted {
    color: var(--color-foreground-secondary);
  }

  .setup-copy span {
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .setup-copy strong {
    overflow-wrap: anywhere;
    color: var(--color-foreground);
    font-family: var(--font-mono);
    font-size: 0.9rem;
  }

  .muted {
    margin: 0;
    line-height: 1.55;
  }

  .code-row {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }

  input {
    min-height: 40px;
    min-width: 0;
    flex: 1;
    padding: 0 13px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 11px;
    background: #09090f;
    color: var(--color-foreground);
    outline: none;
  }

  input:focus {
    border-color: rgba(1, 250, 251, 0.42);
    box-shadow: 0 0 0 3px rgba(1, 250, 251, 0.08);
  }

  .notice {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    padding: 12px 14px;
    border-radius: 13px;
    font-size: 0.88rem;
  }

  .notice--success {
    border: 1px solid rgba(0, 230, 118, 0.2);
    color: var(--color-success);
    background: rgba(0, 230, 118, 0.08);
  }

  .notice--error {
    border: 1px solid rgba(255, 59, 92, 0.2);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.08);
  }

  @media (max-width: 900px) {
    .metrics,
    .security-grid,
    .setup-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
