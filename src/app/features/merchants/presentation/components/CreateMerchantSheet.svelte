<script lang="ts">
  import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
  } from '$lib/components/ui/sheet';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select/index.js';
  import { appServices } from '$core/service_locator/dependencies';
  import type {
    Tenant,
    CreateMerchantPayload,
    MerchantStatus,
    VerificationStatus
  } from '$appmod/features/merchants/domain/entities/Merchant';

  let {
    open = $bindable(false),
    onCreated
  }: {
    open?: boolean;
    onCreated: () => void;
  } = $props();

  const service = appServices.merchants();

  // Form fields
  let legalName       = $state('');
  let tradeName       = $state('');
  let documentNumber  = $state('');
  let documentType    = $state<'CPF' | 'CNPJ'>('CNPJ');
  let email           = $state('');
  let phone           = $state('');
  let password        = $state('');
  let tenantId        = $state('');
  let statusOpt       = $state<MerchantStatus | ''>('');
  let verificationOpt = $state<VerificationStatus | ''>('');

  // Tenants dropdown
  let tenants        = $state<Tenant[]>([]);
  let loadingTenants = $state(false);

  // Submit
  let submitting = $state(false);
  let formError  = $state<string | null>(null);

  const DOCUMENT_TYPES = [
    { value: 'CNPJ', label: 'CNPJ (Pessoa Juridica)' },
    { value: 'CPF',  label: 'CPF (Pessoa Fisica)' }
  ];

  const STATUS_OPTIONS: { value: MerchantStatus; label: string }[] = [
    { value: 'PENDING',   label: 'Pendente' },
    { value: 'ACTIVE',    label: 'Ativo' },
    { value: 'SUSPENDED', label: 'Suspenso' },
    { value: 'BLOCKED',   label: 'Bloqueado' }
  ];

  const VERIFICATION_OPTIONS: { value: VerificationStatus; label: string }[] = [
    { value: 'UNVERIFIED',     label: 'Nao verificado' },
    { value: 'PENDING_REVIEW', label: 'Pendente revisao' },
    { value: 'VERIFIED',       label: 'Verificado' },
    { value: 'REJECTED',       label: 'Rejeitado' }
  ];

  // Computed labels for select triggers
  const docTypeLabel    = $derived(documentType === 'CNPJ' ? 'CNPJ (Pessoa Jurídica)' : 'CPF (Pessoa Física)');
  const tenantLabel     = $derived(tenantId ? (tenants.find(t => t.id === tenantId)?.name ?? tenantId) : 'Selecionar tenant...');
  const statusLabel     = $derived(statusOpt ? STATUS_OPTIONS.find(s => s.value === statusOpt)?.label ?? statusOpt : 'Padrão: PENDING');
  const verificationLabel = $derived(verificationOpt ? VERIFICATION_OPTIONS.find(v => v.value === verificationOpt)?.label ?? verificationOpt : 'Padrão: UNVERIFIED');

  // Carrega tenants ao abrir o sheet
  $effect(() => {
    if (open && tenants.length === 0) {
      loadTenants();
    }
  });

  async function loadTenants() {
    loadingTenants = true;
    const result = await service.listTenants();
    if (result.ok) tenants = result.value;
    loadingTenants = false;
  }

  function resetForm() {
    legalName       = '';
    tradeName       = '';
    documentNumber  = '';
    documentType    = 'CNPJ';
    email           = '';
    phone           = '';
    password        = '';
    tenantId        = '';
    statusOpt       = '';
    verificationOpt = '';
    formError       = null;
  }

  function handleOpenChange(val: boolean) {
    if (!val) {
      resetForm();
      open = false;
    }
  }

  async function handleSubmit() {
    // Validação básica
    if (!legalName.trim() || !documentNumber.trim() || !email.trim() || !password.trim() || !tenantId) {
      formError = 'Preencha todos os campos obrigatórios (marcados com *).';
      return;
    }

    submitting = true;
    formError  = null;

    const payload: CreateMerchantPayload = {
      legalName:          legalName.trim(),
      tradeName:          tradeName.trim() || undefined,
      documentNumber:     documentNumber.trim(),
      documentType,
      email:              email.trim(),
      phone:              phone.trim() || undefined,
      password,
      tenantId,
      status:             statusOpt       || undefined,
      verificationStatus: verificationOpt || undefined
    };

    const result = await service.create(payload);

    if (result.ok) {
      onCreated();
      open = false;
      resetForm();
    } else {
      formError = result.failure.message;
    }
    submitting = false;
  }

</script>

