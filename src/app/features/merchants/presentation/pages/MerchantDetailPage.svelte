<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { goto } from '$app/navigation';
  import { ArrowLeft, ChevronRight } from 'lucide-svelte';
  import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import { createMerchantDetailController } from '../controllers/merchantDetailController.svelte';
  import { formatCurrency, formatDate, formatDocument } from '$appmod/shared/utils/formatters';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import MerchantStatusActions from '../components/MerchantStatusActions.svelte';
  import MerchantKYCTab from '../components/MerchantKYCTab.svelte';
  import MerchantCredentialsTab from '../components/MerchantCredentialsTab.svelte';
  import MerchantTransactionsTab from '../components/MerchantTransactionsTab.svelte';

  let { merchantId, role }: { merchantId: string; role: string | null } = $props();

  const ctrl = untrack(() => createMerchantDetailController(merchantId));

  const isAdmin   = $derived(hasPermission(role as AdminRole, 'ADMIN'));

  onMount(() => {
    ctrl.loadMerchant();
  });

  function handleTabChange(tab: string | undefined) {
    if (!tab) return;
    ctrl.setActiveTab(tab);
    if (tab === 'kyc')          ctrl.loadKYCTab();
    if (tab === 'credentials')  ctrl.loadCredentialsTab();
    if (tab === 'transactions') ctrl.loadTransactionsTab();
  }

  // ── Configurações form state ──────────────────────────────────
  let settingsWebhookUrl   = $state('');
  let settingsWithdrawal   = $state('');
  let settingsAutoWithdraw = $state(false);

  // Sync form quando merchant carrega
  $effect(() => {
    if (ctrl.state.merchant?.settings) {
      settingsWebhookUrl   = ctrl.state.merchant.settings.webhookUrl   ?? '';
      settingsWithdrawal   = ctrl.state.merchant.settings.withdrawalLimit
        ? String(ctrl.state.merchant.settings.withdrawalLimit / 100)
        : '';
      settingsAutoWithdraw = ctrl.state.merchant.settings.autoWithdrawal;
    }
  });

  async function handleSaveSettings() {
    await ctrl.updateSettings({
      webhookUrl:      settingsWebhookUrl  || undefined,
      withdrawalLimit: settingsWithdrawal  ? Math.round(parseFloat(settingsWithdrawal) * 100) : undefined,
      autoWithdrawal:  settingsAutoWithdraw
    });
  }
</script>

