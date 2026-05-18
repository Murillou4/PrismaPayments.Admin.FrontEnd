<script lang="ts">
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import {
    Activity,
    AlertTriangle,
    ArrowDownToLine,
    BookOpen,
    Building2,
    CreditCard,
    Gauge,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Plug,
    ScanFace,
    Search,
    Settings2,
    ShieldCheck,
    SlidersHorizontal,
    UserCog,
    Users,
    X
  } from 'lucide-svelte';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import { appServices } from '$core/service_locator/dependencies';
  import type { AdminCurrentUser, SearchResultItem } from '$appmod/features/platform/domain/entities/Platform';

  let {
    content,
    role,
    admin
  }: {
    content: Snippet;
    role: string | null;
    admin?: AdminCurrentUser | null;
  } = $props();

  let pendingKYCCount = $state(0);
  let query = $state('');
  let searchOpen = $state(false);
  let searching = $state(false);
  let searchItems = $state<SearchResultItem[]>([]);
  let searchError = $state<string | null>(null);
  let searchTimer: number | null = null;

  const merchantService = appServices.merchants();
  const platformService = appServices.platform();

  const isPendingActive = $derived(
    $page.url.pathname === '/merchants' &&
    $page.url.searchParams.get('verification') === 'PENDING_REVIEW'
  );
  const isTxnActive = $derived($page.url.pathname.startsWith('/transactions'));

  const navSections = $derived.by(() => {
    const userRole = role as AdminRole | null;
    return [
      {
        label: 'Operacao',
        items: [
          { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, minRole: 'VIEWER', badge: 0 },
          { href: '/merchants', label: 'Merchants', Icon: Users, minRole: 'VIEWER', badge: 0 },
          { href: '/merchants?verification=PENDING_REVIEW', label: 'KYC pendente', Icon: ScanFace, minRole: 'SUPPORT', badge: pendingKYCCount },
          { href: '/disputes', label: 'Disputas', Icon: AlertTriangle, minRole: 'SUPPORT', badge: 0 }
        ].filter((item) => hasPermission(userRole, item.minRole as AdminRole))
      },
      {
        label: 'Financeiro',
        items: [
          { href: '/transactions/payments', label: 'Pagamentos', Icon: CreditCard, minRole: 'SUPPORT', badge: 0 },
          { href: '/transactions/withdrawals', label: 'Saques', Icon: ArrowDownToLine, minRole: 'SUPPORT', badge: 0 },
          { href: '/fees', label: 'Taxas', Icon: SlidersHorizontal, minRole: 'VIEWER', badge: 0 },
          { href: '/providers', label: 'Provedores', Icon: Plug, minRole: 'SUPPORT', badge: 0 }
        ].filter((item) => hasPermission(userRole, item.minRole as AdminRole))
      },
      {
        label: 'Plataforma',
        items: [
          { href: '/tenants', label: 'Tenants', Icon: Building2, minRole: 'SUPER_ADMIN', badge: 0 },
          { href: '/admin-users', label: 'Admins', Icon: UserCog, minRole: 'SUPER_ADMIN', badge: 0 },
          { href: '/audit', label: 'Auditoria', Icon: BookOpen, minRole: 'SUPPORT', badge: 0 },
          { href: '/diagnostics', label: 'Dev Logs', Icon: Activity, minRole: 'ADMIN', badge: 0 },
          { href: '/config', label: 'Configuracao', Icon: Settings2, minRole: 'ADMIN', badge: 0 },
          { href: '/settings/security', label: 'Seguranca', Icon: LockKeyhole, minRole: 'VIEWER', badge: 0 }
        ].filter((item) => hasPermission(userRole, item.minRole as AdminRole))
      }
    ].filter((section) => section.items.length > 0);
  });

  const userInitials = $derived.by(() => {
    const name = admin?.name || admin?.email || 'Admin';
    return name
      .split(/[ @.]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AD';
  });

  const activeLabel = $derived.by(() => {
    if (isTxnActive) return 'Transacoes';
    for (const section of navSections) {
      const found = section.items.find((item) => {
        const hrefPath = item.href.split('?')[0];
        return hrefPath !== '/' && $page.url.pathname.startsWith(hrefPath);
      });
      if (found) return found.label;
    }
    return 'Prisma Pay';
  });

  onMount(async () => {
    const result = await merchantService.getPendingKYCCount();
    if (result.ok) pendingKYCCount = result.value;
  });

  function isActive(href: string): boolean {
    const [path, qs] = href.split('?');
    if ($page.url.pathname !== path && !$page.url.pathname.startsWith(`${path}/`)) return false;
    if (!qs) return true;
    return $page.url.search === `?${qs}`;
  }

  function destinationFor(item: SearchResultItem): string {
    const type = String(item.type ?? '').toLowerCase();
    const id = item.id ?? '';
    if (!id) return '/dashboard';
    if (type.includes('merchant')) return `/merchants/${id}`;
    if (type.includes('payment')) return `/transactions/payments/${id}`;
    if (type.includes('withdrawal') || type.includes('saque')) return `/transactions/withdrawals/${id}`;
    if (type.includes('dispute')) return `/disputes/${id}`;
    if (type.includes('tenant')) return `/tenants/${id}`;
    return '/dashboard';
  }

  async function runSearch(value: string) {
    query = value;
    if (searchTimer) window.clearTimeout(searchTimer);
    if (value.trim().length < 2) {
      searchItems = [];
      searchError = null;
      searching = false;
      return;
    }
    searching = true;
    searchTimer = window.setTimeout(async () => {
      const result = await platformService.search(value.trim(), 8);
      searching = false;
      if (result.ok) {
        searchItems = result.value.items ?? [];
        searchError = null;
      } else {
        searchItems = [];
        searchError = result.failure.message;
      }
    }, 220);
  }

  async function openSearchItem(item: SearchResultItem) {
    searchOpen = false;
    query = '';
    searchItems = [];
    await goto(destinationFor(item));
  }
</script>

<div class="admin-shell">
  <aside class="sidebar">
    <div class="brand">
      <img src="/Prisma_Pay_White.svg" alt="Prisma Pay" class="brand__logo" />
      <div class="brand__meta">
        <span>Admin console</span>
        <strong>{role ?? 'VIEWER'}</strong>
      </div>
    </div>

    <button type="button" class="command" onclick={() => (searchOpen = true)}>
      <Search size={15} strokeWidth={1.5} />
      <span>Buscar tudo</span>
      <kbd>Ctrl K</kbd>
    </button>

    <nav class="nav" aria-label="Navegacao principal">
      {#each navSections as section}
        <section class="nav__section">
          <p class="nav__label">{section.label}</p>
          {#each section.items as item}
            {@const Icon = item.Icon}
            {@const active = item.href.includes('?') ? isPendingActive : isActive(item.href)}
            <a href={item.href} class="nav__item" class:nav__item--active={active}>
              <Icon size={16} strokeWidth={1.5} />
              <span>{item.label}</span>
              {#if item.badge && item.badge > 0}
                <em>{item.badge}</em>
              {/if}
            </a>
          {/each}
        </section>
      {/each}
    </nav>

    <div class="sidebar__footer">
      <div class="user-card">
        <div class="user-card__avatar">{userInitials}</div>
        <div class="user-card__body">
          <strong>{admin?.name ?? 'Admin'}</strong>
          <span>{admin?.tenantName ?? admin?.email ?? 'Prisma Payments'}</span>
        </div>
        {#if admin?.twoFactorEnabled}
          <ShieldCheck size={15} strokeWidth={1.5} class="user-card__secure" />
        {/if}
      </div>
      <form method="POST" action="/logout" use:enhance>
        <button type="submit" class="logout">
          <LogOut size={15} strokeWidth={1.5} />
          Sair
        </button>
      </form>
    </div>
  </aside>

  <main id="content" class="main">
    <div class="topbar">
      <div>
        <p>Prisma Payments</p>
        <strong>{activeLabel}</strong>
      </div>
      <button type="button" class="topbar__search" onclick={() => (searchOpen = true)}>
        <Search size={14} strokeWidth={1.5} />
        Buscar
      </button>
    </div>
    {@render content()}
  </main>
</div>

{#if searchOpen}
  <div class="search-overlay" role="dialog" aria-modal="true">
    <div class="search-modal">
      <div class="search-box">
        <Search size={18} strokeWidth={1.5} />
        <input
          value={query}
          placeholder="Merchant, pagamento, saque, disputa..."
          oninput={(event) => runSearch(event.currentTarget.value)}
          onkeydown={(event) => {
            if (event.key === 'Escape') searchOpen = false;
          }}
        />
        <button type="button" onclick={() => (searchOpen = false)} aria-label="Fechar busca">
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div class="search-results">
        {#if searching}
          <p class="search-state">Buscando...</p>
        {:else if searchError}
          <p class="search-state search-state--error">{searchError}</p>
        {:else if query.trim().length < 2}
          <p class="search-state">Digite pelo menos 2 caracteres.</p>
        {:else if searchItems.length === 0}
          <p class="search-state">Nenhum resultado encontrado.</p>
        {:else}
          {#each searchItems as item}
            <button type="button" class="search-item" onclick={() => openSearchItem(item)}>
              <Gauge size={15} strokeWidth={1.5} />
              <span>
                <strong>{item.label ?? item.id}</strong>
                <small>{item.type ?? 'Registro'} - {item.description ?? item.id}</small>
              </span>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .admin-shell {
    display: grid;
    grid-template-columns: 274px minmax(0, 1fr);
    min-height: 100dvh;
    color: var(--color-foreground);
    background:
      radial-gradient(circle at 18% 0%, rgba(255, 0, 255, 0.065), transparent 27rem),
      radial-gradient(circle at 85% 12%, rgba(1, 250, 251, 0.055), transparent 25rem),
      linear-gradient(135deg, #070707 0%, #0a0a0f 46%, #090910 100%);
  }

  .admin-shell::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0.18;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: 52px 52px;
    mask-image: linear-gradient(180deg, black, transparent 72%);
  }

  .sidebar {
    position: sticky;
    top: 0;
    z-index: 2;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(9, 9, 16, 0.88);
    backdrop-filter: blur(20px);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 20px 18px 17px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.075);
  }

  .brand__logo {
    width: 116px;
    height: auto;
    display: block;
  }

  .brand__meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-left: auto;
    text-align: right;
  }

  .brand__meta span,
  .nav__label {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .brand__meta strong {
    color: var(--color-brand-cyan);
    font-size: 0.72rem;
  }

  .command {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 9px;
    margin: 16px 14px 10px;
    min-height: 40px;
    padding: 0 10px;
    border: 1px solid rgba(1, 250, 251, 0.16);
    border-radius: 13px;
    background: rgba(1, 250, 251, 0.045);
    color: var(--color-foreground-secondary);
    cursor: pointer;
    text-align: left;
    transition: color 0.18s, background 0.18s, border-color 0.18s, transform 0.18s;
  }

  .command:hover,
  .topbar__search:hover {
    color: var(--color-foreground);
    background: rgba(1, 250, 251, 0.075);
    border-color: rgba(1, 250, 251, 0.25);
    transform: translateY(-1px);
  }

  .command kbd {
    color: #70708a;
    font-family: var(--font-mono);
    font-size: 0.62rem;
  }

  .nav {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 6px 12px 14px;
  }

  .nav__section {
    margin-top: 18px;
  }

  .nav__label {
    margin: 0 0 7px 10px;
  }

  .nav__item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 38px;
    padding: 0 10px;
    border: 1px solid transparent;
    border-radius: 12px;
    color: var(--color-foreground-secondary);
    font-size: 0.88rem;
    font-weight: 560;
    text-decoration: none;
    transition: color 0.18s, background 0.18s, border-color 0.18s, transform 0.18s;
  }

  .nav__item:hover {
    color: var(--color-foreground);
    background: rgba(255, 255, 255, 0.045);
    transform: translateX(2px);
  }

  .nav__item--active {
    color: var(--color-foreground);
    border-color: rgba(255, 0, 255, 0.2);
    background:
      linear-gradient(135deg, rgba(255, 0, 255, 0.09), rgba(1, 250, 251, 0.045)),
      rgba(255, 255, 255, 0.035);
    box-shadow: inset 2px 0 0 rgba(255, 0, 255, 0.8);
  }

  .nav__item em {
    margin-left: auto;
    min-width: 20px;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(1, 250, 251, 0.1);
    color: var(--color-brand-cyan);
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-style: normal;
    text-align: center;
  }

  .sidebar__footer {
    padding: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.075);
  }

  .user-card {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.03);
  }

  .user-card__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.18), rgba(1, 250, 251, 0.12));
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: 0.82rem;
    font-weight: 800;
  }

  .user-card__body {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .user-card__body strong,
  .user-card__body span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-card__body strong {
    color: var(--color-foreground);
    font-size: 0.82rem;
  }

  .user-card__body span {
    color: var(--color-foreground-secondary);
    font-size: 0.72rem;
  }

  :global(.user-card__secure) {
    color: var(--color-success);
  }

  .logout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 38px;
    margin-top: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: transparent;
    color: var(--color-foreground-secondary);
    cursor: pointer;
    transition: color 0.18s, background 0.18s, border-color 0.18s;
  }

  .logout:hover {
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.06);
    border-color: rgba(255, 59, 92, 0.18);
  }

  .main {
    position: relative;
    z-index: 1;
    min-width: 0;
    min-height: 100dvh;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    padding: 0 32px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(7, 7, 7, 0.72);
    backdrop-filter: blur(16px);
  }

  .topbar p,
  .topbar strong {
    margin: 0;
  }

  .topbar p {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .topbar strong {
    display: block;
    color: var(--color-foreground);
    font-size: 0.92rem;
  }

  .topbar__search {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.03);
    color: var(--color-foreground-secondary);
    cursor: pointer;
    transition: all 0.18s;
  }

  .search-overlay {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    justify-content: center;
    padding-top: 12vh;
    background: rgba(0, 0, 0, 0.62);
    backdrop-filter: blur(10px);
  }

  .search-modal {
    width: min(720px, calc(100vw - 28px));
  }

  .search-box {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border: 1px solid rgba(1, 250, 251, 0.22);
    border-radius: 18px 18px 0 0;
    background: #0f0f18;
    color: var(--color-brand-cyan);
  }

  .search-box input {
    width: 100%;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-foreground);
    font-size: 1rem;
  }

  .search-box button {
    border: none;
    background: transparent;
    color: var(--color-foreground-secondary);
    cursor: pointer;
  }

  .search-results {
    min-height: 160px;
    max-height: 56vh;
    overflow: auto;
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-top: none;
    border-radius: 0 0 18px 18px;
    background: rgba(15, 15, 24, 0.98);
  }

  .search-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 11px;
    width: 100%;
    padding: 12px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--color-foreground);
    cursor: pointer;
    text-align: left;
  }

  .search-item:hover {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.045);
  }

  .search-item span {
    min-width: 0;
  }

  .search-item strong,
  .search-item small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .search-item small,
  .search-state {
    color: var(--color-foreground-secondary);
  }

  .search-state {
    margin: 34px 0;
    text-align: center;
    font-size: 0.9rem;
  }

  .search-state--error {
    color: var(--color-danger);
  }

  @media (max-width: 980px) {
    .admin-shell {
      grid-template-columns: 1fr;
    }

    .sidebar {
      position: relative;
      height: auto;
    }

    .nav {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      max-height: none;
    }
  }

  @media (max-width: 720px) {
    .topbar {
      padding: 0 14px;
    }
  }
</style>
