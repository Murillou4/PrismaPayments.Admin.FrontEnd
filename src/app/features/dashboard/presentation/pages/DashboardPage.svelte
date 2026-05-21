<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
  } from 'chart.js';
  import type { ChartData } from 'chart.js';
  import { Bar } from 'svelte5-chartjs';
  import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Calendar,
    ChevronDown,
    ChevronUp,
    Copy,
    CreditCard,
    Download,
    Filter,
    Globe,
    MoreHorizontal,
    Package,
    RefreshCw,
    RotateCcw,
    ShieldAlert,
    Sparkles,
    Store,
    Wallet,
    WifiOff
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import DateRangeFilter from '$appmod/shared/widgets/filters/DateRangeFilter.svelte';
  import SelectFilter from '$appmod/shared/widgets/filters/SelectFilter.svelte';
  import { appServices } from '$core/service_locator/dependencies';
  import { formatCurrency, formatDate, formatPercentage } from '$appmod/shared/utils/formatters';
  import type {
    AdminDashboardResponse,
    AdminDashboardFilters,
    PaymentStatus,
    PaymentMethod,
    PaymentItem,
    ProviderItem,
    MethodBreakdown
  } from '../../domain/entities/AdminDashboardResponse';

  ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

  type PeriodKey = 'today' | 'week' | 'month' | 'year';
  type DashboardPageProps = {
    initialDashboard?: AdminDashboardResponse | null;
    initialError?: string | null;
    initialStartDate?: string;
    initialEndDate?: string;
  };

  let {
    initialDashboard = null,
    initialError = null,
    initialStartDate,
    initialEndDate
  }: DashboardPageProps = $props();
  function getInitialState() {
    return {
      dashboard: initialDashboard,
      error: initialError,
      startDate: initialStartDate,
      endDate: initialEndDate
    };
  }

  const initialState = getInitialState();

  const METHOD_LABELS: Record<string, string> = {
    PIX: 'PIX',
    BOLETO: 'Boleto',
    CREDIT_CARD: 'Cartao',
    DEBIT_CARD: 'Debito'
  };

  const METHOD_DATASETS = [
    { method: 'PIX', label: 'PIX', color: 'rgba(1, 250, 251, 0.76)' },
    { method: 'CREDIT_CARD', label: 'Cartao', color: 'rgba(255, 0, 255, 0.52)' },
    { method: 'BOLETO', label: 'Boleto', color: 'rgba(255, 179, 0, 0.62)' },
    { method: 'DEBIT_CARD', label: 'Debito', color: 'rgba(0, 230, 118, 0.48)' }
  ];

  const DASHBOARD_CACHE_KEY = 'prisma.admin.dashboard.snapshot.v1';
  const initialDateRange = getPeriodDates('week');

  let dashboard = $state<AdminDashboardResponse | null>(initialState.dashboard);
  let loading = $state(!initialState.dashboard && !initialState.error);
  let error = $state<string | null>(initialState.error);
  let activePeriod = $state<PeriodKey>('week');
  let filtersOpen = $state(false);

  let filterStartDate = $state(initialState.startDate ?? initialDateRange.start);
  let filterEndDate = $state(initialState.endDate ?? initialDateRange.end);
  let filterPaymentStatus = $state('');
  let filterMethod = $state('');
  let filterMerchantId = $state('');
  let filterMerchantStatus = $state('');
  let filterDisputeStatus = $state('');
  let filterProviderName = $state('');

  const service = appServices.dashboard();

  const PERIODS: { key: PeriodKey; label: string; short: string }[] = [
    { key: 'today', label: 'Hoje', short: 'D' },
    { key: 'week', label: 'Semana', short: 'W' },
    { key: 'month', label: 'Mes', short: 'M' },
    { key: 'year', label: 'Ano', short: 'Y' }
  ];

  const paymentStatusOptions = [
    { value: 'PAID', label: 'Pago' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'FAILED', label: 'Falhou' },
    { value: 'PROCESSING', label: 'Processando' },
    { value: 'CREATED', label: 'Criado' },
    { value: 'REFUNDED', label: 'Reembolsado' },
    { value: 'CANCELLED', label: 'Cancelado' }
  ];

  const methodOptions = [
    { value: 'PIX', label: 'PIX' },
    { value: 'BOLETO', label: 'Boleto' },
    { value: 'CREDIT_CARD', label: 'Cartao de credito' },
    { value: 'DEBIT_CARD', label: 'Cartao de debito' }
  ];

  const merchantStatusOptions = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'SUSPENDED', label: 'Suspenso' }
  ];

  const disputeStatusOptions = [
    { value: 'OPEN', label: 'Aberto' },
    { value: 'UNDER_REVIEW', label: 'Em revisao' },
    { value: 'RESOLVED', label: 'Resolvido' },
    { value: 'CLOSED', label: 'Fechado' }
  ];

  function getPeriodDates(period: PeriodKey): { start: string; end: string } {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const start = new Date(today);
    if (period === 'week') start.setDate(start.getDate() - 6);
    if (period === 'month') start.setDate(start.getDate() - 29);
    if (period === 'year') start.setFullYear(start.getFullYear() - 1);
    return { start: start.toISOString().slice(0, 10), end };
  }

  function formatCompactCurrency(cents: number): string {
    const value = cents / 100;
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`;
    return formatCurrency(cents);
  }

  function shortId(id: string | undefined | null): string {
    if (!id) return '-';
    if (id.length <= 10) return id;
    return `${id.slice(0, 8)}...`;
  }

  function methodLabel(method: string): string {
    return METHOD_LABELS[method] ?? method;
  }

  function statusTone(status: string): 'success' | 'warning' | 'danger' | 'neutral' {
    const normalized = status.toLowerCase();
    if (/(paid|completed|active|healthy|ok|up|online|success)/.test(normalized)) return 'success';
    if (/(pending|processing|review|degrad|warn|slow|created)/.test(normalized)) return 'warning';
    if (/(fail|failed|error|down|suspended|cancel|unhealthy|open)/.test(normalized)) return 'danger';
    return 'neutral';
  }

  function dashboardErrorMessage(message: string): string {
    if (/falha de rede/i.test(message)) {
      return 'Nao consegui carregar os dados do dashboard agora. Verifique se o backend esta ativo e tente novamente.';
    }
    return message;
  }

  function readCachedDashboard(): AdminDashboardResponse | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AdminDashboardResponse;
    } catch {
      window.localStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }
  }

  function cacheDashboard(value: AdminDashboardResponse) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(value));
  }

  function buildFilters(): AdminDashboardFilters {
    const f: AdminDashboardFilters = {};
    if (filterStartDate) f.startDate = filterStartDate;
    if (filterEndDate) f.endDate = filterEndDate;
    if (filterPaymentStatus) f.paymentStatus = filterPaymentStatus as PaymentStatus;
    if (filterMethod) f.method = filterMethod as PaymentMethod;
    if (filterMerchantId) f.merchantId = filterMerchantId;
    if (filterMerchantStatus) f.merchantStatus = filterMerchantStatus as AdminDashboardFilters['merchantStatus'];
    if (filterDisputeStatus) f.disputeStatus = filterDisputeStatus;
    if (filterProviderName.trim()) f.providerName = filterProviderName.trim();
    f.skip = 0;
    f.limit = 100;
    return f;
  }

  async function fetchDashboard() {
    loading = true;
    error = null;
    const result = await service.getDashboard(buildFilters());
    if (result.ok) {
      dashboard = result.value;
      cacheDashboard(result.value);
    } else {
      error = dashboardErrorMessage(result.failure.message);
    }
    loading = false;
  }

  function applyPeriodPreset(period: PeriodKey) {
    activePeriod = period;
    const { start, end } = getPeriodDates(period);
    filterStartDate = start;
    filterEndDate = end;
    fetchDashboard();
  }

  function resetFilters() {
    filterPaymentStatus = '';
    filterMethod = '';
    filterMerchantId = '';
    filterMerchantStatus = '';
    filterDisputeStatus = '';
    filterProviderName = '';
    applyPeriodPreset('week');
  }

  function applyFilters() {
    fetchDashboard();
  }

  const successRate = $derived.by(() => {
    const total = dashboard?.payments?.total ?? 0;
    const paid = dashboard?.payments?.paid ?? 0;
    if (total === 0) return null;
    return (paid / total) * 100;
  });

  const chargebackRate = $derived.by(() => {
    const total = dashboard?.payments?.total ?? 0;
    const disputes = dashboard?.disputes?.open ?? 0;
    if (total === 0) return null;
    return (disputes / total) * 100;
  });

  const hasQueueBacklog = $derived.by(() => {
    const q = dashboard?.queues;
    if (!q) return false;
    return (
      q.pendingMerchantVerification > 0 ||
      q.failedWebhooks > 0 ||
      q.openDisputes > 0 ||
      q.failedPayments > 0
    );
  });

  const chartData = $derived.by((): ChartData<'bar'> => {
    if (!dashboard) return { labels: [], datasets: [] };
    const items = dashboard.payments.items ?? [];
    const labels: string[] = [];
    const buckets = new Map<string, Record<string, number>>();
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    if (activePeriod === 'today') {
      for (let h = 0; h < 24; h++) labels.push(`${h.toString().padStart(2, '0')}h`);
    } else if (activePeriod === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(days[d.getDay()]);
      }
    } else if (activePeriod === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`);
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push(months[d.getMonth()]);
      }
    }

    for (const label of labels) {
      buckets.set(label, { PIX: 0, CREDIT_CARD: 0, BOLETO: 0, DEBIT_CARD: 0 });
    }

    for (const item of items) {
      if (!item.createdAt || !item.amount) continue;
      const d = new Date(item.createdAt);
      let key = '';
      if (activePeriod === 'today') key = `${d.getHours().toString().padStart(2, '0')}h`;
      if (activePeriod === 'week') key = days[d.getDay()];
      if (activePeriod === 'month') key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (activePeriod === 'year') key = months[d.getMonth()];
      if (!buckets.has(key)) continue;
      const bucket = buckets.get(key);
      if (bucket) bucket[item.method] = (bucket[item.method] ?? 0) + item.amount / 100;
    }

    return {
      labels,
      datasets: METHOD_DATASETS.map((dataset) => ({
        label: dataset.label,
        data: labels.map((label) => buckets.get(label)?.[dataset.method] ?? 0),
        backgroundColor: dataset.color,
        borderColor: 'rgba(8, 8, 12, 0.72)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        stack: 'volume'
      }))
    };
  });

  const chartHasData = $derived(
    chartData.datasets.some((dataset) => (dataset.data as number[]).some((value) => value > 0))
  );

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111119',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: '#F6F6FF',
        bodyColor: '#9A9AAF',
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: 'Onest Variable', size: 13, weight: 700 },
        bodyFont: { family: 'Onest Variable', size: 12 }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#9A9AAF', font: { family: 'JetBrains Mono Variable', size: 10 } },
        border: { display: false }
      },
      y: {
        stacked: true,
        grid: { color: 'rgba(255,255,255,0.055)' },
        ticks: { color: '#6f6f86', font: { family: 'JetBrains Mono Variable', size: 10 } },
        border: { display: false }
      }
    }
  };

  const methodBreakdown = $derived.by((): MethodBreakdown[] => {
    return dashboard?.payments?.methodBreakdown?.filter((item) => item.amount > 0) ?? [];
  });

  const recentPayments = $derived.by((): PaymentItem[] => {
    return dashboard?.payments?.items?.slice(0, 5) ?? [];
  });

  const topProviders = $derived.by((): ProviderItem[] => {
    return dashboard?.providers?.items?.slice(0, 5) ?? [];
  });

  onMount(() => {
    if (dashboard) {
      cacheDashboard(dashboard);
      return;
    }

    const cached = readCachedDashboard();
    if (cached) {
      dashboard = cached;
      loading = false;
      error = error ?? 'Mostrando o ultimo snapshot carregado. Clique em atualizar para sincronizar.';
      return;
    }

    if (!error) {
      fetchDashboard();
    }
  });
