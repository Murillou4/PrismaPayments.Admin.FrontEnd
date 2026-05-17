<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { toast } from 'svelte-sonner';
  import { Plus, RefreshCw, ShieldCheck, UserX } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import MetricPanel from '$appmod/shared/widgets/MetricPanel.svelte';
  import ActionToolbar from '$appmod/shared/widgets/ActionToolbar.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { appServices } from '$core/service_locator/dependencies';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import type { AdminUser, AdminUserRole } from '../../domain/entities/AdminUser';

  const service = appServices.adminUsers();
  const roles: AdminUserRole[] = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'VIEWER'];

  let items = $state<AdminUser[]>([]);
  let total = $state(0);
  let loading = $state(true);
  let saving = $state(false);
  let error = $state<string | null>(null);
  let editing = $state<AdminUser | null>(null);
  let mode = $state<'create' | 'edit'>('create');

  let form = $state({
    name: '',
    email: '',
    password: '',
    role: 'SUPPORT' as AdminUserRole,
    isActive: true
  });

  const canManage = $derived(hasPermission($page.data.adminRole as AdminRole, 'SUPER_ADMIN'));
  const activeCount = $derived(items.filter((item) => item.isActive).length);
  const twoFactorCount = $derived(items.filter((item) => item.twoFactorEnabled).length);

  function resetForm() {
    mode = 'create';
    editing = null;
    form = { name: '', email: '', password: '', role: 'SUPPORT', isActive: true };
  }

  function editUser(user: AdminUser) {
    mode = 'edit';
    editing = user;
    form = {
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    };
  }

  async function load() {
    loading = true;
    error = null;
    const result = await service.list({ page: 1, limit: 100 });
    if (result.ok) {
      items = result.value.items ?? [];
      total = result.value.total ?? items.length;
    } else {
      error = result.failure.message;
    }
    loading = false;
  }

  async function save() {
    if (!canManage) return;
    saving = true;
    const result = mode === 'create'
      ? await service.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role
        })
      : await service.update(editing!.id, {
          name: form.name,
          role: form.role,
          isActive: form.isActive
        });

    saving = false;
    if (result.ok) {
      toast.success(mode === 'create' ? 'Admin criado.' : 'Admin atualizado.');
      resetForm();
      await load();
    } else {
      toast.error(result.failure.message);
    }
  }

  async function deactivate(user: AdminUser) {
    if (!canManage || !confirm(`Desativar ${user.email}?`)) return;
    const result = await service.deactivate(user.id);
    if (result.ok) {
      toast.success('Admin desativado.');
      await load();
    } else {
      toast.error(result.failure.message);
    }
  }

  onMount(load);
</script>

<PageShell
  eyebrow="SUPER ADMIN"
  title="Administradores"
  subtitle="Controle de acesso interno, papeis administrativos e postura de seguranca do time."
  wide
