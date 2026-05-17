<script lang="ts">
  import { page } from '$app/state';
  import { ArrowLeft, RefreshCw, Save } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import CopyButton from '$appmod/shared/widgets/CopyButton.svelte';
  import JsonPanel from '$appmod/shared/widgets/JsonPanel.svelte';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import { appServices } from '$core/service_locator/dependencies';
  import type { Tenant, TenantStatus } from '../../domain/entities/Tenant';

  const service = appServices.tenants();
  const tenantId = $derived(page.params.id ?? '');

  let tenant = $state<Tenant | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state('');
  let message = $state('');
  let logo = $state<File | null>(null);
  let favicon = $state<File | null>(null);
  let form = $state({
    name: '',
    slug: '',
    status: 'ACTIVE' as TenantStatus,
    displayName: '',
    primaryColor: '#FF00FF',
    secondaryColor: '#722283',
    accentColor: '#01FAFB',
    supportEmail: '',
    supportPhone: '',
    websiteUrl: '',
    customDomain: '',
    checkoutHeadline: '',
    checkoutDescription: '',
    customCss: ''
  });

  async function loadTenant() {
    loading = true;
    error = '';
    const result = await service.getById(tenantId);
    loading = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    tenant = result.value;
    form = {
      name: result.value.name,
      slug: result.value.slug,
      status: result.value.status,
      displayName: result.value.branding?.displayName ?? '',
      primaryColor: result.value.branding?.primaryColor ?? '#FF00FF',
      secondaryColor: result.value.branding?.secondaryColor ?? '#722283',
      accentColor: result.value.branding?.accentColor ?? '#01FAFB',
      supportEmail: result.value.branding?.supportEmail ?? '',
      supportPhone: result.value.branding?.supportPhone ?? '',
      websiteUrl: result.value.branding?.websiteUrl ?? '',
      customDomain: result.value.branding?.customDomain ?? '',
      checkoutHeadline: result.value.branding?.checkoutHeadline ?? '',
      checkoutDescription: result.value.branding?.checkoutDescription ?? '',
      customCss: result.value.branding?.customCss ?? ''
    };
  }

  async function saveTenant() {
    saving = true;
    error = '';
    message = '';
    const result = await service.update(tenantId, {
      name: form.name,
      slug: form.slug,
      status: form.status,
      branding: {
        displayName: form.displayName,
        primaryColor: form.primaryColor,
        secondaryColor: form.secondaryColor,
        accentColor: form.accentColor,
        supportEmail: form.supportEmail,
        supportPhone: form.supportPhone,
        websiteUrl: form.websiteUrl,
        customDomain: form.customDomain,
        checkoutHeadline: form.checkoutHeadline,
        checkoutDescription: form.checkoutDescription,
        customCss: form.customCss
      },
      logo,
      favicon
    });
    saving = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    tenant = result.value;
    message = 'Tenant atualizado.';
    logo = null;
    favicon = null;
  }

  $effect(() => {
    if (tenantId) loadTenant();
  });
</script>

<PageShell
  eyebrow="Tenant"
  title={tenant?.name ?? 'Detalhe do tenant'}
  subtitle="Ajuste identidade, status operacional e metadados de suporte consumidos pelo checkout."
  wide
