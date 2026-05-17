<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    DoughnutController
  } from 'chart.js';
  import type { ChartData } from 'chart.js';
  import { Bar } from 'svelte5-chartjs';
  import {
    AlertTriangle,
    Clock,
    TrendingUp,
    Wallet,
    Hourglass,
    Receipt,
    CreditCard,
    Store,
    ShieldAlert,
    ScanFace,
    Filter,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    RefreshCw,
    Activity,
    Users,
    Ban,
    UserSearch,
    Percent
  } from 'lucide-svelte';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import DateRangeFilter from '$appmod/shared/widgets/filters/DateRangeFilter.svelte';
  import SelectFilter from '$appmod/shared/widgets/filters/SelectFilter.svelte';
  import { appServices } from '$core/service_locator/dependencies';
  import { formatCurrency, formatPercentage } from '$appmod/shared/utils/formatters';
  import DashboardKpiStat from '../components/DashboardKpiStat.svelte';
  import DashboardQueueStrip from '../components/DashboardQueueStrip.svelte';
  import DashboardMethodDonut from '../components/DashboardMethodDonut.svelte';
  import DashboardProviderGrid from '../components/DashboardProviderGrid.svelte';
  import DashboardDisputesTable from '../components/DashboardDisputesTable.svelte';
  import DashboardWebhookFailuresTable from '../components/DashboardWebhookFailuresTable.svelte';
  import type {
    AdminDashboardResponse,
    AdminDashboardFilters,
    PaymentStatus,
    PaymentMethod
  } from '../../domain/entities/AdminDashboardResponse';

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    DoughnutController,
    Title,
    Tooltip,
    Legend
  );

  type PeriodKey = 'today' | 'week' | 'month' | 'year';

  const METHOD_LABELS: Record<string, string> = {
    PIX: 'PIX',
    BOLETO: 'Boleto',
    CREDIT_CARD: 'Cartão crédito',
    DEBIT_CARD: 'Cartão débito'
  };

  const DONUT_BG = [
    'rgba(1, 250, 251, 0.72)',
    'rgba(255, 0, 255, 0.5)',
    'rgba(114, 34, 131, 0.78)',
    'rgba(255, 179, 0, 0.65)',
    'rgba(0, 230, 118, 0.45)',
    'rgba(246, 246, 255, 0.25)'
  ];

  let dashboard = $state<AdminDashboardResponse | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let activePeriod = $state<PeriodKey>('week');
  let filtersOpen = $state(false);

  let filterStartDate = $state('');
  let filterEndDate = $state('');
  let filterPaymentStatus = $state('');
  let filterMethod = $state('');
  let filterMerchantId = $state('');
  let filterMerchantStatus = $state('');
  let filterDisputeStatus = $state('');
  let filterProviderName = $state('');

  const service = appServices.dashboard();

  const PERIODS: { key: PeriodKey; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mês' },
    { key: 'year', label: 'Ano' }
  ];

  function getPeriodDates(period: PeriodKey): { start: string; end: string } {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const start = new Date(today);
    if (period === 'week') {
      start.setDate(start.getDate() - 6);
    } else if (period === 'month') {
      start.setDate(start.getDate() - 29);
    } else if (period === 'year') {
      start.setFullYear(start.getFullYear() - 1);
    }
    return { start: start.toISOString().slice(0, 10), end };
  }

  function applyPeriodPreset(period: PeriodKey) {
    activePeriod = period;
    const { start, end } = getPeriodDates(period);
    filterStartDate = start;
    filterEndDate = end;
    fetchDashboard();
  }

  const derivedChartData = $derived.by(() => {
    if (!dashboard) return { labels: [] as string[], datasets: [] };

    const items = dashboard.payments.items ?? [];
    const buckets = new Map<string, number>();
    const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    if (activePeriod === 'today') {
      for (let h = 0; h < 24; h++) buckets.set(`${h.toString().padStart(2, '0')}h`, 0);
    } else if (activePeriod === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        buckets.set(DAYS_PT[d.getDay()], 0);
      }
    } else if (activePeriod === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        buckets.set(
          `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
          0
        );
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        buckets.set(MONTHS_PT[d.getMonth()], 0);
      }
    }

    for (const item of items) {
      if (!item.createdAt || !item.amount) continue;
      const d = new Date(item.createdAt);
      let key: string;
      if (activePeriod === 'today') {
        key = `${d.getHours().toString().padStart(2, '0')}h`;
      } else if (activePeriod === 'week') {
        key = DAYS_PT[d.getDay()];
      } else if (activePeriod === 'month') {
        key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        key = MONTHS_PT[d.getMonth()];
      }
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + item.amount);
      }
    }

    return {
      labels: Array.from(buckets.keys()),
      datasets: [
        {
          label: 'Volume (R$)',
          data: Array.from(buckets.values()).map((v) => v / 100),
          backgroundColor: 'rgba(1, 250, 251, 0.08)',
          borderColor: 'rgba(1, 250, 251, 0.40)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(1, 250, 251, 0.14)',
          hoverBorderColor: 'rgba(1, 250, 251, 0.65)'
        }
      ]
    };
  });

  const methodDonutChart = $derived.by((): ChartData<'doughnut'> => {
    const bd = dashboard?.payments?.methodBreakdown;
    if (!bd?.length) {
      return { labels: [], datasets: [] };
    }
    const filtered = bd.filter((m) => (m.amount ?? 0) > 0);
    if (filtered.length === 0) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: filtered.map((m) => METHOD_LABELS[m.method] ?? m.method),
      datasets: [
        {
          data: filtered.map((m) => m.amount / 100),
          backgroundColor: filtered.map((_, i) => DONUT_BG[i % DONUT_BG.length]),
          borderColor: '#0F0F18',
          borderWidth: 2
        }
      ]
    };
  });

  const methodDonutEmpty = $derived.by(() => {
    const labels = methodDonutChart.labels;
    if (!labels?.length) return true;
    const raw = methodDonutChart.datasets[0]?.data as number[] | undefined;
    if (!raw?.length) return true;
    return raw.every((n) => n === 0);
  });

  const successRate = $derived.by(() => {
    const t = dashboard?.payments?.total ?? 0;
    const p = dashboard?.payments?.paid ?? 0;
    if (t === 0) return null;
    return (p / t) * 100;
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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F0F18',
        borderColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        titleColor: '#F6F6FF',
        bodyColor: '#9090A8',
        padding: 12,
        cornerRadius: 10,
        titleFont: { family: 'Outfit', size: 13, weight: 600 },
        bodyFont: { family: 'Outfit', size: 12 }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#3A3A50', font: { family: 'Outfit', size: 11 } },
        border: { color: 'rgba(255,255,255,0.06)' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#3A3A50', font: { family: 'Outfit', size: 11 } },
        border: { color: 'rgba(255,255,255,0.06)' }
      }
    }
  };

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
    } else {
      error = result.failure.message;
    }
    loading = false;
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
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' }
  ];

  const merchantStatusOptions = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'SUSPENDED', label: 'Suspenso' }
  ];

  const disputeStatusOptions = [
    { value: 'OPEN', label: 'Aberto' },
    { value: 'UNDER_REVIEW', label: 'Em revisão' },
    { value: 'RESOLVED', label: 'Resolvido' },
    { value: 'CLOSED', label: 'Fechado' }
  ];

  onMount(() => {
    applyPeriodPreset('week');
  });

  const openDisputes = $derived(dashboard?.disputes?.open ?? 0);
  const pendingMerchants = $derived(dashboard?.merchants?.pending ?? 0);
  const hasChartData = $derived(derivedChartData.datasets[0]?.data.some((v) => v > 0) ?? false);
</script>

<div class="page">
  <div class="page-header anim-1">
    <div>
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Visão operacional e financeira da plataforma</p>
    </div>
    <div class="header-actions">
      <button type="button" class="btn-refresh" onclick={() => fetchDashboard()} disabled={loading} title="Atualizar dados">
        <span class="refresh-ic" class:spin={loading}>
          <RefreshCw size={15} strokeWidth={1.5} />
        </span>
        <span>Atualizar</span>
      </button>
      <button type="button" class="filter-toggle" onclick={() => (filtersOpen = !filtersOpen)}>
        <Filter size={14} strokeWidth={1.5} />
        <span>Filtros</span>
        {#if filtersOpen}
          <ChevronUp size={13} strokeWidth={1.5} />
        {:else}
          <ChevronDown size={13} strokeWidth={1.5} />
        {/if}
      </button>
    </div>
  </div>

  {#if error}
    <div class="alert-error" role="alert" aria-live="assertive">
      <div class="alert-error-inner">
        <AlertTriangle size={16} strokeWidth={1.5} />
        <span class="alert-error-msg">{error}</span>
      </div>
      <Button size="sm" variant="outline" onclick={() => fetchDashboard()}>Tentar novamente</Button>
    </div>
  {/if}

  {#if filtersOpen}
    <div class="filter-bar anim-1">
      <div class="filter-row">
        <DateRangeFilter
          value={{ from: filterStartDate, to: filterEndDate }}
          onChange={(r) => {
            filterStartDate = r.from;
            filterEndDate = r.to;
          }}
        />
        <SelectFilter
          options={paymentStatusOptions}
          value={filterPaymentStatus}
          placeholder="Status pagamento"
          onChange={(v) => (filterPaymentStatus = v)}
        />
        <SelectFilter
          options={methodOptions}
          value={filterMethod}
          placeholder="Método"
          onChange={(v) => (filterMethod = v)}
        />
      </div>
      <div class="filter-row">
        <SelectFilter
          options={merchantStatusOptions}
          value={filterMerchantStatus}
          placeholder="Status merchant"
          onChange={(v) => (filterMerchantStatus = v)}
        />
        <SelectFilter
          options={disputeStatusOptions}
          value={filterDisputeStatus}
          placeholder="Status disputa"
          onChange={(v) => (filterDisputeStatus = v)}
        />
        <div class="provider-field">
          <span class="provider-label">Provedor</span>
          <Input
            class="provider-input"
            placeholder="Nome ou ID do provedor"
            bind:value={filterProviderName}
          />
        </div>
        <div class="filter-actions">
          <Button variant="outline" size="sm" onclick={resetFilters}>
            <RotateCcw size={13} strokeWidth={1.5} />
            Limpar
          </Button>
          <Button size="sm" onclick={applyFilters}>Aplicar</Button>
        </div>
      </div>
    </div>
  {/if}

  {#if !loading && dashboard && (openDisputes > 0 || pendingMerchants > 0)}
    <div class="alerts anim-2">
      {#if openDisputes > 0}
        <button type="button" class="alert-card alert-danger" onclick={() => goto('/disputes')}>
          <AlertTriangle size={14} strokeWidth={1.5} />
          <span class="alert-label">Disputas abertas</span>
          <span class="alert-count">{openDisputes}</span>
        </button>
      {/if}
      {#if pendingMerchants > 0}
        <button
          type="button"
          class="alert-card alert-warn"
          onclick={() => goto('/merchants?verification=PENDING_REVIEW')}
        >
          <Clock size={14} strokeWidth={1.5} />
          <span class="alert-label">Merchants pendentes</span>
          <span class="alert-count">{pendingMerchants}</span>
        </button>
      {/if}
    </div>
  {/if}

  {#if !loading && dashboard && hasQueueBacklog}
    <div class="alert-queue anim-2" role="status">
      <Activity size={15} strokeWidth={1.5} />
      <span>Existem itens pendentes nas <strong>filas críticas</strong>. Revise verificação de merchants, webhooks e disputas.</span>
      <button type="button" class="alert-queue-link" onclick={() => goto('/merchants?verification=PENDING_REVIEW')}>
        Merchants
      </button>
      <button type="button" class="alert-queue-link" onclick={() => goto('/disputes')}>Disputas</button>
    </div>
  {/if}

  <DashboardQueueStrip queues={dashboard?.queues ?? null} {loading} />

  <!-- Hero: taxa de sucesso -->
  <div class="hero anim-2">
    <div class="hero-accent" aria-hidden="true"></div>
    <div class="hero-grid">
      <div class="hero-main">
        <p class="hero-eyebrow">Indicador principal</p>
        <p class="hero-label">Taxa de sucesso</p>
        {#if loading}
          <div class="hero-sk"></div>
        {:else if successRate === null}
          <p class="hero-value hero-value--muted" title="Nenhuma transação no período filtrado">—</p>
          <p class="hero-hint">Sem transações no período</p>
        {:else}
          <p class="hero-value">{formatPercentage(successRate)}</p>
          <p class="hero-hint">Pagamentos concluídos ÷ total de transações</p>
        {/if}
      </div>
      <div class="hero-side">
        <div class="hero-stat">
          <Percent size={14} strokeWidth={1.5} class="hero-ic" />
          <div>
            <p class="hero-stat-label">Volume</p>
            <p class="hero-stat-val">
              {loading || !dashboard ? '…' : formatCurrency(dashboard.payments.volume)}
            </p>
          </div>
        </div>
        <div class="hero-stat">
          <Activity size={14} strokeWidth={1.5} class="hero-ic" />
          <div>
            <p class="hero-stat-label">Transações</p>
            <p class="hero-stat-val">
              {loading || !dashboard
                ? '…'
                : dashboard.payments.total.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- KPIs financeiros -->
  <p class="block-label anim-2">Financeiro</p>
  <div class="kpi-grid kpi-grid--fin anim-2">
    {#if loading}
      {#each Array(5) as _, i (i)}
        <div class="sk-kpi"></div>
      {/each}
    {:else if dashboard}
      {@const d = dashboard}
      <DashboardKpiStat label="Volume pagamentos" value={formatCurrency(d.payments.volume)} highlight={true}>
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--cyan">
            <TrendingUp size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat
        label="Pagos"
        value={d.payments.paid.toLocaleString('pt-BR')}
        sub="{d.payments.total.toLocaleString('pt-BR')} no total"
      >
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--green">
            <Wallet size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat label="Total (criados)" value={d.payments.total.toLocaleString('pt-BR')}>
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--muted">
            <Receipt size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat
        label="Processando"
        value={d.payments.processing.toLocaleString('pt-BR')}
        mutedValue={true}
      >
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--muted">
            <Hourglass size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat
        label="Falhos"
        value={d.payments.failed.toLocaleString('pt-BR')}
        danger={d.payments.failed > 0}
      >
        {#snippet children()}
          <div
            class="metric-icon-wrap"
            class:metric-icon--danger={d.payments.failed > 0}
            class:metric-icon--purple={d.payments.failed === 0}
          >
            <Receipt size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
    {/if}
  </div>

  <!-- KPIs operacionais -->
  <p class="block-label anim-3">Operacional</p>
  <div class="kpi-grid kpi-grid--ops anim-3">
    {#if loading}
      {#each Array(10) as _, i (i)}
        <div class="sk-kpi"></div>
      {/each}
    {:else if dashboard}
      {@const d = dashboard}
      <DashboardKpiStat
        label="Saques (qtd)"
        value={d.withdrawals.total.toLocaleString('pt-BR')}
        sub="Hoje: {formatCurrency(d.withdrawals.todayVolume)}"
      >
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--cyan">
            <CreditCard size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat
        label="Saques processando"
        value={d.withdrawals.processing.toLocaleString('pt-BR')}
        mutedValue={d.withdrawals.processing === 0}
      >
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--muted">
            <Hourglass size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat
        label="Saques falhos"
        value={d.withdrawals.failed.toLocaleString('pt-BR')}
        danger={d.withdrawals.failed > 0}
      >
        {#snippet children()}
          <div class="metric-icon-wrap" class:metric-icon--danger={d.withdrawals.failed > 0}>
            <ShieldAlert size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat
        label="Merchants"
        value={d.merchants.total.toLocaleString('pt-BR')}
        sub="{d.merchants.active.toLocaleString('pt-BR')} ativos"
      >
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--cyan">
            <Store size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat label="Merchants suspensos" value={d.merchants.suspended.toLocaleString('pt-BR')}>
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--muted">
            <Ban size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat
        label="KYC pendente"
        value={d.merchants.pendingVerification.toLocaleString('pt-BR')}
        sub="Verificação"
      >
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--muted">
            <UserSearch size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat label="Disputas abertas" value={openDisputes.toLocaleString('pt-BR')} danger={openDisputes > 0}>
        {#snippet children()}
          <div class="metric-icon-wrap" class:metric-icon--danger={openDisputes > 0} class:metric-icon--muted={openDisputes === 0}>
            <ShieldAlert size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat label="Webhook failures" value={d.webhookFailures.total.toLocaleString('pt-BR')}>
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--muted">
            <ScanFace size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
      <DashboardKpiStat
        label="Merchants (pendentes)"
        value={d.merchants.pending.toLocaleString('pt-BR')}
        sub="Status pendente"
      >
        {#snippet children()}
          <div class="metric-icon-wrap metric-icon--muted">
            <Users size={14} strokeWidth={1.5} />
          </div>
        {/snippet}
      </DashboardKpiStat>
    {/if}
  </div>

  <!-- Gráficos -->
  <div class="charts-row anim-3">
    <div class="chart-panel chart-panel--bar">
      <div class="chart-accent" aria-hidden="true"></div>
      <div class="chart-header">
        <div>
          <p class="chart-title">Volume de transações</p>
          <p class="chart-subtitle">Por período selecionado</p>
        </div>
        <div class="period-pills">
          {#each PERIODS as p (p.key)}
            <button
              type="button"
              class="period-pill {activePeriod === p.key ? 'period-pill--active' : ''}"
              onclick={() => applyPeriodPreset(p.key)}
            >
              {p.label}
            </button>
          {/each}
        </div>
      </div>

      {#if loading}
        <div class="chart-skeleton-wrap">
          {#each [55, 75, 90, 60, 80, 45, 70, 65, 85, 50] as h, i (i)}
            <div class="chart-skeleton-bar" style="height: {h}%"></div>
          {/each}
        </div>
      {:else if hasChartData}
        <div class="chart-area">
          <Bar data={derivedChartData} options={barChartOptions} />
        </div>
      {:else}
        <div class="chart-empty">
          <span>Sem dados para o período</span>
        </div>
      {/if}
    </div>

    <DashboardMethodDonut data={methodDonutChart} empty={methodDonutEmpty} {loading} />
  </div>

  <DashboardProviderGrid section={dashboard?.providers ?? null} {loading} />

  <div class="tables-row anim-3">
    <DashboardDisputesTable items={dashboard?.disputes?.items ?? []} {loading} />
    <DashboardWebhookFailuresTable items={dashboard?.webhookFailures?.items ?? []} {loading} />
  </div>
</div>

<style>
  .refresh-ic {
    display: inline-flex;
  }
  .refresh-ic.spin :global(svg) {
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .page {
    padding: 28px 32px 48px;
    max-width: 1480px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  @keyframes page-enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .anim-1 {
    animation: page-enter 0.38s cubic-bezier(0.22, 1, 0.36, 1) 0ms both;
  }
  .anim-2 {
    animation: page-enter 0.38s cubic-bezier(0.22, 1, 0.36, 1) 70ms both;
  }
  .anim-3 {
    animation: page-enter 0.38s cubic-bezier(0.22, 1, 0.36, 1) 140ms both;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .page-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #f6f6ff;
    margin: 0 0 4px;
    text-transform: uppercase;
  }
  .page-subtitle {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9090a8;
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn-refresh {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 10px;
    border: 1px solid rgba(1, 250, 251, 0.22);
    background: rgba(1, 250, 251, 0.06);
    color: #01fafb;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .btn-refresh:hover:not(:disabled) {
    background: rgba(1, 250, 251, 0.1);
    border-color: rgba(1, 250, 251, 0.35);
  }
  .btn-refresh:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .btn-refresh:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #ff00ff;
  }

  .filter-toggle {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #0f0f18;
    color: #9090a8;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .filter-toggle:hover {
    border-color: rgba(255, 255, 255, 0.15);
    color: #f6f6ff;
  }

  .alert-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 59, 92, 0.22);
    background: rgba(255, 59, 92, 0.07);
    color: #ff3b5c;
    margin-bottom: 20px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
  }
  .alert-error-inner {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .alert-error-msg {
    line-height: 1.45;
  }

  .filter-bar {
    background: #0f0f18;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .filter-row {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }
  .provider-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 200px;
  }
  .provider-label {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: #9090a8;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  :global(.provider-input) {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: #f6f6ff !important;
    background: #0a0a12 !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 12px !important;
    height: 40px !important;
  }
  :global(.provider-input:focus-visible) {
    border-color: #ff00ff !important;
    box-shadow: 0 0 0 3px rgba(255, 0, 255, 0.12) !important;
  }
  .filter-actions {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .alerts {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .alert-card {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 500;
    transition: background 0.15s, transform 0.15s;
  }
  .alert-card:hover {
    transform: translateY(-1px);
  }
  .alert-card:active {
    transform: scale(0.96);
  }
  .alert-danger {
    background: rgba(255, 59, 92, 0.07);
    border-color: rgba(255, 59, 92, 0.25);
    color: #ff3b5c;
  }
  .alert-danger:hover {
    background: rgba(255, 59, 92, 0.12);
  }
  .alert-warn {
    background: rgba(255, 179, 0, 0.07);
    border-color: rgba(255, 179, 0, 0.25);
    color: #ffb300;
  }
  .alert-warn:hover {
    background: rgba(255, 179, 0, 0.12);
  }
  .alert-label {
    flex: 1;
  }
  .alert-count {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 700;
  }

  .alert-queue {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 14px;
    padding: 11px 14px;
    border-radius: 12px;
    border: 1px solid rgba(1, 250, 251, 0.2);
    background: rgba(1, 250, 251, 0.06);
    color: #01fafb;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    line-height: 1.45;
    margin-bottom: 16px;
  }
  .alert-queue strong {
    color: #f6f6ff;
    font-weight: 600;
  }
  .alert-queue-link {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: none;
    border: none;
    color: #f6f6ff;
    cursor: pointer;
    padding: 4px 0;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .alert-queue-link:hover {
    color: #01fafb;
  }
  .alert-queue-link:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #ff00ff;
    border-radius: 4px;
  }

  .hero {
    position: relative;
    background: #0f0f18;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 22px 24px;
    margin-bottom: 20px;
    overflow: hidden;
  }
  .hero-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 0, 255, 0.45) 40%,
      rgba(1, 250, 251, 0.5) 100%
    );
  }
  .hero-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 24px;
    align-items: center;
  }
  @media (max-width: 800px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }
  }
  .hero-eyebrow {
    font-family: 'Outfit', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3a3a50;
    margin: 0 0 6px;
  }
  .hero-label {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #9090a8;
    margin: 0 0 8px;
  }
  .hero-value {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(2rem, 5vw, 2.75rem);
    font-weight: 700;
    color: #01fafb;
    margin: 0;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
  }
  .hero-value--muted {
    color: #3a3a50;
    font-size: 2rem;
  }
  .hero-hint {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #3a3a50;
    margin: 8px 0 0;
  }
  .hero-sk {
    height: 48px;
    width: 180px;
    background: #141420;
    border-radius: 8px;
    animation: sk-pulse 1.6s ease-in-out infinite;
  }
  .hero-side {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .hero-stat {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: #141420;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
  }
  :global(.hero-ic) {
    color: #722283;
    flex-shrink: 0;
  }
  .hero-stat-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9090a8;
    margin: 0 0 2px;
  }
  .hero-stat-val {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f6f6ff;
    margin: 0;
    font-variant-numeric: tabular-nums;
  }

  .block-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #3a3a50;
    margin: 0 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #1e1e2e;
  }

  .kpi-grid {
    display: grid;
    gap: 10px;
    margin-bottom: 24px;
  }
  .kpi-grid--fin {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  .kpi-grid--ops {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .sk-kpi {
    min-height: 100px;
    background: #141420;
    border-radius: 16px;
    animation: sk-pulse 1.6s ease-in-out infinite;
  }
  @keyframes sk-pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.65;
    }
  }

  .metric-icon-wrap {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2px;
    flex-shrink: 0;
  }
  .metric-icon--cyan {
    background: rgba(1, 250, 251, 0.08);
    border: 1px solid rgba(1, 250, 251, 0.15);
    color: #01fafb;
  }
  .metric-icon--green {
    background: rgba(0, 230, 118, 0.08);
    border: 1px solid rgba(0, 230, 118, 0.15);
    color: #00e676;
  }
  .metric-icon--purple {
    background: rgba(114, 34, 131, 0.12);
    border: 1px solid rgba(114, 34, 131, 0.25);
    color: #8b2a9e;
  }
  .metric-icon--muted {
    background: rgba(58, 58, 80, 0.3);
    border: 1px solid rgba(58, 58, 80, 0.5);
    color: #9090a8;
  }
  .metric-icon--danger {
    background: rgba(255, 59, 92, 0.08);
    border: 1px solid rgba(255, 59, 92, 0.18);
    color: #ff3b5c;
  }

  .charts-row {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
    align-items: stretch;
  }
  @media (max-width: 1024px) {
    .charts-row {
      grid-template-columns: 1fr;
    }
  }

  .chart-panel {
    position: relative;
    background: #0f0f18;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.4);
    min-height: 380px;
    display: flex;
    flex-direction: column;
  }
  .chart-panel--bar {
    min-height: 400px;
  }

  .chart-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(1, 250, 251, 0.45) 30%,
      rgba(114, 34, 131, 0.55) 60%,
      transparent 100%
    );
    border-radius: 14px 14px 0 0;
  }

  .chart-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .chart-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #f6f6ff;
    margin: 0 0 3px;
    letter-spacing: 0.01em;
  }
  .chart-subtitle {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    color: #9090a8;
    margin: 0;
    letter-spacing: 0.04em;
  }

  .period-pills {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }
  .period-pill {
    padding: 4px 10px;
    border-radius: 7px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: transparent;
    color: #9090a8;
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.13s, border-color 0.13s, color 0.13s;
    white-space: nowrap;
  }
  .period-pill:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #f6f6ff;
    border-color: rgba(255, 255, 255, 0.13);
  }
  .period-pill--active {
    background: rgba(1, 250, 251, 0.08);
    border-color: rgba(1, 250, 251, 0.25);
    color: #01fafb;
  }
  .period-pill--active:hover {
    background: rgba(1, 250, 251, 0.12);
  }

  .chart-area {
    flex: 1;
    min-height: 320px;
    position: relative;
  }

  @media (min-width: 1280px) {
    .chart-area {
      min-height: 360px;
    }
  }

  .chart-skeleton-wrap {
    flex: 1;
    min-height: 320px;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 0 4px;
  }

  .chart-skeleton-bar {
    flex: 1;
    background: #141420;
    border-radius: 5px 5px 0 0;
    animation: sk-pulse 1.6s ease-in-out infinite;
  }

  .chart-empty {
    flex: 1;
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #3a3a50;
    letter-spacing: 0.06em;
  }

  .tables-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 960px) {
    .tables-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .page {
      padding: 16px 14px 32px;
    }
    .filter-actions {
      margin-left: 0;
      width: 100%;
      justify-content: flex-end;
    }
    .kpi-grid--ops {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