>
  {#snippet actions()}
    <Button variant="outline" onclick={load} disabled={loading}>
      <RefreshCw size={14} strokeWidth={1.5} />
      Atualizar
    </Button>
  {/snippet}

  <div class="metrics">
    <MetricPanel label="Admins" value={total} tone="cyan">
      {#snippet icon()}<ShieldCheck size={15} strokeWidth={1.5} />{/snippet}
    </MetricPanel>
    <MetricPanel label="Ativos" value={activeCount} tone="success" />
    <MetricPanel label="Com 2FA" value={twoFactorCount} tone="magenta" />
  </div>

  <div class="grid">
    <section class="panel">
      <ActionToolbar>
        <strong class="panel-title">Usuarios</strong>
      </ActionToolbar>

      {#if loading}
        <div class="state">Carregando admins...</div>
      {:else if error}
        <div class="state state--error">{error}</div>
      {:else if items.length === 0}
        <div class="state">Nenhum admin cadastrado.</div>
      {:else}
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Role</th>
                <th>2FA</th>
                <th>Atualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each items as user}
                <tr>
                  <td>
                    <strong>{user.name}</strong>
                    <small>{user.id}</small>
                  </td>
                  <td>{user.email}</td>
                  <td><StatusBadge status={user.role} /></td>
                  <td>
                    <span class:ok={user.twoFactorEnabled}>
                      {user.twoFactorEnabled ? 'Ativo' : 'Nao ativo'}
                    </span>
                  </td>
                  <td>{formatDate(user.updatedAt)}</td>
                  <td class="actions-cell">
                    <Button size="sm" variant="outline" onclick={() => editUser(user)}>Editar</Button>
                    {#if user.isActive}
                      <Button size="sm" variant="destructive" onclick={() => deactivate(user)}>
                        <UserX size={13} strokeWidth={1.5} />
                      </Button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>

    <aside class="panel form-panel">
      <div class="form-head">
        <div>
          <p>{mode === 'create' ? 'Novo admin' : 'Editar admin'}</p>
          <strong>{mode === 'create' ? 'Criar acesso' : editing?.email}</strong>
        </div>
        {#if mode === 'edit'}
          <Button size="sm" variant="ghost" onclick={resetForm}>Limpar</Button>
        {/if}
      </div>

      {#if !canManage}
        <div class="state">Seu role nao permite gerenciar administradores.</div>
      {:else}
        <form class="form" onsubmit={(event) => { event.preventDefault(); save(); }}>
          <label>
            Nome
            <Input bind:value={form.name} placeholder="Nome completo" />
          </label>
          <label>
            E-mail
            <Input bind:value={form.email} type="email" placeholder="admin@prisma.local" disabled={mode === 'edit'} />
          </label>
          {#if mode === 'create'}
            <label>
              Senha inicial
              <Input bind:value={form.password} type="password" placeholder="Minimo 8 caracteres" />
            </label>
          {/if}
          <label>
            Role
            <select bind:value={form.role}>
              {#each roles as roleOption}
                <option value={roleOption}>{roleOption}</option>
              {/each}
            </select>
          </label>
          {#if mode === 'edit'}
            <label class="check">
              <input type="checkbox" bind:checked={form.isActive} />
              <span>Admin ativo</span>
            </label>
          {/if}
          <Button type="submit" disabled={saving}>
            <Plus size={14} strokeWidth={1.5} />
            {saving ? 'Salvando...' : mode === 'create' ? 'Criar admin' : 'Salvar alteracoes'}
          </Button>
        </form>
      {/if}
    </aside>
  </div>
</PageShell>

<style>
  .metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 18px;
  }

  .grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 18px;
    align-items: start;
  }

  .panel {
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 18px;
    background: rgba(15, 15, 24, 0.82);
    box-shadow: 0 22px 54px rgba(0, 0, 0, 0.22);
    overflow: hidden;
  }

  .panel-title {
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: 1rem;
  }

  .table-wrap {
    overflow: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    text-align: left;
    white-space: nowrap;
  }

  th {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  td {
    color: var(--color-foreground);
    font-size: 0.88rem;
  }

  td small,
  td span {
    display: block;
    color: var(--color-foreground-secondary);
    font-size: 0.74rem;
  }

  td span.ok {
    color: var(--color-success);
  }

  .actions-cell {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .state {
    padding: 34px;
    color: var(--color-foreground-secondary);
    text-align: center;
  }

  .state--error {
    color: var(--color-danger);
  }

  .form-panel {
    padding: 18px;
  }

  .form-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .form-head p,
  .form-head strong {
    margin: 0;
  }

  .form-head p,
  label {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .form-head strong {
    color: var(--color-foreground);
    font-size: 1rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  select {
    min-height: 38px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    background: var(--color-surface-overlay);
    color: var(--color-foreground);
    padding: 0 10px;
  }

  .check {
    flex-direction: row;
    align-items: center;
    letter-spacing: 0;
    text-transform: none;
    font-family: var(--font-body);
    font-size: 0.9rem;
  }

  @media (max-width: 1050px) {
    .grid,
    .metrics {
      grid-template-columns: 1fr;
    }
  }
</style>