</script>

<div class="shop-dashboard">
  <section class="toolbar-row">
    <div class="toolbar-main">
      <button type="button" class="date-chip">
        <Calendar size={15} strokeWidth={1.5} />
        <span>
          {filterStartDate || '--'} - {filterEndDate || '--'}
        </span>
      </button>
      <button type="button" class="compare-chip">
        <BarChart3 size={15} strokeWidth={1.5} />
        <strong>Compare:</strong>
        <span>Previous period</span>
      </button>
    </div>
    <div class="toolbar-status" class:toolbar-status--error={Boolean(error)}>
      <span></span>
      <p>{loading ? 'Syncing dashboard' : error ? 'Sync failed' : 'Updated just now'}</p>
      <button type="button" class="icon-btn" onclick={() => fetchDashboard()} aria-label="Atualizar">
        <RefreshCw size={15} strokeWidth={1.5} class={loading ? 'spin' : ''} />
      </button>
      <button type="button" class="icon-btn" onclick={() => (filtersOpen = !filtersOpen)} aria-label="Filtros">
        <Filter size={15} strokeWidth={1.5} />
        {#if filtersOpen}
          <ChevronUp size={13} strokeWidth={1.5} />
        {:else}
          <ChevronDown size={13} strokeWidth={1.5} />
        {/if}
      </button>
    </div>
  </section>

  {#if error && dashboard}
    <section class="offline-banner" role="alert">
      <WifiOff size={16} strokeWidth={1.5} />
      <p>{error}</p>
      <Button size="sm" variant="outline" onclick={() => fetchDashboard()}>
        <RefreshCw size={13} strokeWidth={1.5} />
        Retry
      </Button>
    </section>
  {/if}

  {#if filtersOpen}
    <section class="filter-card">
      <DateRangeFilter
        value={{ from: filterStartDate, to: filterEndDate }}
        onChange={(range) => {
          filterStartDate = range.from;
          filterEndDate = range.to;
        }}
      />
      <SelectFilter
        options={paymentStatusOptions}
        value={filterPaymentStatus}
        placeholder="Status pagamento"
        onChange={(value) => (filterPaymentStatus = value)}
      />
      <SelectFilter
        options={methodOptions}
        value={filterMethod}
        placeholder="Metodo"
        onChange={(value) => (filterMethod = value)}
      />
      <SelectFilter
        options={merchantStatusOptions}
        value={filterMerchantStatus}
        placeholder="Status merchant"
        onChange={(value) => (filterMerchantStatus = value)}
      />
      <SelectFilter
        options={disputeStatusOptions}
        value={filterDisputeStatus}
        placeholder="Status disputa"
        onChange={(value) => (filterDisputeStatus = value)}
      />
      <div class="provider-filter">
        <span>Provider</span>
        <Input placeholder="Nome ou ID" bind:value={filterProviderName} />
      </div>
      <div class="filter-actions">
        <Button variant="outline" size="sm" onclick={resetFilters}>
          <RotateCcw size={13} strokeWidth={1.5} />
          Limpar
        </Button>
        <Button size="sm" onclick={applyFilters}>Aplicar</Button>
      </div>
    </section>
  {/if}

  {#if loading}
    <div class="template-skeleton">
      <div class="skeleton-left">
        <div class="skeleton-grid">
          <div class="skeleton-card skeleton-feature"></div>
          <div class="skeleton-kpis">
            {#each [1, 2, 3, 4] as item (item)}
              <div class="skeleton-card"></div>
            {/each}
          </div>
        </div>
        <div class="skeleton-card skeleton-chart"></div>
      </div>
      <div class="skeleton-right">
        <div class="skeleton-card skeleton-globe"></div>
        <div class="skeleton-card skeleton-cta"></div>
      </div>
      <div class="skeleton-bottom">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    </div>
  {:else if error && !dashboard}
    <section class="load-error-card" role="alert">
      <div class="load-error-card__icon">
        <WifiOff size={22} strokeWidth={1.5} />
      </div>
      <div>
        <p class="eyebrow">Dashboard offline</p>
        <h3>Nao consegui carregar os dados.</h3>
        <span>{error}</span>
      </div>
      <Button variant="outline" onclick={() => fetchDashboard()}>
        <RefreshCw size={14} strokeWidth={1.5} />
        Tentar novamente
      </Button>
    </section>
  {:else if dashboard}
    <div class="main-grid">
      <section class="left-column">
        <div class="top-grid">
          <article class="d-card total-revenue-card">
            <div class="card-top">
              <div>
                <p class="eyebrow">Total revenue</p>
                <h2>{formatCompactCurrency(dashboard.payments.volume)}</h2>
              </div>
              <button type="button" class="mini-button" onclick={() => goto('/transactions/payments')}>
                View
                <ArrowUpRight size={13} strokeWidth={1.5} />
              </button>
            </div>

            <div class="revenue-summary">
              <div>
                <strong>{successRate === null ? '--' : formatPercentage(successRate)}</strong>
                <span>Approval</span>
              </div>
              <div>
                <strong>{dashboard.payments.paid.toLocaleString('pt-BR')}</strong>
                <span>Paid</span>
              </div>
            </div>

            <div class="category-pills">
              {#each methodBreakdown.slice(0, 3) as method (method.method)}
                <button type="button" class="category-pill">
                  <span>{methodLabel(method.method)}</span>
                  <strong>{formatCompactCurrency(method.amount)}</strong>
                </button>
              {/each}
              {#if methodBreakdown.length === 0}
                <button type="button" class="category-pill">
                  <span>PIX</span>
                  <strong>R$ 0</strong>
                </button>
                <button type="button" class="category-pill">
                  <span>Cartao</span>
                  <strong>R$ 0</strong>
                </button>
                <button type="button" class="category-pill">
                  <span>Boleto</span>
                  <strong>R$ 0</strong>
                </button>
              {/if}
            </div>
          </article>

          <div class="metric-grid">
            <article class="d-card metric-card">
              <div class="metric-head">
                <span class="metric-icon cyan"><Wallet size={15} strokeWidth={1.5} /></span>
                <button type="button" class="ghost-icon" aria-label="Detalhes"><MoreHorizontal size={15} /></button>
              </div>
              <p>Current balance</p>
              <h3>{formatCompactCurrency(dashboard.withdrawals.todayVolume)}</h3>
              <small class="trend up"><ArrowUpRight size={12} /> Today volume</small>
            </article>

            <article class="d-card metric-card">
              <div class="metric-head">
                <span class="metric-icon green"><Store size={15} strokeWidth={1.5} /></span>
                <button type="button" class="ghost-icon" aria-label="Detalhes"><MoreHorizontal size={15} /></button>
              </div>
              <p>Merchants</p>
              <h3>{dashboard.merchants.active.toLocaleString('pt-BR')}</h3>
              <small class="trend up"><ArrowUpRight size={12} /> {dashboard.merchants.total.toLocaleString('pt-BR')} total</small>
            </article>

            <article class="d-card metric-card">
              <div class="metric-head">
                <span class="metric-icon magenta"><CreditCard size={15} strokeWidth={1.5} /></span>
                <button type="button" class="ghost-icon" aria-label="Detalhes"><MoreHorizontal size={15} /></button>
              </div>
              <p>Transactions</p>
              <h3>{dashboard.payments.total.toLocaleString('pt-BR')}</h3>
              <small class="trend up"><ArrowUpRight size={12} /> {dashboard.payments.paid.toLocaleString('pt-BR')} paid</small>
            </article>

            <article class="d-card metric-card">
              <div class="metric-head">
                <span class="metric-icon danger"><ShieldAlert size={15} strokeWidth={1.5} /></span>
                <button type="button" class="ghost-icon" aria-label="Detalhes"><MoreHorizontal size={15} /></button>
              </div>
              <p>Risk</p>
              <h3>{dashboard.disputes.open.toLocaleString('pt-BR')}</h3>
              <small class:down={dashboard.disputes.open > 0} class="trend">
                {#if dashboard.disputes.open > 0}
                  <ArrowDownRight size={12} /> open disputes
                {:else}
                  <ArrowUpRight size={12} /> clear
                {/if}
              </small>
            </article>
          </div>
        </div>

        <article class="d-card statistics-card">
          <div class="statistics-head">
            <div>
              <h3>Statistics</h3>
              <span class="live-badge">Live</span>
            </div>
            <div class="statistics-actions">
              <button type="button" class="ghost-icon" aria-label="Download">
                <Download size={15} strokeWidth={1.5} />
              </button>
              <div class="period-tabs">
                {#each PERIODS as period (period.key)}
                  <button
                    type="button"
                    class:active={activePeriod === period.key}
                    onclick={() => applyPeriodPreset(period.key)}
                  >
                    {period.label}
                  </button>
                {/each}
              </div>
            </div>
          </div>

          <div class="date-strip">
            {#each (chartData.labels ?? []).slice(0, 13) as label, index (`${label}-${index}`)}
              <button type="button" class:active={index === 3}>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span>{label}</span>
              </button>
            {/each}
          </div>

          <div class="chart-summary">
            <div>
              <span class="pill success">
                {successRate === null ? '0,00%' : formatPercentage(successRate)}
                <ArrowUpRight size={11} />
              </span>
              <p>+ {formatCompactCurrency(dashboard.payments.volume)} increased</p>
            </div>
            <div class="legend">
              {#each METHOD_DATASETS as item (item.method)}
                <span style:--dot={item.color}>{item.label}</span>
              {/each}
            </div>
          </div>

          <div class="chart-area">
            {#if chartHasData}
              <Bar data={chartData} options={barChartOptions} />
            {:else}
              <div class="empty-state">
                <BarChart3 size={22} strokeWidth={1.5} />
                <p>No transaction data for this period.</p>
              </div>
            {/if}
          </div>
        </article>
      </section>

      <aside class="right-column">
        <article class="d-card globe-card">
          <div class="card-top">
            <div>
              <p class="eyebrow">Global sales</p>
              <h3>Provider network</h3>
            </div>
            <button type="button" class="ghost-icon" aria-label="Share">
              <Copy size={15} strokeWidth={1.5} />
            </button>
          </div>
          <div class="globe-visual" aria-hidden="true">
            <div class="globe-ring ring-one"></div>
            <div class="globe-ring ring-two"></div>
            <div class="globe-core">
              <Globe size={48} strokeWidth={1.15} />
            </div>
            <span class="pin pin-a"></span>
            <span class="pin pin-b"></span>
            <span class="pin pin-c"></span>
          </div>
          <div class="location-list">
            {#each topProviders.slice(0, 3) as provider (provider.id)}
              {@const tone = statusTone(provider.healthStatus)}
              <button type="button" onclick={() => goto('/providers')} class="location-row">
                <span class="provider-mark">{provider.displayName?.slice(0, 1) || provider.name.slice(0, 1)}</span>
                <div>
                  <strong>{provider.displayName || provider.name}</strong>
                  <small>{provider.supportedMethods?.join(' / ') || 'Payment rails'}</small>
                </div>
                <em class:success={tone === 'success'} class:danger={tone === 'danger'} class:warning={tone === 'warning'}>
                  {provider.healthStatus}
                </em>
              </button>
            {/each}
            {#if topProviders.length === 0}
              <div class="empty-list">No providers returned.</div>
            {/if}
          </div>
        </article>

        <article class="upgrade-card">
          <Sparkles size={20} strokeWidth={1.5} />
          <h3>Prisma Pulse</h3>
          <p>Risk, queues and provider health in one command center.</p>
          <button type="button" onclick={() => goto('/diagnostics')}>
            Open diagnostics
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </button>
        </article>
      </aside>
    </div>

    <div class="bottom-grid">
      <article class="d-card list-card">
        <div class="card-top">
          <div>
            <p class="eyebrow">Recent orders</p>
            <h3>Recent payments</h3>
          </div>
          <button type="button" class="mini-button" onclick={() => goto('/transactions/payments')}>View all</button>
        </div>
        <div class="list-stack">
          {#each recentPayments as payment (payment.id)}
            {@const tone = statusTone(payment.status)}
            <button type="button" class="order-row" onclick={() => goto(`/transactions/payments/${payment.id}`)}>
              <span class="avatar">{methodLabel(payment.method).slice(0, 2)}</span>
              <div>
                <strong>#{shortId(payment.id)}</strong>
                <small>{formatDate(payment.createdAt)}</small>
              </div>
              <div class="row-right">
                <strong>{formatCurrency(payment.amount)}</strong>
                <em class:success={tone === 'success'} class:warning={tone === 'warning'} class:danger={tone === 'danger'}>
                  {payment.status}
                </em>
              </div>
            </button>
          {/each}
          {#if recentPayments.length === 0}
            <div class="empty-list">No recent payments.</div>
          {/if}
        </div>
      </article>

      <article class="d-card list-card">
        <div class="card-top">
          <div>
            <p class="eyebrow">Top products</p>
            <h3>Top providers</h3>
          </div>
          <button type="button" class="ghost-icon" aria-label="More"><MoreHorizontal size={15} /></button>
        </div>
        <div class="list-stack">
          {#each topProviders as provider (provider.id)}
            {@const tone = statusTone(provider.healthStatus)}
            <button type="button" class="product-row" onclick={() => goto('/providers')}>
              <span class="thumb"><Package size={18} strokeWidth={1.5} /></span>
              <div>
                <strong>{provider.displayName || provider.name}</strong>
                <small>{provider.supportedMethods?.join(' / ') || 'No methods'}</small>
              </div>
              <em class:success={tone === 'success'} class:warning={tone === 'warning'} class:danger={tone === 'danger'}>
                {provider.healthStatus}
              </em>
            </button>
          {/each}
          {#if topProviders.length === 0}
            <div class="empty-list">No providers returned.</div>
          {/if}
        </div>
      </article>

      <article class="d-card channel-card">
        <div class="card-top">
          <div>
            <p class="eyebrow">Sales channel</p>
            <h3>Payment mix</h3>
          </div>
          <button type="button" class="ghost-icon" aria-label="More"><MoreHorizontal size={15} /></button>
        </div>
        <div class="channel-stack">
          {#each methodBreakdown as method (method.method)}
            {@const ratio = dashboard.payments.volume > 0 ? Math.round((method.amount / dashboard.payments.volume) * 100) : 0}
            <div class="channel-row">
              <div>
                <strong>{methodLabel(method.method)}</strong>
                <span>{method.total.toLocaleString('pt-BR')} transactions</span>
              </div>
              <div class="channel-value">
                <strong>{formatCompactCurrency(method.amount)}</strong>
                <span>{ratio}%</span>
              </div>
              <div class="progress"><span style:width={`${Math.max(ratio, 3)}%`}></span></div>
            </div>
          {/each}
          {#if methodBreakdown.length === 0}
            <div class="empty-list">No payment channels for this period.</div>
          {/if}
        </div>
      </article>
    </div>

    {#if hasQueueBacklog}
      <section class="queue-strip">
        <div>
          <AlertTriangle size={15} strokeWidth={1.5} />
          <strong>Operational queue</strong>
        </div>
        <button type="button" onclick={() => goto('/merchants?verification=PENDING_REVIEW')}>
          KYC {dashboard.queues.pendingMerchantVerification}
        </button>
        <button type="button" onclick={() => goto('/diagnostics')}>
          Webhooks {dashboard.queues.failedWebhooks}
        </button>
        <button type="button" onclick={() => goto('/disputes')}>
          Disputes {dashboard.queues.openDisputes}
        </button>
        <button type="button" onclick={() => goto('/transactions/payments?status=FAILED')}>
          Failed {dashboard.queues.failedPayments}
        </button>
      </section>
    {/if}
  {/if}
</div>

<style>
  .shop-dashboard {
    width: min(100%, 1440px);
    margin: 0 auto;
    padding: 16px 24px 48px;
    box-sizing: border-box;
  }

  .toolbar-row,
  .toolbar-main,
  .toolbar-status,
  .statistics-head,
  .statistics-actions,
  .card-top,
  .chart-summary,
  .chart-summary > div,
  .legend,
  .queue-strip {
    display: flex;
    align-items: center;
  }

  .toolbar-row {
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .toolbar-main {
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  .date-chip,
  .compare-chip,
  .icon-btn,
  .mini-button,
  .ghost-icon,
  .period-tabs button,
  .category-pill,
  .upgrade-card button,
  .queue-strip button {
    border: 1px solid var(--color-border-subtle);
    background: rgba(255, 255, 255, 0.026);
    color: var(--color-foreground-secondary);
    cursor: pointer;
    font: inherit;
    transition:
      transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .date-chip,
  .compare-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 12px;
    border-radius: 999px;
  }

  .compare-chip strong,
  .date-chip span,
  .compare-chip span {
    font-size: 0.78rem;
    white-space: nowrap;
  }

  .compare-chip strong {
    color: var(--color-foreground);
  }

  .toolbar-status {
    justify-content: flex-end;
    gap: 8px;
    color: var(--color-foreground-secondary);
    font-size: 0.76rem;
  }

  .toolbar-status > span {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--color-success);
    box-shadow: 0 0 0 5px rgba(0, 230, 118, 0.08);
    animation: status-pulse 1.8s ease-in-out infinite;
  }

  .toolbar-status--error > span {
    background: var(--color-warning);
    box-shadow: 0 0 0 5px rgba(255, 179, 0, 0.08);
  }

  .toolbar-status p {
    margin: 0;
  }

  .icon-btn,
  .ghost-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 999px;
  }

  .icon-btn:hover,
  .ghost-icon:hover,
  .date-chip:hover,
  .compare-chip:hover,
  .mini-button:hover,
  .category-pill:hover {
    transform: translateY(-1px);
    border-color: var(--color-border-hover);
    background: rgba(255, 255, 255, 0.046);
    color: var(--color-foreground);
  }

  :global(.spin) {
    animation: spin 0.8s linear infinite;
  }

  .filter-card {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
    padding: 12px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.018);
  }

  .provider-filter {
    display: grid;
    gap: 6px;
    min-width: 190px;
  }

  .provider-filter span {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 760;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .filter-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .offline-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
    padding: 12px 14px;
    border: 1px solid rgba(255, 179, 0, 0.22);
    border-radius: 14px;
    background: rgba(255, 179, 0, 0.07);
    color: var(--color-warning);
  }

  .offline-banner p {
    flex: 1;
    margin: 0;
    color: var(--color-foreground);
    font-size: 0.84rem;
  }

  .load-error-card {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 18px;
    min-height: 178px;
    margin-top: 18px;
    padding: 22px;
    border: 1px solid rgba(255, 179, 0, 0.18);
    border-radius: 24px;
    background:
      radial-gradient(circle at 100% 0%, rgba(255, 179, 0, 0.09), transparent 34%),
      linear-gradient(145deg, rgba(255, 255, 255, 0.038), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
  }

  .load-error-card__icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border: 1px solid rgba(255, 179, 0, 0.22);
    border-radius: 16px;
    background: rgba(255, 179, 0, 0.08);
    color: var(--color-warning);
  }

  .load-error-card h3,
  .load-error-card p,
  .load-error-card span {
    margin: 0;
  }

  .load-error-card h3 {
    margin-top: 4px;
    color: var(--color-foreground);
    font-size: 1.12rem;
  }

  .load-error-card span {
    display: block;
    max-width: 620px;
    margin-top: 6px;
    color: var(--color-foreground-secondary);
    font-size: 0.84rem;
    line-height: 1.45;
  }

  .main-grid {
    display: grid;
    grid-template-columns: minmax(0, 8fr) minmax(330px, 4fr);
    gap: 18px;
    align-items: start;
  }

  .left-column,
  .right-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-width: 0;
  }

  .top-grid {
    display: grid;
    grid-template-columns: minmax(260px, 3fr) minmax(0, 5fr);
    gap: 18px;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .d-card {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--color-border-subtle);
    border-radius: 24px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.038), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
    box-shadow: none;
  }

  .d-card::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(1, 250, 251, 0.26), transparent);
    pointer-events: none;
  }

  .total-revenue-card,
  .metric-card,
  .statistics-card,
  .globe-card,
  .list-card,
  .channel-card {
    padding: 18px;
  }

  .total-revenue-card {
    min-height: 304px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .total-revenue-card::after {
    content: '';
    position: absolute;
    right: -70px;
    top: -80px;
    width: 180px;
    height: 180px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(1, 250, 251, 0.12), transparent 68%);
    pointer-events: none;
  }

  .card-top {
    position: relative;
    z-index: 1;
    justify-content: space-between;
    gap: 12px;
  }

  .eyebrow {
    margin: 0 0 4px;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 760;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  h2,
  h3,
  .metric-card h3 {
    margin: 0;
    color: var(--color-foreground);
    line-height: 1.05;
    letter-spacing: 0;
  }

  h2 {
    font-family: var(--font-mono);
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 760;
    font-variant-numeric: tabular-nums;
  }

  h3 {
    font-size: 1rem;
    font-weight: 780;
  }

  .mini-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    color: var(--color-foreground);
    font-size: 0.72rem;
    font-weight: 720;
  }

  .revenue-summary {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 22px;
  }

  .revenue-summary div,
  .category-pill {
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--color-border-subtle);
  }

  .revenue-summary div {
    padding: 12px;
  }

  .revenue-summary strong,
  .revenue-summary span {
    display: block;
  }

  .revenue-summary strong {
    color: var(--color-foreground);
    font-family: var(--font-mono);
    font-size: 1.08rem;
    font-weight: 760;
  }

  .revenue-summary span {
    margin-top: 4px;
    color: var(--color-foreground-secondary);
    font-size: 0.76rem;
  }

  .category-pills {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 18px;
  }

  .category-pill {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 74px;
    padding: 10px;
    text-align: left;
  }

  .category-pill span {
    color: var(--color-foreground-secondary);
    font-size: 0.72rem;
  }

  .category-pill strong {
    color: var(--color-foreground);
    font-family: var(--font-mono);
    font-size: 0.82rem;
  }

  .metric-card {
    min-height: 143px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .metric-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .metric-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid var(--color-border-subtle);
  }

  .metric-icon.cyan {
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.07);
  }

  .metric-icon.green {
    color: var(--color-success);
    background: rgba(0, 230, 118, 0.07);
  }

  .metric-icon.magenta {
    color: var(--color-brand-magenta);
    background: rgba(255, 0, 255, 0.07);
  }

  .metric-icon.danger {
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.07);
  }

  .metric-card p {
    margin: 14px 0 6px;
    color: var(--color-foreground-secondary);
    font-size: 0.78rem;
  }

  .metric-card h3 {
    font-family: var(--font-mono);
    font-size: 1.42rem;
    font-weight: 760;
    font-variant-numeric: tabular-nums;
  }

  .trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    color: var(--color-foreground-secondary);
    font-size: 0.72rem;
  }

  .trend.up {
    color: var(--color-success);
  }

  .trend.down {
    color: var(--color-danger);
  }

  .statistics-card {
    min-height: 412px;
  }

  .statistics-head {
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .statistics-head > div:first-child {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .live-badge,
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 760;
  }

  .live-badge {
    padding: 3px 8px;
    background: rgba(0, 230, 118, 0.08);
    color: var(--color-success);
  }

  .statistics-actions {
    gap: 8px;
  }

  .period-tabs {
    display: inline-flex;
    gap: 3px;
    padding: 3px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.026);
  }

  .period-tabs button {
    min-height: 28px;
    padding: 0 10px;
    border-color: transparent;
    border-radius: 999px;
    background: transparent;
    font-size: 0.72rem;
  }

  .period-tabs button.active {
    color: var(--color-background);
    background: var(--color-foreground);
  }

  .date-strip {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 12px;
    overflow-x: auto;
    padding: 4px 0;
  }

  .date-strip button {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    border: 0;
    border-radius: 16px;
    background: transparent;
    color: var(--color-foreground-secondary);
    cursor: pointer;
  }

  .date-strip button.active {
    background: linear-gradient(135deg, var(--color-brand-cyan), var(--color-brand-magenta));
    color: var(--color-background);
  }

  .date-strip strong {
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }

  .date-strip span {
    font-size: 0.56rem;
    text-transform: uppercase;
  }

  .chart-summary {
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 12px;
  }

  .chart-summary > div {
    gap: 8px;
    flex-wrap: wrap;
  }

  .pill {
    padding: 4px 8px;
  }

  .pill.success {
    color: var(--color-success);
    background: rgba(0, 230, 118, 0.08);
  }

  .chart-summary p {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-size: 0.78rem;
  }

  .legend {
    justify-content: flex-end;
    gap: 12px;
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--color-foreground-secondary);
    font-size: 0.72rem;
  }

  .legend span::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 3px;
    background: var(--dot);
  }

  .chart-area {
    height: 230px;
  }

  .empty-state,
  .empty-list {
    display: grid;
    place-items: center;
    min-height: 120px;
    color: var(--color-foreground-secondary);
    text-align: center;
    font-size: 0.82rem;
  }

  .globe-card {
    min-height: 514px;
  }

  .globe-visual {
    position: relative;
    display: grid;
    place-items: center;
    height: 268px;
    margin: 18px 0 8px;
    overflow: hidden;
    border-radius: 22px;
    background:
      radial-gradient(circle at 50% 48%, rgba(1, 250, 251, 0.12), transparent 35%),
      radial-gradient(circle at 48% 52%, rgba(255, 0, 255, 0.1), transparent 48%),
      rgba(255, 255, 255, 0.016);
  }

  .globe-core {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 128px;
    height: 128px;
    border: 1px solid rgba(1, 250, 251, 0.22);
    border-radius: 999px;
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.05);
    box-shadow: inset 0 0 30px rgba(1, 250, 251, 0.08);
  }

  .globe-ring {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    animation: rotate-ring 14s linear infinite;
  }

  .ring-one {
    width: 210px;
    height: 210px;
  }

  .ring-two {
    width: 270px;
    height: 102px;
    transform: rotate(-18deg);
  }

  .pin {
    position: absolute;
    z-index: 3;
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--color-brand-cyan);
    box-shadow: 0 0 0 6px rgba(1, 250, 251, 0.1);
    animation: status-pulse 2s ease-in-out infinite;
  }

  .pin-a {
    top: 62px;
    left: 88px;
  }

  .pin-b {
    right: 78px;
    top: 116px;
    animation-delay: -0.7s;
  }

  .pin-c {
    right: 128px;
    bottom: 58px;
    animation-delay: -1.1s;
  }

  .location-list,
  .list-stack,
  .channel-stack {
    display: flex;
    flex-direction: column;
  }

  .location-row,
  .order-row,
  .product-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 11px;
    width: 100%;
    padding: 10px 0;
    border: 0;
    border-bottom: 1px solid var(--color-border-subtle);
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }

  .location-row:last-child,
  .order-row:last-child,
  .product-row:last-child {
    border-bottom: 0;
  }

  .provider-mark,
  .avatar,
  .thumb {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 999px;
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.07);
    border: 1px solid rgba(1, 250, 251, 0.14);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    font-weight: 760;
  }

  .thumb {
    border-radius: 12px;
  }

  .location-row strong,
  .order-row strong,
  .product-row strong,
  .channel-row strong {
    display: block;
    color: var(--color-foreground);
    font-size: 0.84rem;
    font-weight: 720;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .location-row small,
  .order-row small,
  .product-row small,
  .channel-row span {
    display: block;
    color: var(--color-foreground-secondary);
    font-size: 0.72rem;
    margin-top: 2px;
  }

  .location-row em,
  .order-row em,
  .product-row em {
    padding: 3px 7px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.035);
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.56rem;
    font-style: normal;
    font-weight: 760;
    text-transform: uppercase;
  }

  em.success {
    color: var(--color-success);
    background: rgba(0, 230, 118, 0.08);
  }

  em.warning {
    color: var(--color-warning);
    background: rgba(255, 179, 0, 0.08);
  }

  em.danger {
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.08);
  }

  .upgrade-card {
    position: relative;
    overflow: hidden;
    min-height: 164px;
    padding: 22px;
    border-radius: 24px;
    background:
      radial-gradient(circle at 84% 8%, rgba(1, 250, 251, 0.38), transparent 32%),
      linear-gradient(135deg, rgba(255, 0, 255, 0.74), rgba(114, 34, 131, 0.78), rgba(1, 250, 251, 0.28));
    color: var(--color-foreground);
  }

  .upgrade-card h3 {
    margin: 12px 0 6px;
    font-size: 1.3rem;
  }

  .upgrade-card p {
    max-width: 280px;
    margin: 0 0 16px;
    color: rgba(246, 246, 255, 0.78);
    font-size: 0.86rem;
    line-height: 1.45;
  }

  .upgrade-card button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 12px;
    border-color: rgba(255, 255, 255, 0.24);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: var(--color-foreground);
    font-weight: 720;
  }

  .bottom-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-top: 18px;
  }

  .list-card,
  .channel-card {
    min-height: 326px;
  }

  .list-stack {
    margin-top: 12px;
  }

  .row-right,
  .channel-value {
    text-align: right;
  }

  .row-right strong,
  .channel-value strong {
    font-family: var(--font-mono);
    font-size: 0.78rem;
  }

  .channel-stack {
    gap: 15px;
    margin-top: 18px;
  }

  .channel-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px 14px;
    align-items: center;
  }

  .progress {
    grid-column: 1 / -1;
    height: 7px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
  }

  .progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--color-brand-cyan), var(--color-brand-magenta));
  }

  .queue-strip {
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 18px;
    padding: 12px;
    border: 1px solid rgba(255, 179, 0, 0.18);
    border-radius: 18px;
    background: rgba(255, 179, 0, 0.06);
  }

  .queue-strip > div {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--color-warning);
  }

  .queue-strip button {
    min-height: 30px;
    padding: 0 10px;
    border-radius: 999px;
    color: var(--color-foreground);
  }

  .template-skeleton {
    display: grid;
    grid-template-columns: minmax(0, 8fr) minmax(330px, 4fr);
    gap: 18px;
  }

  .skeleton-left,
  .skeleton-right {
    display: grid;
    gap: 18px;
  }

  .skeleton-grid {
    display: grid;
    grid-template-columns: minmax(260px, 3fr) minmax(0, 5fr);
    gap: 18px;
  }

  .skeleton-kpis,
  .skeleton-bottom {
    display: grid;
    gap: 18px;
  }

  .skeleton-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .skeleton-bottom {
    grid-column: 1 / -1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .skeleton-card {
    min-height: 140px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 24px;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.035),
      rgba(1, 250, 251, 0.08),
      rgba(255, 255, 255, 0.035)
    );
    background-size: 200% 100%;
    animation: skeleton-wave 1.5s ease-in-out infinite;
  }

  .skeleton-feature {
    min-height: 304px;
  }

  .skeleton-chart {
    min-height: 412px;
  }

  .skeleton-globe {
    min-height: 514px;
  }

  .skeleton-cta {
    min-height: 164px;
  }

  @keyframes skeleton-wave {
    0% {
      background-position: 0% 50%;
      opacity: 0.45;
    }
    50% {
      opacity: 0.82;
    }
    100% {
      background-position: -200% 50%;
      opacity: 0.45;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes status-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.78;
    }
    50% {
      transform: scale(1.12);
      opacity: 1;
    }
  }

  @keyframes rotate-ring {
    to {
      rotate: 360deg;
    }
  }

  @media (max-width: 1180px) {
    .main-grid,
    .template-skeleton {
      grid-template-columns: 1fr;
    }

    .right-column {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, 0.7fr);
    }
  }

  @media (max-width: 900px) {
    .top-grid,
    .skeleton-grid,
    .right-column,
    .bottom-grid,
    .skeleton-bottom {
      grid-template-columns: 1fr;
    }

    .toolbar-row {
      align-items: flex-start;
      flex-direction: column;
    }

    .load-error-card {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .shop-dashboard {
      padding: 12px 14px 34px;
    }

    .metric-grid,
    .category-pills,
    .revenue-summary,
    .skeleton-kpis {
      grid-template-columns: 1fr;
    }

    .statistics-head,
    .chart-summary {
      align-items: flex-start;
      flex-direction: column;
    }

    .legend {
      justify-content: flex-start;
    }

    .location-row,
    .order-row,
    .product-row {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .location-row em,
    .product-row em,
    .row-right {
      grid-column: 2;
      text-align: left;
    }
  }
</style>