<Sheet {open} onOpenChange={handleOpenChange}>
  <SheetContent side="right" class="create-merchant-sheet">
    <SheetHeader>
      <SheetTitle>Novo Merchant</SheetTitle>
      <SheetDescription>
        Preencha os dados para cadastrar um novo estabelecimento.
        Campos marcados com * são obrigatórios.
      </SheetDescription>
    </SheetHeader>

    <div class="sheet-body">
      <!-- legalName -->
      <div class="form-field">
        <label class="form-label" for="legalName">Razão Social *</label>
        <Input id="legalName" bind:value={legalName} placeholder="Nome legal da empresa" />
      </div>

      <!-- tradeName -->
      <div class="form-field">
        <label class="form-label" for="tradeName">Nome Fantasia</label>
        <Input id="tradeName" bind:value={tradeName} placeholder="Nome de exibição (opcional)" />
      </div>

      <!-- documentType + documentNumber (lado a lado) -->
      <div class="form-row">
        <div class="form-field">
          <label class="form-label" for="documentType">Tipo *</label>
          <Select.Root
            type="single"
            value={documentType}
            onValueChange={(v) => v && (documentType = v as 'CPF' | 'CNPJ')}
          >
            <Select.Trigger id="documentType">
              {docTypeLabel}
            </Select.Trigger>
            <Select.Content>
              {#each DOCUMENT_TYPES as dt}
                <Select.Item value={dt.value}>{dt.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <div class="form-field">
          <label class="form-label" for="documentNumber">Número do Documento *</label>
          <Input
            id="documentNumber"
            bind:value={documentNumber}
            placeholder={documentType === 'CNPJ' ? '00.000.000/0001-00' : '000.000.000-00'}
          />
        </div>
      </div>

      <!-- email -->
      <div class="form-field">
        <label class="form-label" for="email">E-mail *</label>
        <Input id="email" type="email" bind:value={email} placeholder="contato@empresa.com" />
      </div>

      <!-- phone -->
      <div class="form-field">
        <label class="form-label" for="phone">Telefone</label>
        <Input id="phone" type="tel" bind:value={phone} placeholder="(11) 99999-9999" />
      </div>

      <!-- password -->
      <div class="form-field">
        <label class="form-label" for="password">Senha *</label>
        <Input id="password" type="password" bind:value={password} placeholder="Senha de acesso" />
      </div>

      <!-- tenantId -->
      <div class="form-field">
        <label class="form-label" for="tenantId">Tenant *</label>
        {#if loadingTenants}
          <div class="loading-tenants">Carregando tenants...</div>
        {:else}
          <Select.Root
            type="single"
            value={tenantId}
            onValueChange={(v) => v && (tenantId = v)}
          >
            <Select.Trigger id="tenantId">
              {tenantLabel}
            </Select.Trigger>
            <Select.Content>
              {#each tenants as tenant}
                <Select.Item value={tenant.id}>{tenant.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/if}
      </div>

      <!-- Status (opcional) -->
      <div class="form-field">
        <label class="form-label" for="statusOpt">Status inicial (opcional)</label>
        <Select.Root
          type="single"
          value={statusOpt}
          onValueChange={(v) => (statusOpt = (v ?? '') as MerchantStatus | '')}
        >
          <Select.Trigger id="statusOpt">
            {statusLabel}
          </Select.Trigger>
          <Select.Content>
            {#each STATUS_OPTIONS as s}
              <Select.Item value={s.value}>{s.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <!-- VerificationStatus (opcional) -->
      <div class="form-field">
        <label class="form-label" for="verificationOpt">Verificação inicial (opcional)</label>
        <Select.Root
          type="single"
          value={verificationOpt}
          onValueChange={(v) => (verificationOpt = (v ?? '') as VerificationStatus | '')}
        >
          <Select.Trigger id="verificationOpt">
            {verificationLabel}
          </Select.Trigger>
          <Select.Content>
            {#each VERIFICATION_OPTIONS as v}
              <Select.Item value={v.value}>{v.label}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      {#if formError}
        <p class="form-error">{formError}</p>
      {/if}

      <!-- Ações -->
      <div class="sheet-actions">
        <Button
          variant="outline"
          onclick={() => handleOpenChange(false)}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button
          onclick={handleSubmit}
          disabled={submitting || !legalName.trim() || !documentNumber.trim() || !email.trim() || !password.trim() || !tenantId}
        >
          {submitting ? 'Criando...' : 'Criar Merchant'}
        </Button>
      </div>
    </div>
  </SheetContent>
</Sheet>

<style>
  :global(.create-merchant-sheet) {
    width: min(520px, 95vw) !important;
    background: #0a0910;
    border-left: 1px solid rgba(255,255,255,0.08);
  }

  .sheet-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-top: 20px;
    overflow-y: auto;
    max-height: calc(100vh - 120px);
    padding-bottom: 24px;
  }

  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 10px;
    align-items: flex-end;
  }
  .form-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(218, 212, 196, 0.40);
  }
  .form-error {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--color-danger, #FF3B5C);
    padding: 8px 10px;
    background: rgba(255, 59, 92, 0.06);
    border-radius: 4px;
    border-left: 2px solid rgba(255, 59, 92, 0.40);
  }
  .loading-tenants {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.35);
    padding: 10px;
  }
  .sheet-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin-top: 4px;
  }
</style>
