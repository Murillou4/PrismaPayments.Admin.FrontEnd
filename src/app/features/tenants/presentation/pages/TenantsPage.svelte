<script lang="ts">
  import { Building2, Plus, RefreshCw } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import MetricPanel from '$appmod/shared/widgets/MetricPanel.svelte';
  import ActionToolbar from '$appmod/shared/widgets/ActionToolbar.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import CopyButton from '$appmod/shared/widgets/CopyButton.svelte';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import { appServices } from '$core/service_locator/dependencies';
  import type { Tenant, TenantCreated, TenantStatus } from '../../domain/entities/Tenant';

  const service = appServices.tenants();

  let items = $state<Tenant[]>([]);
  let total = $state(0);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');
  let statusFilter = $state<TenantStatus | ''>('');
  let showCreate = $state(false);
  let createdTenant = $state<TenantCreated | null>(null);
  let logo = $state<File | null>(null);
  let favicon = $state<File | null>(null);
  let form = $state({
    name: '',
    slug: '',
    displayName: '',
    primaryColor: '#FF00FF',
    secondaryColor: '#722283',
    accentColor: '#01FAFB',
    supportEmail: '',
    websiteUrl: '',
    customDomain: '',
    checkoutHeadline: '',
    checkoutDescription: ''
  });

  const activeCount = $derived(items.filter((tenant) => tenant.status === 'ACTIVE').length);
  const suspendedCount = $derived(items.filter((tenant) => tenant.status === 'SUSPENDED').length);
  const blockedCount = $derived(items.filter((tenant) => tenant.status === 'BLOCKED').length);

  async function loadTenants() {
    loading = true;
    error = '';
    const result = await service.list({ status: statusFilter });
    loading = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    items = result.value.items ?? [];
    total = result.value.total ?? items.length;
  }

  function slugify(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function updateSlugFromName() {
    if (!form.slug.trim()) {
      form.slug = slugify(form.name);
    }
  }

  function resetForm() {
    form = {
      name: '',
      slug: '',
      displayName: '',
      primaryColor: '#FF00FF',
      secondaryColor: '#722283',
      accentColor: '#01FAFB',
      supportEmail: '',
      websiteUrl: '',
      customDomain: '',
      checkoutHeadline: '',
      checkoutDescription: ''
    };
    logo = null;
    favicon = null;
  }

  async function createTenant() {
    saving = true;
    error = '';
    const result = await service.create({
      name: form.name,
      slug: form.slug,
      branding: {
        displayName: form.displayName,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        supportEmail: form.supportEmail,
        websiteUrl: form.websiteUrl,
        customDomain: form.customDomain,
        checkoutHeadline: form.checkoutHeadline,
        checkoutDescription: form.checkoutDescription
      },
      logo,
      favicon
    });
    saving = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    createdTenant = result.value;
    showCreate = false;
    resetForm();
    await loadTenants();
  }

  $effect(() => {
    void statusFilter;
    loadTenants();
  });
</script>

<PageShell
  eyebrow="SUPER ADMIN"
  title="Tenants"
  subtitle="Crie marcas isoladas, ajuste o branding de checkout e capture o client secret inicial no momento certo."
  wide
>
  {#snippet actions()}
    <button class="ghost" type="button" onclick={loadTenants}><RefreshCw size={15} /> Atualizar</button>
    <button class="primary" type="button" onclick={() => (showCreate = !showCreate)}><Plus size={15} /> Novo tenant</button>
  {/snippet}

  <div class="metrics">
    <MetricPanel label="Total" value={total} tone="cyan" caption="Tenants cadastrados">
      {#snippet icon()}<Building2 size={16} />{/snippet}
    </MetricPanel>
    <MetricPanel label="Ativos" value={activeCount} tone="success" />
    <MetricPanel label="Suspensos" value={suspendedCount} tone="warning" />
    <MetricPanel label="Bloqueados" value={blockedCount} tone="danger" />
  </div>

  <ActionToolbar>
    <label class="filter">
      <span>Status</span>
      <select bind:value={statusFilter}>
        <option value="">Todos</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="SUSPENDED">SUSPENDED</option>
        <option value="BLOCKED">BLOCKED</option>
      </select>
    </label>
  </ActionToolbar>

  {#if showCreate}
    <section class="form-panel">
      <header>
        <div>
          <p>Novo tenant</p>
          <h2>Provisionamento multi-tenant</h2>
        </div>
        <button class="ghost" type="button" onclick={() => (showCreate = false)}>Fechar</button>
      </header>

      <div class="form-grid">
        <label><span>Nome</span><input bind:value={form.name} onblur={updateSlugFromName} /></label>
        <label><span>Slug</span><input bind:value={form.slug} /></label>
        <label><span>Display name</span><input bind:value={form.displayName} /></label>
        <label><span>Dominio custom</span><input bind:value={form.customDomain} placeholder="pay.marca.com" /></label>
        <label><span>Email suporte</span><input bind:value={form.supportEmail} type="email" /></label>
        <label><span>Website</span><input bind:value={form.websiteUrl} placeholder="https://..." /></label>
        <label><span>Cor primaria</span><input bind:value={form.primaryColor} type="color" /></label>
        <label><span>Cor secundaria</span><input bind:value={form.secondaryColor} type="color" /></label>
        <label><span>Cor destaque</span><input bind:value={form.accentColor} type="color" /></label>
        <label><span>Logo</span><input type="file" accept="image/*" onchange={(event) => (logo = event.currentTarget.files?.[0] ?? null)} /></label>
        <label><span>Favicon</span><input type="file" accept="image/*" onchange={(event) => (favicon = event.currentTarget.files?.[0] ?? null)} /></label>
        <label class="span-2"><span>Headline checkout</span><input bind:value={form.checkoutHeadline} /></label>
        <label class="span-2"><span>Descricao checkout</span><textarea bind:value={form.checkoutDescription}></textarea></label>
      </div>

      <div class="preview" style:--tenant-primary={form.primaryColor} style:--tenant-accent={form.accentColor}>
        <div>
          <span>Preview</span>
          <strong>{form.displayName || form.name || 'Nova marca'}</strong>
          <small>{form.checkoutHeadline || 'Checkout seguro Prisma'}</small>
        </div>
        <button type="button">Pagar agora</button>
      </div>

      <footer>
        <button class="primary" type="button" onclick={createTenant} disabled={saving}>
          {saving ? 'Criando...' : 'Criar e gerar secret'}
        </button>
      </footer>
    </section>
  {/if}

  {#if error}
    <div class="notice notice--error">{error}</div>
  {/if}

  <section class="table-card">
    {#if loading}
      <div class="empty">Carregando tenants...</div>
    {:else if items.length === 0}
      <div class="empty">Nenhum tenant encontrado para os filtros atuais.</div>
    {:else}
      <div class="table">
        <div class="row head">
          <span>Tenant</span>
          <span>Status</span>
          <span>Client key</span>
          <span>Branding</span>
          <span>Criado</span>
        </div>
        {#each items as tenant}
          <a class="row" href={`/tenants/${tenant.id}`}>
            <span>
              <strong>{tenant.name}</strong>
              <small>{tenant.slug}</small>
            </span>
            <span><StatusBadge status={tenant.status} /></span>
            <span class="mono">{tenant.clientKey ?? '-'}</span>
            <span class="colors">
              <i style:background={tenant.branding?.primaryColor ?? '#FF00FF'}></i>
              <i style:background={tenant.branding?.secondaryColor ?? '#722283'}></i>
              <i style:background={tenant.branding?.accentColor ?? '#01FAFB'}></i>
            </span>
            <span>{formatDate(tenant.createdAt)}</span>
          </a>
        {/each}
      </div>
    {/if}
  </section>

  {#if createdTenant}
    <div class="modal-backdrop">
      <section class="secret-modal">
        <p>Secret gerado</p>
        <h2>{createdTenant.name}</h2>
        <span>Este valor aparece apenas agora. Copie antes de fechar.</span>
        <div class="secret-line">
          <code>{createdTenant.clientSecret}</code>
          {#if createdTenant.clientSecret}
            <CopyButton value={createdTenant.clientSecret} label="Copiar secret" />
          {/if}
        </div>
        <div class="secret-line">
          <code>{createdTenant.clientKey}</code>
          {#if createdTenant.clientKey}
            <CopyButton value={createdTenant.clientKey} label="Copiar key" />
          {/if}
        </div>
        <button class="primary" type="button" onclick={() => (createdTenant = null)}>Entendi</button>
      </section>
    </div>
  {/if}
</PageShell>

<style>
  .metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  button,
  select,
  input,
  textarea {
    font: inherit;
  }

  .primary,
  .ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 13px;
    border-radius: 11px;
    font-weight: 750;
    cursor: pointer;
  }

  .primary {
    border: 1px solid rgba(255, 0, 255, 0.32);
    color: var(--color-foreground);
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.18), rgba(1, 250, 251, 0.08));
  }

  .ghost {
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--color-foreground-secondary);
    background: rgba(255, 255, 255, 0.035);
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .filter {
    display: grid;
    gap: 7px;
  }

  .filter span,
  label span {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  select,
  input,
  textarea {
    min-height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 11px;
    background: #09090f;
    color: var(--color-foreground);
    outline: none;
  }

  select,
  input {
    padding: 0 12px;
  }

  textarea {
    min-height: 86px;
    padding: 10px 12px;
    resize: vertical;
  }

  .form-panel,
  .table-card,
  .secret-modal {
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
  }

  .form-panel {
    margin-bottom: 16px;
    padding: 18px;
  }

  .form-panel header,
  .form-panel footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .form-panel header {
    margin-bottom: 16px;
  }

  .form-panel footer {
    margin-top: 16px;
  }

  .form-panel p,
  .secret-modal p {
    margin: 0 0 5px;
    color: var(--color-brand-cyan);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px;
  }

  label {
    display: grid;
    gap: 7px;
  }

  .span-2 {
    grid-column: span 2;
  }

  .preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
    padding: 16px;
    border: 1px solid color-mix(in srgb, var(--tenant-primary) 30%, transparent);
    border-radius: 14px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--tenant-primary) 14%, transparent), color-mix(in srgb, var(--tenant-accent) 8%, transparent));
  }

  .preview div {
    display: grid;
    gap: 4px;
  }

  .preview span,
  .preview small {
    color: var(--color-foreground-secondary);
  }

  .preview strong {
    font-size: 1.18rem;
  }

  .preview button {
    border: 1px solid color-mix(in srgb, var(--tenant-accent) 45%, transparent);
    color: var(--color-foreground);
    background: color-mix(in srgb, var(--tenant-primary) 22%, #08080d);
  }

  .notice {
    margin-bottom: 14px;
    padding: 12px 14px;
    border-radius: 13px;
    font-size: 0.88rem;
  }

  .notice--error {
    border: 1px solid rgba(255, 59, 92, 0.2);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.08);
  }

  .table-card {
    overflow: hidden;
  }

  .table {
    min-width: 900px;
  }

  .row {
    display: grid;
    grid-template-columns: 1.5fr 0.72fr 1.2fr 0.75fr 0.9fr;
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.065);
    color: var(--color-foreground);
    text-decoration: none;
  }

  .row:not(.head):hover {
    background: rgba(255, 255, 255, 0.035);
  }

  .head {
    color: var(--color-foreground-secondary);
    background: #0a0a0f;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .row strong,
  .row small {
    display: block;
  }

  .row small {
    margin-top: 4px;
    color: var(--color-foreground-secondary);
  }

  .mono,
  code {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    word-break: break-all;
  }

  .colors {
    display: flex;
    gap: 8px;
  }

  .colors i {
    width: 22px;
    height: 22px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
  }

  .empty {
    padding: 44px 20px;
    color: var(--color-foreground-secondary);
    text-align: center;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.62);
    backdrop-filter: blur(12px);
  }

  .secret-modal {
    width: min(100%, 560px);
    padding: 22px;
  }

  .secret-modal span {
    display: block;
    margin: 8px 0 16px;
    color: var(--color-foreground-secondary);
  }

  .secret-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    background: #08080d;
  }

  @media (max-width: 960px) {
    .metrics,
    .form-grid {
      grid-template-columns: 1fr;
    }

    .span-2 {
      grid-column: span 1;
    }

    .table-card {
      overflow-x: auto;
    }
  }
</style>