<div class="page">
  <!-- Breadcrumb / back -->
  <div class="breadcrumb">
    <button type="button" class="back-btn" onclick={() => goto('/merchants')}>
      <ArrowLeft size={14} strokeWidth={1.5} />
      Merchants
    </button>
    <ChevronRight size={12} class="breadcrumb-sep" />
    <span class="breadcrumb-current">
      {ctrl.state.merchant?.legalName ?? 'Carregando...'}
    </span>
  </div>

  <!-- Loading state -->
  {#if ctrl.state.loading}
    <div class="loading-header">
      <Skeleton class="sk-title" />
      <Skeleton class="sk-subtitle" />
    </div>
    <div class="loading-tabs">
      {#each Array(4) as _}
        <Skeleton class="sk-tab" />
      {/each}
    </div>
    <Skeleton class="sk-content" />
  {:else if ctrl.state.error}
    <div class="error-state">
      <p>{ctrl.state.error}</p>
      <Button onclick={() => ctrl.loadMerchant()} variant="outline">Tentar novamente</Button>
    </div>
  {:else if ctrl.state.merchant}
    {@const m = ctrl.state.merchant}

    <!-- Page header -->
    <div class="page-header">
      <div class="header-meta">
        <h1 class="page-title">{m.legalName}</h1>
        {#if m.tradeName}
          <p class="trade-name">{m.tradeName}</p>
        {/if}
        <div class="header-badges">
          <StatusBadge status={m.status} />
          <StatusBadge status={m.verificationStatus} />
        </div>
      </div>

      <div class="header-actions">
        <MerchantStatusActions
          merchant={m}
          {role}
          updating={ctrl.state.statusUpdating}
          onStatusUpdate={ctrl.updateStatus}
        />
        {#if ctrl.state.statusError}
          <p class="status-error">{ctrl.state.statusError}</p>
        {/if}
      </div>
    </div>

    <!-- Tabs -->
    <Tabs
      value={ctrl.state.activeTab}
      onValueChange={handleTabChange}
      class="detail-tabs"
    >
      <TabsList class="tabs-list">
        <TabsTrigger value="info">Info</TabsTrigger>
        <TabsTrigger value="balance">Saldo</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
        <TabsTrigger value="kyc">KYC</TabsTrigger>
        <TabsTrigger value="credentials">Credenciais</TabsTrigger>
        <TabsTrigger value="transactions">Transações</TabsTrigger>
      </TabsList>

      <!-- ── Tab: Info ─────────────────────────────────────── -->
      <TabsContent value="info">
        <div class="tab-content">
          <div class="info-grid">
            <div class="info-field">
              <span class="field-label">Razão Social</span>
              <span class="field-value">{m.legalName}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Nome Fantasia</span>
              <span class="field-value">{m.tradeName ?? '—'}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Documento</span>
              <span class="field-value">{formatDocument(m.documentNumber, m.documentType)}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Tipo</span>
              <span class="field-value">{m.documentType}</span>
            </div>
            <div class="info-field">
              <span class="field-label">E-mail</span>
              <span class="field-value">{m.email}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Telefone</span>
              <span class="field-value">{m.phone ?? '—'}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Status</span>
              <span class="field-value"><StatusBadge status={m.status} /></span>
            </div>
            <div class="info-field">
              <span class="field-label">Verificação</span>
              <span class="field-value"><StatusBadge status={m.verificationStatus} /></span>
            </div>
            <div class="info-field">
              <span class="field-label">Cadastro</span>
              <span class="field-value">{formatDate(m.createdAt)}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Última atualização</span>
              <span class="field-value">{formatDate(m.updatedAt)}</span>
            </div>
            <div class="info-field">
              <span class="field-label">Tenant ID</span>
              <span class="field-value field-mono">{m.tenantId}</span>
            </div>
            <div class="info-field">
              <span class="field-label">ID</span>
              <span class="field-value field-mono">{m.id}</span>
            </div>
          </div>
        </div>
      </TabsContent>

      <!-- ── Tab: Saldo ────────────────────────────────────── -->
      <TabsContent value="balance">
        <div class="tab-content">
          <div class="balance-grid">
            <div class="balance-card">
              <span class="balance-label">DISPONÍVEL</span>
              <span class="balance-value balance-available">{formatCurrency(m.balance.available)}</span>
            </div>
            <div class="balance-card">
              <span class="balance-label">PENDENTE</span>
              <span class="balance-value balance-pending">{formatCurrency(m.balance.pending)}</span>
            </div>
            <div class="balance-card">
              <span class="balance-label">RESERVADO</span>
              <span class="balance-value balance-reserved">{formatCurrency(m.balance.reserved)}</span>
            </div>
          </div>
        </div>
      </TabsContent>

      <!-- ── Tab: Configurações ────────────────────────────── -->
      <TabsContent value="settings">
        <div class="tab-content">
          <div class="settings-form">
            <div class="form-field">
              <label class="form-label" for="webhookUrl">Webhook URL</label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://..."
                bind:value={settingsWebhookUrl}
                disabled={!isAdmin}
              />
            </div>

            <div class="form-field">
              <label class="form-label" for="withdrawalLimit">Limite de Saque (R$)</label>
              <Input
                id="withdrawalLimit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                bind:value={settingsWithdrawal}
                disabled={!isAdmin}
              />
            </div>

            <div class="form-field form-field--checkbox">
              <input
                id="autoWithdrawal"
                type="checkbox"
                class="checkbox"
                bind:checked={settingsAutoWithdraw}
                disabled={!isAdmin}
              />
              <label class="form-label form-label--inline" for="autoWithdrawal">
                Saque automático habilitado
              </label>
            </div>

            {#if ctrl.state.settingsError}
              <p class="form-error">{ctrl.state.settingsError}</p>
            {/if}

            {#if isAdmin}
              <Button
                onclick={handleSaveSettings}
                disabled={ctrl.state.settingsSaving}
                class="btn-save"
              >
                {ctrl.state.settingsSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            {:else}
              <p class="form-readonly-note">Apenas ADMIN pode editar configurações.</p>
            {/if}
          </div>
        </div>
      </TabsContent>

      <!-- ── Tab: KYC (lazy) ───────────────────────────────── -->
      <TabsContent value="kyc">
        <div class="tab-content">
          {#if ctrl.state.kycLoading}
            <div class="lazy-skeleton">
              {#each Array(3) as _}
                <Skeleton class="sk-card" />
              {/each}
            </div>
          {:else if ctrl.state.kycLoaded}
            <MerchantKYCTab
              merchantId={m.id}
              docs={ctrl.state.kycDocs}
              merchantVerificationStatus={m.verificationStatus}
              {role}
              onVerificationUpdate={ctrl.updateVerification}
            />
          {:else}
            <div class="lazy-placeholder">
              <p class="placeholder-text">Clique na aba para carregar documentos KYC.</p>
            </div>
          {/if}
        </div>
      </TabsContent>

      <!-- ── Tab: Credenciais (lazy) ───────────────────────── -->
      <TabsContent value="credentials">
        <div class="tab-content">
          {#if ctrl.state.credsLoading}
            <div class="lazy-skeleton">
              {#each Array(2) as _}
                <Skeleton class="sk-card" />
              {/each}
            </div>
          {:else if ctrl.state.credsLoaded}
            <MerchantCredentialsTab
              merchantId={m.id}
              credentials={ctrl.state.credentials}
              {role}
              onCreateCredential={ctrl.createCredential}
            />
          {:else}
            <div class="lazy-placeholder">
              <p class="placeholder-text">Clique na aba para carregar credenciais.</p>
            </div>
          {/if}
        </div>
      </TabsContent>

      <!-- ── Tab: Transações (lazy) ────────────────────────── -->
      <TabsContent value="transactions">
        <div class="tab-content">
          {#if ctrl.state.txnsLoading}
            <div class="lazy-skeleton">
              {#each Array(5) as _}
                <Skeleton class="sk-row" />
              {/each}
            </div>
          {:else if ctrl.state.txnsLoaded}
            <MerchantTransactionsTab
              merchantId={m.id}
              transactions={ctrl.state.recentTxns}
            />
          {:else}
            <div class="lazy-placeholder">
              <p class="placeholder-text">Clique na aba para carregar transações.</p>
            </div>
          {/if}
        </div>
      </TabsContent>
    </Tabs>
  {/if}
</div>

<style>
  .page {
    padding: 32px 36px;
    max-width: 1100px;
    margin: 0 auto;
    animation: enter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes enter {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Breadcrumb */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.45);
  }
  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: rgba(218, 212, 196, 0.55);
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    padding: 4px 8px;
    border-radius: 6px;
    transition: color 0.18s, background 0.18s;
  }
  .back-btn:hover {
    color: var(--color-brand-cyan, #01FAFB);
    background: rgba(1, 250, 251, 0.06);
  }
  :global(.breadcrumb-sep) { color: rgba(218, 212, 196, 0.22); }
  .breadcrumb-current {
    color: rgba(218, 212, 196, 0.75);
    font-weight: 500;
  }

  /* Header */
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 24px;
  }
  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: rgba(218, 212, 196, 0.90);
    margin: 0 0 4px;
    text-transform: uppercase;
  }
  .trade-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(218, 212, 196, 0.45);
    margin: 0 0 10px;
  }
  .header-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* Status error */
  .status-error {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--color-danger, #FF3B5C);
    margin-top: 6px;
  }

  /* Loading skeletons */
  :global(.sk-title)    { width: 280px; height: 32px; border-radius: 4px; }
  :global(.sk-subtitle) { width: 160px; height: 14px; border-radius: 3px; margin-top: 8px; }
  :global(.sk-tab)      { width: 80px;  height: 32px; border-radius: 4px; }
  :global(.sk-content)  { width: 100%;  height: 320px; border-radius: 6px; margin-top: 16px; }
  :global(.sk-card)     { width: 100%;  height: 100px; border-radius: 6px; }
  :global(.sk-row)      { width: 100%;  height: 44px;  border-radius: 4px; }

  .loading-header { margin-bottom: 20px; }
  .loading-tabs   { display: flex; gap: 8px; margin-bottom: 16px; }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 64px;
    color: rgba(218, 212, 196, 0.45);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  }

  /* Tabs */
  :global(.detail-tabs) { width: 100%; }
  :global(.tabs-list) {
    background: rgba(10, 9, 16, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    padding: 4px;
    gap: 2px;
  }

  .tab-content {
    margin-top: 20px;
    animation: tab-enter 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  @keyframes tab-enter {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Info grid */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    overflow: hidden;
  }
  .info-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 18px;
    background: #0a0910;
  }
  .field-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(218, 212, 196, 0.30);
  }
  .field-value {
    font-size: 13px;
    color: rgba(218, 212, 196, 0.85);
    font-weight: 500;
  }
  .field-mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.55);
  }

  /* Balance */
  .balance-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .balance-card {
    background: #0a0910;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .balance-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(218, 212, 196, 0.30);
  }
  .balance-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .balance-available { color: rgba(1, 250, 251, 0.85); }
  .balance-pending   { color: rgba(218, 168, 80, 0.75); }
  .balance-reserved  { color: rgba(218, 212, 196, 0.50); }

  /* Settings form */
  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;
  }
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-field--checkbox {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
  .form-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(218, 212, 196, 0.45);
  }
  .form-label--inline { margin: 0; font-size: 12px; text-transform: none; letter-spacing: 0; }
  .checkbox { width: 16px; height: 16px; cursor: pointer; accent-color: var(--color-brand-cyan, #01FAFB); }
  .form-error { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--color-danger, #FF3B5C); }
  .form-readonly-note { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(218, 212, 196, 0.30); font-style: italic; }
  :global(.btn-save) { align-self: flex-start; }

  /* Lazy placeholders */
  .lazy-skeleton { display: flex; flex-direction: column; gap: 12px; }
  .lazy-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px;
    text-align: center;
  }
  .placeholder-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.35);
    letter-spacing: 0.06em;
  }
</style>
