<script lang="ts">
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { parallax } from '$lib/actions/parallax';
  import {
    Activity,
    AlertTriangle,
    ArrowDownToLine,
    Bell,
    BookOpen,
    Building2,
    ChevronRight,
    CreditCard,
    Ellipsis,
    Gauge,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Plug,
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
  let navMoreOpen = $state(false);
  let notificationOpen = $state(false);
  let searchTimer: number | null = null;

  const merchantService = appServices.merchants();
  const platformService = appServices.platform();

  const isTxnActive = $derived($page.url.pathname.startsWith('/transactions'));

  const navSections = $derived.by(() => {
    const userRole = role as AdminRole | null;
    return [
      {
        label: 'Operacao',
        items: [
          { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, minRole: 'VIEWER', badge: 0 },
          { href: '/merchants', label: 'Merchants', Icon: Users, minRole: 'VIEWER', badge: pendingKYCCount },
          { href: '/disputes', label: 'Disputas', Icon: AlertTriangle, minRole: 'SUPPORT', badge: 0 }
        ].filter((item) => hasPermission(userRole, item.minRole as AdminRole))
      },
      {
        label: 'Financeiro',
        items: [
          { href: '/transactions/payments', label: 'Pagamentos', Icon: CreditCard, minRole: 'SUPPORT', badge: 0 },
          { href: '/transactions/withdrawals', label: 'Saques', Icon: ArrowDownToLine, minRole: 'SUPPORT', badge: 0 },
          { href: '/fees', label: 'Taxas', Icon: SlidersHorizontal, minRole: 'VIEWER', badge: 0, collapsed: true },
          { href: '/providers', label: 'Provedores', Icon: Plug, minRole: 'SUPPORT', badge: 0, collapsed: true }
        ].filter((item) => hasPermission(userRole, item.minRole as AdminRole))
      },
      {
        label: 'Plataforma',
        items: [
          { href: '/tenants', label: 'Tenants', Icon: Building2, minRole: 'SUPER_ADMIN', badge: 0, collapsed: true },
          { href: '/admin-users', label: 'Admins', Icon: UserCog, minRole: 'SUPER_ADMIN', badge: 0, collapsed: true },
          { href: '/audit', label: 'Auditoria', Icon: BookOpen, minRole: 'SUPPORT', badge: 0, collapsed: true },
          { href: '/diagnostics', label: 'Dev Logs', Icon: Activity, minRole: 'ADMIN', badge: 0, collapsed: true },
          { href: '/config', label: 'Config', Icon: Settings2, minRole: 'ADMIN', badge: 0, collapsed: true },
          { href: '/settings/security', label: 'Seguranca', Icon: LockKeyhole, minRole: 'VIEWER', badge: 0, collapsed: true }
        ].filter((item) => hasPermission(userRole, item.minRole as AdminRole))
      }
    ].filter((section) => section.items.length > 0);
  });

  const primaryNavItems = $derived.by(() =>
    navSections.flatMap((section) => section.items.filter((item) => !('collapsed' in item && item.collapsed)))
  );

  const secondaryNavItems = $derived.by(() =>
    navSections.flatMap((section) => section.items.filter((item) => 'collapsed' in item && item.collapsed))
  );

  const secondaryNavActive = $derived.by(() =>
    secondaryNavItems.some((item) => isActive(item.href))
  );

  const userInitials = $derived.by(() => {
    const name = admin?.name || admin?.email || 'Admin';
    return name
      .split(/[ @.]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'AD';
  });

  const displayName = $derived(admin?.name ?? admin?.email?.split('@')[0] ?? 'Admin');
  const canReviewKYC = $derived(hasPermission(role as AdminRole | null, 'SUPPORT'));
  const importantTaskCount = $derived(canReviewKYC ? pendingKYCCount : 0);

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

  onMount(() => {
    let disposed = false;

    void (async () => {
      const result = await merchantService.getPendingKYCCount();
      if (!disposed && result.ok) pendingKYCCount = result.value;
    })();

    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        searchOpen = true;
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      disposed = true;
      window.removeEventListener('keydown', handleShortcut);
      if (searchTimer) window.clearTimeout(searchTimer);
    };
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

  function toggleNavMore() {
    navMoreOpen = !navMoreOpen;
  }

  function closeNavMore() {
    navMoreOpen = false;
  }

  function toggleNotifications() {
    notificationOpen = !notificationOpen;
    navMoreOpen = false;
  }

  function closeNotifications() {
    notificationOpen = false;
  }

  function handleNavMoreKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (navMoreOpen) {
      navMoreOpen = false;
      document.querySelector<HTMLButtonElement>('.nav-pill--more')?.focus();
    }
    if (notificationOpen) {
      notificationOpen = false;
      document.querySelector<HTMLButtonElement>('.icon-action--bell')?.focus();
    }
  }

  function handleWindowClick(event: MouseEvent) {
    if (!notificationOpen || !(event.target instanceof Element)) return;
    if (event.target.closest('.notification-wrap')) return;
    notificationOpen = false;
  }
</script>

<svelte:window onkeydown={handleNavMoreKeydown} onclick={handleWindowClick} />

<div class="admin-shell" use:parallax={{ intensity: 0.72 }}>
  <div class="admin-depth-tabs" aria-hidden="true">
    <span style="--index: 0">Live ledger</span>
    <span style="--index: 1">Risk sync</span>
  </div>

  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-header__top">
        <a href="/dashboard" class="brand-link" aria-label="Prisma Pay dashboard">
          <img src="/Prisma_Pay_White.svg" alt="Prisma Pay" class="brand-logo" />
        </a>

        <div class="header-actions">
          <div class="notification-wrap">
            <button
              type="button"
              class="icon-action icon-action--bell"
              aria-label="Abrir tarefas importantes"
              aria-expanded={notificationOpen}
              aria-controls="admin-notifications"
              aria-haspopup="dialog"
              onclick={toggleNotifications}
            >
              <Bell size={17} strokeWidth={1.5} />
              {#if importantTaskCount > 0}
                <span>{importantTaskCount}</span>
              {/if}
            </button>

            {#if notificationOpen}
              <div id="admin-notifications" class="notification-popover" role="dialog" aria-label="Tarefas importantes">
                <div class="notification-popover__header">
                  <span>
                    <small>Prisma</small>
                    <strong>Tarefas importantes</strong>
                  </span>
                  <em class:notification-popover__status--empty={importantTaskCount === 0}>
                    {importantTaskCount > 0 ? `${importantTaskCount} aberta${importantTaskCount === 1 ? '' : 's'}` : 'Tudo limpo'}
                  </em>
                </div>

                <div class="notification-popover__list">
                  {#if canReviewKYC && pendingKYCCount > 0}
                    <a
                      href="/merchants?verification=PENDING_REVIEW"
                      class="notification-task"
                      onclick={closeNotifications}
                    >
                      <span class="notification-task__icon">
                        <Users size={15} strokeWidth={1.65} />
                      </span>
                      <span class="notification-task__body">
                        <strong>KYC pendente</strong>
                        <small>
                          {pendingKYCCount === 1
                            ? '1 merchant aguardando revisao.'
                            : `${pendingKYCCount} merchants aguardando revisao.`}
                        </small>
                      </span>
                      <span class="notification-task__action">
                        Revisar
                        <ChevronRight size={13} strokeWidth={1.8} />
                      </span>
                    </a>
                  {:else}
                    <div class="notification-empty">
                      <span>
                        <ShieldCheck size={18} strokeWidth={1.55} />
                      </span>
                      <strong>Nenhuma tarefa critica</strong>
                      <small>KYC, disputas e saques travados aparecem aqui quando exigirem acao.</small>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
          <a href="/settings/security" class="user-chip" title="Seguranca da conta">
            <span class="user-chip__avatar">{userInitials}</span>
            <span class="user-chip__meta">
              <strong>{displayName}</strong>
              <small>{role ?? 'VIEWER'}</small>
            </span>
            {#if admin?.twoFactorEnabled}
              <ShieldCheck size={14} strokeWidth={1.5} class="user-chip__secure" />
            {/if}
          </a>
          <form method="POST" action="/logout" use:enhance>
            <button type="submit" class="icon-action" aria-label="Sair">
              <LogOut size={17} strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>

      <div class="app-header__bottom">
        <div class="header-copy">
          <p>Prisma Payments</p>
          <h1>{activeLabel}</h1>
          <span>Monitore pagamentos, merchants, filas e risco em tempo real.</span>
        </div>
        <button type="button" class="global-search" onclick={() => (searchOpen = true)}>
          <Search size={16} strokeWidth={1.5} />
          <span>Buscar merchant, pagamento, saque...</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>

      <nav class="nav-ribbon" aria-label="Navegacao principal">
        {#each primaryNavItems as item}
          {@const Icon = item.Icon}
          {@const active = isActive(item.href)}
          <a href={item.href} class="nav-pill" class:nav-pill--active={active}>
            <Icon size={14} strokeWidth={1.55} />
            <span>{item.label}</span>
            {#if item.badge && item.badge > 0}
              <em>{item.badge}</em>
            {/if}
          </a>
        {/each}

        {#if secondaryNavItems.length > 0}
          <div class="nav-more">
            <button
              type="button"
              class="nav-pill nav-pill--more"
              class:nav-pill--active={secondaryNavActive}
              aria-expanded={navMoreOpen}
              aria-controls="admin-more-nav"
              aria-haspopup="menu"
              onclick={toggleNavMore}
            >
              <Ellipsis size={15} strokeWidth={1.7} />
              <span>Mais</span>
              <ChevronRight size={13} strokeWidth={1.8} class="nav-more__chevron" />
            </button>

            {#if navMoreOpen}
              <div id="admin-more-nav" class="nav-more__menu" role="menu" aria-label="Mais secoes">
                {#each secondaryNavItems as item, index}
                  {@const Icon = item.Icon}
                  {@const active = isActive(item.href)}
                  <a
                    href={item.href}
                    class="nav-more__item"
                    class:nav-more__item--active={active}
                    role="menuitem"
                    style={`--index: ${index}`}
                    onclick={closeNavMore}
                  >
                    <Icon size={13} strokeWidth={1.55} />
                    <span>{item.label}</span>
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </nav>
    </div>
  </header>

  <main id="content" class="main">
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
    --parallax-bg-x: 0px;
    --parallax-bg-y: 0px;
    --parallax-bg-inverse-x: 0px;
    --parallax-bg-inverse-y: 0px;
    --parallax-layer-front-x: 0px;
    --parallax-layer-front-y: 0px;
    min-height: 100dvh;
    color: var(--color-foreground);
    background:
      radial-gradient(circle at 16% -8%, rgba(255, 0, 255, 0.08), transparent 28rem),
      radial-gradient(circle at 82% 2%, rgba(1, 250, 251, 0.06), transparent 24rem),
      linear-gradient(135deg, #08080c 0%, #0b0b11 54%, #090911 100%);
    position: relative;
    isolation: isolate;
    overflow-x: hidden;
    perspective: 1300px;
  }

  .admin-shell::before {
    content: '';
    position: fixed;
    z-index: 0;
    inset: -18% -8% auto 20%;
    height: 430px;
    pointer-events: none;
    background:
      radial-gradient(circle at 24% 50%, rgba(1, 250, 251, 0.11), transparent 29%),
      radial-gradient(circle at 68% 28%, rgba(255, 0, 255, 0.13), transparent 34%),
      linear-gradient(90deg, rgba(1, 250, 251, 0.08), rgba(255, 0, 255, 0.09), transparent);
    filter: blur(44px) saturate(125%);
    opacity: 0.76;
    transform: translate3d(var(--parallax-bg-x), var(--parallax-bg-y), 0);
    transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-shell::after {
    content: '';
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.14;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.13) 1px, transparent 1px);
    background-size: 22px 22px;
    mask-image: linear-gradient(180deg, black, transparent 76%);
    transform: translate3d(var(--parallax-bg-inverse-x), var(--parallax-bg-inverse-y), 0);
    transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-depth-tabs {
    position: fixed;
    z-index: 1;
    top: 104px;
    right: 34px;
    width: 320px;
    height: 220px;
    pointer-events: none;
    opacity: 0.48;
    transform:
      translate3d(var(--parallax-layer-front-x), var(--parallax-layer-front-y), 36px)
      rotateX(var(--parallax-tilt-x, 0deg))
      rotateY(var(--parallax-tilt-y, 0deg));
    transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-depth-tabs span {
    position: absolute;
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 11px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 999px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.022)),
      rgba(12, 12, 18, 0.52);
    color: rgba(246, 246, 255, 0.5);
    font-size: 0.68rem;
    font-weight: 760;
    box-shadow:
      0 16px 42px rgba(0, 0, 0, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    animation: depth-tab-drift 6.4s ease-in-out infinite;
    animation-delay: calc(var(--index) * -780ms);
  }

  .admin-depth-tabs span:nth-child(1) {
    top: 0;
    right: 18px;
  }

  .admin-depth-tabs span:nth-child(2) {
    top: 72px;
    left: 20px;
  }

  .app-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 14px 24px 0;
    background:
      linear-gradient(180deg, rgba(8, 8, 12, 0.94), rgba(8, 8, 12, 0.72) 74%, transparent);
    backdrop-filter: blur(18px);
  }

  .app-header__inner {
    width: min(100%, 1440px);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .app-header__top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .brand-link {
    display: inline-flex;
    align-items: center;
    min-width: 154px;
    text-decoration: none;
  }

  .brand-logo {
    width: 126px;
    height: auto;
    display: block;
  }

  .header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .icon-action,
  .user-chip,
  .global-search {
    border: 1px solid rgba(255, 255, 255, 0.075);
    background: rgba(255, 255, 255, 0.035);
    color: var(--color-foreground-secondary);
    cursor: pointer;
    font: inherit;
    text-decoration: none;
    transition: color 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .icon-action {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 999px;
  }

  .icon-action:hover,
  .user-chip:hover,
  .global-search:hover {
    color: var(--color-foreground);
    background: rgba(1, 250, 251, 0.075);
    border-color: rgba(1, 250, 251, 0.24);
    transform: translateY(-1px);
  }

  .icon-action--bell span {
    position: absolute;
    top: -3px;
    right: -3px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--color-danger);
    color: var(--color-foreground);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    line-height: 16px;
  }

  .notification-wrap {
    position: relative;
    display: inline-flex;
  }

  .notification-popover {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    z-index: 35;
    width: min(344px, calc(100vw - 32px));
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    background:
      linear-gradient(155deg, rgba(255, 255, 255, 0.092), rgba(255, 255, 255, 0.026)),
      linear-gradient(180deg, rgba(13, 14, 22, 0.96), rgba(9, 9, 14, 0.94));
    box-shadow:
      0 22px 70px rgba(0, 0, 0, 0.42),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(18px);
    transform-origin: top right;
    animation: notification-popover-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .notification-popover::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    background:
      radial-gradient(circle at 16% 0%, rgba(1, 250, 251, 0.11), transparent 36%),
      radial-gradient(circle at 100% 10%, rgba(255, 0, 255, 0.09), transparent 34%);
    opacity: 0.85;
  }

  .notification-popover__header,
  .notification-popover__list {
    position: relative;
    z-index: 1;
  }

  .notification-popover__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 4px 10px;
  }

  .notification-popover__header span,
  .notification-popover__header small,
  .notification-popover__header strong {
    display: block;
  }

  .notification-popover__header small {
    color: var(--color-foreground-disabled);
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 780;
    letter-spacing: 0.12em;
    line-height: 1.35;
    text-transform: uppercase;
  }

  .notification-popover__header strong {
    margin-top: 2px;
    color: var(--color-foreground);
    font-size: 0.9rem;
    font-weight: 760;
    letter-spacing: 0;
    line-height: 1.1;
  }

  .notification-popover__header em {
    flex: 0 0 auto;
    padding: 5px 8px;
    border: 1px solid rgba(1, 250, 251, 0.14);
    border-radius: 999px;
    background: rgba(1, 250, 251, 0.075);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-style: normal;
    font-weight: 760;
    line-height: 1;
  }

  .notification-popover__status--empty {
    border-color: rgba(255, 255, 255, 0.075) !important;
    background: rgba(255, 255, 255, 0.035) !important;
    color: var(--color-foreground-muted) !important;
  }

  .notification-popover__list {
    display: grid;
    gap: 7px;
  }

  .notification-task {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    min-height: 72px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.065);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.035);
    color: var(--color-foreground);
    text-decoration: none;
    transition:
      transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.22s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .notification-task:hover {
    border-color: rgba(1, 250, 251, 0.2);
    background: rgba(1, 250, 251, 0.07);
    transform: translateY(-1px);
  }

  .notification-task__icon,
  .notification-empty span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(1, 250, 251, 0.14);
    border-radius: 999px;
    background: rgba(1, 250, 251, 0.075);
    color: var(--color-primary);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .notification-task__body {
    min-width: 0;
  }

  .notification-task__body strong,
  .notification-task__body small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .notification-task__body strong {
    color: var(--color-foreground);
    font-size: 0.78rem;
    font-weight: 760;
    line-height: 1.25;
  }

  .notification-task__body small {
    margin-top: 4px;
    color: var(--color-foreground-secondary);
    font-size: 0.7rem;
    line-height: 1.35;
  }

  .notification-task__action {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    color: var(--color-foreground);
    font-size: 0.66rem;
    font-weight: 760;
    white-space: nowrap;
  }

  .notification-empty {
    display: grid;
    justify-items: center;
    gap: 8px;
    min-height: 132px;
    padding: 20px 18px 18px;
    border: 1px dashed rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.026);
    text-align: center;
  }

  .notification-empty strong {
    color: var(--color-foreground);
    font-size: 0.8rem;
    font-weight: 760;
  }

  .notification-empty small {
    max-width: 240px;
    color: var(--color-foreground-secondary);
    font-size: 0.7rem;
    line-height: 1.45;
  }

  .user-chip {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    max-width: 210px;
    min-height: 36px;
    padding: 2px 10px 2px 2px;
    border-radius: 999px;
  }

  .user-chip__avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.22), rgba(1, 250, 251, 0.13));
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: 0.78rem;
    font-weight: 820;
  }

  .user-chip__meta {
    min-width: 0;
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .user-chip__meta strong,
  .user-chip__meta small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-chip__meta strong {
    color: var(--color-foreground);
    font-size: 0.76rem;
  }

  .user-chip__meta small {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.58rem;
  }

  :global(.user-chip__secure) {
    color: var(--color-success);
  }

  .app-header__bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
  }

  .header-copy {
    min-width: 0;
  }

  .header-copy p,
  .header-copy h1,
  .header-copy span {
    margin: 0;
  }

  .header-copy p {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .header-copy h1 {
    margin-top: 2px;
    color: var(--color-foreground);
    font-size: clamp(1.24rem, 2vw, 1.62rem);
    font-weight: 820;
    line-height: 1.05;
  }

  .header-copy span {
    display: block;
    margin-top: 5px;
    color: var(--color-foreground-secondary);
    font-size: 0.82rem;
  }

  .global-search {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px;
    width: min(100%, 344px);
    min-height: 40px;
    padding: 0 10px 0 13px;
    border-radius: 999px;
    text-align: left;
  }

  .global-search span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.82rem;
  }

  .global-search kbd {
    padding-left: 4px;
    color: #777789;
    font-family: var(--font-mono);
    font-size: 0.62rem;
  }

  .nav-ribbon {
    position: relative;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 6px;
    padding: 5px 0 8px;
    overflow: hidden;
    border-top: 1px solid rgba(255, 255, 255, 0.055);
  }

  .nav-pill {
    appearance: none;
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 6px;
    min-height: 28px;
    padding: 0 8px;
    border: 1px solid rgba(255, 255, 255, 0.055);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.025);
    color: var(--color-foreground-secondary);
    font-size: 0.68rem;
    font-weight: 660;
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.2s;
  }

  .nav-pill span {
    white-space: nowrap;
  }

  .nav-pill:hover {
    color: var(--color-foreground);
    background: rgba(255, 255, 255, 0.045);
    transform: translateY(-1px);
  }

  .nav-pill--active {
    color: #050507;
    border-color: transparent;
    background: var(--color-foreground);
  }

  .nav-pill em {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--color-danger);
    color: var(--color-foreground);
    font-family: var(--font-mono);
    font-size: 0.56rem;
    font-style: normal;
    line-height: 16px;
    text-align: center;
  }

  .nav-more {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex: 1 1 0;
    min-width: 0;
    gap: 5px;
    overflow: hidden;
  }

  .nav-pill--more {
    font-family: inherit;
    overflow: visible;
  }

  .nav-pill--more :global(.nav-more__chevron) {
    margin-left: -2px;
    opacity: 0.55;
    transform: translateX(0);
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .nav-pill--more[aria-expanded='true'] :global(.nav-more__chevron) {
    opacity: 0.95;
    transform: translateX(2px);
  }

  .nav-more__menu {
    position: static;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    flex: 1 1 0;
    min-width: 0;
    max-width: 100%;
    gap: 4px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    white-space: nowrap;
    transform-origin: left center;
    animation: nav-more-slide 0.24s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .nav-more__menu::-webkit-scrollbar {
    display: none;
  }

  .nav-more__item {
    display: inline-flex;
    align-items: center;
    flex: 0 1 92px;
    gap: 5px;
    min-height: 28px;
    min-width: 0;
    max-width: 96px;
    padding: 0 7px;
    border: 1px solid rgba(255, 255, 255, 0.055);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.024);
    color: var(--color-foreground-secondary);
    font-size: 0.64rem;
    font-weight: 650;
    line-height: 1;
    text-decoration: none;
    opacity: 0;
    transform: translateX(-6px);
    animation: nav-more-item-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: calc(var(--index) * 22ms);
    transition: color 0.2s, background 0.2s, border-color 0.2s, transform 0.2s;
  }

  .nav-more__item span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nav-more__item:hover {
    color: var(--color-foreground);
    border-color: rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  .nav-more__item--active {
    color: var(--color-foreground);
    border-color: rgba(31, 224, 229, 0.18);
    background: rgba(31, 224, 229, 0.09);
    opacity: 1;
  }

  .main {
    position: relative;
    z-index: 2;
    min-width: 0;
    min-height: calc(100dvh - 150px);
  }

  .search-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    justify-content: center;
    padding-top: 12vh;
    background: rgba(0, 0, 0, 0.62);
    backdrop-filter: blur(10px);
    animation: overlay-in 0.18s ease-out both;
  }

  .search-modal {
    width: min(720px, calc(100vw - 28px));
  }

  .search-box {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid rgba(1, 250, 251, 0.22);
    border-radius: 16px 16px 0 0;
    background: #111119;
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
    border-radius: 0 0 16px 16px;
    background: rgba(17, 17, 25, 0.98);
  }

  .search-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 11px;
    width: 100%;
    padding: 12px;
    border: 1px solid transparent;
    border-radius: 10px;
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

  @keyframes overlay-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes nav-more-slide {
    from {
      opacity: 0;
      filter: blur(4px);
      transform: translate3d(-10px, 0, 0) scale(0.98);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes nav-more-item-in {
    from {
      opacity: 0;
      transform: translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes notification-popover-in {
    from {
      opacity: 0;
      filter: blur(5px);
      transform: translate3d(0, -8px, 0) scale(0.98);
    }
    to {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) scale(1);
    }
  }

  @keyframes depth-tab-drift {
    0%,
    100% {
      translate: 0 0;
    }
    50% {
      translate: 0 -7px;
    }
  }

  @media (max-width: 760px) {
    .admin-depth-tabs {
      display: none;
    }

    .app-header {
      padding: 12px 14px 0;
    }

    .brand-link {
      min-width: 116px;
    }

    .brand-logo {
      width: 108px;
    }

    .app-header__bottom {
      align-items: stretch;
      flex-direction: column;
      gap: 12px;
    }

    .global-search {
      width: 100%;
    }

    .user-chip__meta,
    .global-search kbd {
      display: none;
    }

    .user-chip {
      grid-template-columns: 32px;
      padding: 2px;
    }

    .notification-popover {
      position: fixed;
      top: 58px;
      right: 12px;
      width: calc(100vw - 24px);
      transform-origin: top right;
    }

    .nav-ribbon {
      gap: 6px;
      padding-bottom: 10px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .nav-ribbon::-webkit-scrollbar {
      display: none;
    }

    .nav-pill {
      min-height: 28px;
      padding: 0 8px;
      font-size: 0.68rem;
    }

    .nav-more__menu {
      white-space: nowrap;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-shell::before,
    .admin-shell::after,
    .admin-depth-tabs span,
    .nav-more__menu,
    .nav-more__item,
    .notification-popover {
      animation: none;
    }

    .admin-shell::before,
    .admin-shell::after,
    .admin-depth-tabs,
    .admin-depth-tabs span {
      transform: none;
      translate: 0 0;
    }
  }
</style>
