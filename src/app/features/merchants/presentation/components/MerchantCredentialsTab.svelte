<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Select from '$lib/components/ui/select/index.js';
  import SecretKeyModal from './SecretKeyModal.svelte';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import type {
    MerchantCredential,
    MerchantCredentialCreated,
    CreateCredentialPayload,
    CredentialEnvironment
  } from '$appmod/features/merchants/domain/entities/Merchant';
  import type { Either, Failure } from '$core/error/Failure';

  let {
    merchantId,
    credentials,
    role,
    onCreateCredential
  }: {
    merchantId: string;
    credentials: MerchantCredential[];
    role: string | null;
    onCreateCredential: (payload: CreateCredentialPayload) => Promise<Either<Failure, MerchantCredentialCreated>>;
  } = $props();

  const isAdmin = $derived(hasPermission(role as AdminRole, 'ADMIN'));

  // Form state
  let showForm   = $state(false);
  let formLabel  = $state('');
  let formEnv    = $state<CredentialEnvironment>('LIVE');
  let submitting = $state(false);
  let formError  = $state<string | null>(null);

  // SecretKeyModal state
  let modalOpen = $state(false);
  let newCred   = $state<MerchantCredentialCreated | null>(null);

  // Computed label for env select trigger
  const envLabel = $derived(formEnv === 'LIVE' ? 'LIVE — Produção' : 'TEST — Testes');

  function truncateKey(key: string): string {
    if (key.length <= 12) return key;
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
  }

  async function handleCreateCredential() {
    if (!formLabel.trim()) return;
    submitting = true;
    formError  = null;

    const result = await onCreateCredential({
      label:       formLabel.trim(),
      environment: formEnv
    });

    if (result.ok) {
      newCred   = result.value;
      modalOpen = true;
      formLabel = '';
      formEnv   = 'LIVE';
      showForm  = false;
    } else {
      formError = result.failure.message;
    }
    submitting = false;
  }

  function handleModalClose() {
    modalOpen = false;
    newCred   = null;
  }
</script>

<div class="creds-tab">
  <!-- Cabeçalho -->
  <div class="creds-header">
    <span class="creds-count">{credentials.length} credencial(is)</span>
    {#if isAdmin}
      <Button
        size="sm"
        variant="outline"
        onclick={() => (showForm = !showForm)}
      >
        {showForm ? 'Cancelar' : '+ Nova Credencial'}
      </Button>
    {/if}
  </div>

  <!-- Form de criação -->
  {#if showForm && isAdmin}
    <div class="create-form">
      <div class="form-row">
        <div class="form-field">
          <label class="form-label" for="credLabel">Label</label>
          <Input
            id="credLabel"
            placeholder="ex: Produção, Staging..."
            bind:value={formLabel}
            disabled={submitting}
          />
        </div>

        <div class="form-field">
          <label class="form-label" for="credEnv">Ambiente</label>
          <Select.Root
            type="single"
            value={formEnv}
            onValueChange={(v) => v && (formEnv = v as CredentialEnvironment)}
          >
            <Select.Trigger id="credEnv">
              {envLabel}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="LIVE">LIVE — Produção</Select.Item>
              <Select.Item value="TEST">TEST — Testes</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      {#if formError}
        <p class="form-error">{formError}</p>
      {/if}

      <Button
        onclick={handleCreateCredential}
        disabled={submitting || !formLabel.trim()}
      >
        {submitting ? 'Criando...' : 'Criar Credencial'}
      </Button>
    </div>
  {/if}

  <!-- Lista de credenciais -->
  {#if credentials.length === 0}
    <div class="empty-state">
      <p class="empty-text">Nenhuma credencial criada para este merchant.</p>
    </div>
  {:else}
    <div class="creds-list">
      {#each credentials as cred (cred.id)}
        <div class="cred-card">
          <div class="cred-main">
            <div class="cred-info">
              <span class="cred-label">{cred.label}</span>
              <code class="cred-public">{truncateKey(cred.publicKey)}</code>
            </div>
            <div class="cred-badges">
              <span class="env-badge env-badge--{cred.environment.toLowerCase()}">
                {cred.environment}
              </span>
              <span class="active-badge" class:active-badge--on={cred.isActive}>
                {cred.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>

          <div class="cred-meta">
            <span class="cred-last4">
              Chave: ...{cred.secretKeyLast4}
            </span>
            {#if cred.lastUsedAt}
              <span class="cred-used">
                Último uso: {formatDate(cred.lastUsedAt)}
              </span>
            {:else}
              <span class="cred-used cred-used--never">Nunca utilizada</span>
            {/if}
            <span class="cred-created">
              Criada: {formatDate(cred.createdAt)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- SecretKey modal — exibe apenas uma vez após criação -->
{#if newCred && modalOpen}
  <SecretKeyModal
    open={modalOpen}
    publicKey={newCred.publicKey}
    secretKey={newCred.secretKey}
    onClose={handleModalClose}
  />
{/if}

<style>
  .creds-tab { display: flex; flex-direction: column; gap: 20px; }

  .creds-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .creds-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.40);
    letter-spacing: 0.08em;
  }

  /* Create form */
  .create-form {
    background: rgba(1, 250, 251, 0.02);
    border: 1px solid rgba(1, 250, 251, 0.10);
    border-radius: 8px;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
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
  }

  /* Empty state */
  .empty-state { padding: 40px; text-align: center; }
  .empty-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(218, 212, 196, 0.30);
  }

  /* Credentials list */
  .creds-list { display: flex; flex-direction: column; gap: 8px; }

  .cred-card {
    background: #0a0910;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: border-color 0.18s;
  }
  .cred-card:hover { border-color: rgba(255,255,255,0.12); }

  .cred-main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .cred-info { display: flex; flex-direction: column; gap: 4px; }
  .cred-label {
    font-size: 14px;
    font-weight: 600;
    color: rgba(218, 212, 196, 0.85);
  }
  .cred-public {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(218, 212, 196, 0.45);
  }

  .cred-badges { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }

  .env-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.10em;
    text-transform: uppercase;
  }
  .env-badge--live {
    background: rgba(1, 250, 251, 0.08);
    color: var(--color-brand-cyan, #01FAFB);
    border: 1px solid rgba(1, 250, 251, 0.20);
  }
  .env-badge--test {
    background: rgba(218, 168, 80, 0.08);
    color: rgba(218, 168, 80, 0.80);
    border: 1px solid rgba(218, 168, 80, 0.20);
  }

  .active-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    background: rgba(218, 212, 196, 0.05);
    color: rgba(218, 212, 196, 0.35);
    border: 1px solid rgba(218, 212, 196, 0.10);
  }
  .active-badge--on {
    background: rgba(80, 200, 120, 0.08);
    color: rgba(80, 200, 120, 0.80);
    border-color: rgba(80, 200, 120, 0.20);
  }

  .cred-meta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .cred-last4, .cred-used, .cred-created {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: rgba(218, 212, 196, 0.35);
    letter-spacing: 0.06em;
  }
  .cred-used--never { color: rgba(218, 212, 196, 0.22); font-style: italic; }
</style>