>
  {#snippet actions()}
    <a class="ghost" href="/tenants"><ArrowLeft size={15} /> Voltar</a>
    <button class="ghost" type="button" onclick={loadTenant}><RefreshCw size={15} /> Atualizar</button>
    <button class="primary" type="button" onclick={saveTenant} disabled={saving || !tenant}><Save size={15} /> {saving ? 'Salvando...' : 'Salvar'}</button>
  {/snippet}

  {#if loading}
    <div class="empty">Carregando tenant...</div>
  {:else if error}
    <div class="notice notice--error">{error}</div>
  {:else if tenant}
    {#if message}
      <div class="notice notice--success">{message}</div>
    {/if}

    <div class="detail-grid">
      <section class="panel">
        <header>
          <div>
            <p>Identidade</p>
            <h2>{tenant.name}</h2>
          </div>
          <StatusBadge status={tenant.status} />
        </header>

        <div class="form-grid">
          <label><span>Nome</span><input bind:value={form.name} /></label>
          <label><span>Slug</span><input bind:value={form.slug} /></label>
          <label>
            <span>Status</span>
            <select bind:value={form.status}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </label>
          <label><span>Display name</span><input bind:value={form.displayName} /></label>
          <label><span>Logo</span><input type="file" accept="image/*" onchange={(event) => (logo = event.currentTarget.files?.[0] ?? null)} /></label>
          <label><span>Favicon</span><input type="file" accept="image/*" onchange={(event) => (favicon = event.currentTarget.files?.[0] ?? null)} /></label>
          <label><span>Cor primaria</span><input type="color" bind:value={form.primaryColor} /></label>
          <label><span>Cor secundaria</span><input type="color" bind:value={form.secondaryColor} /></label>
          <label><span>Cor destaque</span><input type="color" bind:value={form.accentColor} /></label>
          <label><span>Email suporte</span><input bind:value={form.supportEmail} /></label>
          <label><span>Telefone suporte</span><input bind:value={form.supportPhone} /></label>
          <label><span>Website</span><input bind:value={form.websiteUrl} /></label>
          <label><span>Dominio custom</span><input bind:value={form.customDomain} /></label>
          <label class="span-2"><span>Headline checkout</span><input bind:value={form.checkoutHeadline} /></label>
          <label class="span-2"><span>Descricao checkout</span><textarea bind:value={form.checkoutDescription}></textarea></label>
          <label class="span-2"><span>CSS custom</span><textarea bind:value={form.customCss}></textarea></label>
        </div>
      </section>

      <aside class="panel side">
        <p>Chaves</p>
        <div class="kv">
          <span>Client key</span>
          <strong>{tenant.clientKey ?? '-'}</strong>
          {#if tenant.clientKey}<CopyButton value={tenant.clientKey} label="Copiar key" />{/if}
        </div>
        <div class="kv">
          <span>Secret last4</span>
          <strong>{tenant.clientSecretLast4 ?? '-'}</strong>
        </div>
        <div class="kv">
          <span>Criado</span>
          <strong>{formatDate(tenant.createdAt)}</strong>
        </div>
        <div class="kv">
          <span>Atualizado</span>
          <strong>{formatDate(tenant.updatedAt)}</strong>
        </div>

        <div class="brand-preview" style:--tenant-primary={form.primaryColor} style:--tenant-accent={form.accentColor}>
          {#if tenant.branding?.logoUrl}
            <img src={tenant.branding.logoUrl} alt={tenant.name} />
          {/if}
          <strong>{form.displayName || form.name}</strong>
          <span>{form.checkoutHeadline || 'Checkout seguro'}</span>
          <button type="button">Pagar</button>
        </div>
      </aside>
    </div>

    <JsonPanel title="Tenant payload" value={tenant} />
  {/if}
</PageShell>

<style>
  .detail-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 16px;
    margin-bottom: 16px;
  }

  .panel {
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  p {
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

  label span,
  .kv span {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .span-2 {
    grid-column: span 2;
  }

  input,
  select,
  textarea,
  button,
  a {
    font: inherit;
  }

  input,
  select,
  textarea {
    min-height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 11px;
    background: #09090f;
    color: var(--color-foreground);
    outline: none;
  }

  input,
  select {
    padding: 0 12px;
  }

  textarea {
    min-height: 92px;
    padding: 10px 12px;
    resize: vertical;
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
    text-decoration: none;
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

  .side {
    display: grid;
    gap: 13px;
    align-content: start;
  }

  .kv {
    display: grid;
    gap: 7px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 13px;
    background: #08080d;
  }

  .kv strong {
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: 0.86rem;
  }

  .brand-preview {
    display: grid;
    gap: 9px;
    margin-top: 4px;
    padding: 16px;
    border: 1px solid color-mix(in srgb, var(--tenant-primary) 30%, transparent);
    border-radius: 14px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--tenant-primary) 14%, transparent), color-mix(in srgb, var(--tenant-accent) 8%, transparent));
  }

  .brand-preview img {
    max-width: 148px;
    max-height: 54px;
    object-fit: contain;
  }

  .brand-preview span {
    color: var(--color-foreground-secondary);
  }

  .brand-preview button {
    min-height: 38px;
    border: 1px solid color-mix(in srgb, var(--tenant-accent) 45%, transparent);
    border-radius: 11px;
    color: var(--color-foreground);
    background: color-mix(in srgb, var(--tenant-primary) 22%, #08080d);
  }

  .notice,
  .empty {
    margin-bottom: 14px;
    padding: 14px;
    border-radius: 13px;
  }

  .notice--error {
    border: 1px solid rgba(255, 59, 92, 0.2);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.08);
  }

  .notice--success {
    border: 1px solid rgba(0, 230, 118, 0.2);
    color: var(--color-success);
    background: rgba(0, 230, 118, 0.08);
  }

  .empty {
    color: var(--color-foreground-secondary);
    background: var(--color-surface);
  }

  @media (max-width: 1050px) {
    .detail-grid,
    .form-grid {
      grid-template-columns: 1fr;
    }

    .span-2 {
      grid-column: span 1;
    }
  }
</style>
