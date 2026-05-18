<script lang="ts">
  import { page } from '$app/state';
  import { Calculator, Plus, RefreshCw, Save, Trash2 } from 'lucide-svelte';
  import PageShell from '$appmod/shared/widgets/PageShell.svelte';
  import MetricPanel from '$appmod/shared/widgets/MetricPanel.svelte';
  import ActionToolbar from '$appmod/shared/widgets/ActionToolbar.svelte';
  import StatusBadge from '$appmod/shared/widgets/StatusBadge.svelte';
  import { formatCurrency, formatDate, formatBasisPoints } from '$appmod/shared/utils/formatters';
  import { hasPermission, type AdminRole } from '$appmod/shared/guards/adminGuard';
  import { appServices } from '$core/service_locator/dependencies';
  import type { FeeCalculation, FeeRule, FeeType } from '../../domain/entities/Fee';

  const service = appServices.fees();

  let items = $state<FeeRule[]>([]);
  let total = $state(0);
  let loading = $state(true);
  let saving = $state(false);
  let deletingId = $state('');
  let error = $state('');
  let message = $state('');
  let editing = $state<FeeRule | null>(null);
  let showForm = $state(false);
  let form = $state({
    merchantId: '',
    feeType: 'PIX' as FeeType,
    calculation: 'PERCENTAGE_PLUS_FIXED' as FeeCalculation,
    percentage: '2.50',
    fixedAmount: '0.39',
    minFee: '',
    maxFee: '',
    isActive: true
  });
  let simulation = $state({
    amount: '100.00',
    feeType: 'PIX' as FeeType,
    merchantId: ''
  });
  let simulationResult = $state<{ grossAmount: number; feeAmount: number; netAmount: number; ruleId?: string | null; calculationType?: string | null } | null>(null);
  let simulating = $state(false);

  const canManage = $derived(hasPermission(page.data.adminRole as AdminRole, 'ADMIN'));
  const activeCount = $derived(items.filter((item) => item.isActive).length);
  const inactiveCount = $derived(items.filter((item) => !item.isActive).length);
  const merchantRules = $derived(items.filter((item) => item.merchantId).length);

  const feeTypes: FeeType[] = ['PIX', 'BOLETO', 'CREDIT_CARD', 'DEBIT_CARD', 'WITHDRAWAL', 'ANTICIPATION'];
  const calculations: FeeCalculation[] = ['PERCENTAGE', 'FIXED', 'PERCENTAGE_PLUS_FIXED'];

  function toCents(value: string): number {
    return Math.round(Number(value.replace(',', '.')) * 100) || 0;
  }

  function toBasisPoints(value: string): number {
    return Math.round(Number(value.replace(',', '.')) * 100) || 0;
  }

  function fromCents(value?: number | null): string {
    return value === undefined || value === null ? '' : (value / 100).toFixed(2);
  }

  function resetForm() {
    editing = null;
    form = {
      merchantId: '',
      feeType: 'PIX',
      calculation: 'PERCENTAGE_PLUS_FIXED',
      percentage: '2.50',
      fixedAmount: '0.39',
      minFee: '',
      maxFee: '',
      isActive: true
    };
  }

  function editRule(rule: FeeRule) {
    editing = rule;
    showForm = true;
    form = {
      merchantId: rule.merchantId ?? '',
      feeType: rule.feeType,
      calculation: rule.calculation,
      percentage: (rule.percentageRate / 100).toFixed(2),
      fixedAmount: fromCents(rule.fixedAmount),
      minFee: fromCents(rule.minFee),
      maxFee: fromCents(rule.maxFee),
      isActive: rule.isActive
    };
  }

  async function loadFees() {
    loading = true;
    error = '';
    const result = await service.list(1, 100);
    loading = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    items = result.value.items ?? [];
    total = result.value.total ?? items.length;
  }

  async function saveRule() {
    if (!canManage) return;
    saving = true;
    error = '';
    message = '';

    const payload = {
      merchantId: form.merchantId.trim() || null,
      feeType: form.feeType,
      calculation: form.calculation,
      percentageRate: toBasisPoints(form.percentage),
      fixedAmount: toCents(form.fixedAmount),
      minFee: form.minFee ? toCents(form.minFee) : null,
      maxFee: form.maxFee ? toCents(form.maxFee) : null,
      isActive: form.isActive
    };

    const result = editing
      ? await service.update(editing.id, payload)
      : await service.create(payload);
    saving = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    message = editing ? 'Regra atualizada.' : 'Regra criada.';
    showForm = false;
    resetForm();
    await loadFees();
  }

  async function removeRule(rule: FeeRule) {
    if (!canManage) return;
    const confirmed = window.confirm(`Remover regra ${rule.feeType}?`);
    if (!confirmed) return;

    deletingId = rule.id;
    const result = await service.delete(rule.id);
    deletingId = '';

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    message = 'Regra removida.';
    await loadFees();
  }

  async function toggleRule(rule: FeeRule) {
    if (!canManage) return;
    const result = await service.update(rule.id, { isActive: !rule.isActive });
    if (!result.ok) {
      error = result.failure.message;
      return;
    }
    await loadFees();
  }

  async function simulateFee() {
    simulating = true;
    error = '';
    const result = await service.simulate({
      feeType: simulation.feeType,
      amount: toCents(simulation.amount),
      merchantId: simulation.merchantId.trim() || null
    });
    simulating = false;

    if (!result.ok) {
      error = result.failure.message;
      return;
    }

    simulationResult = result.value;
  }

  $effect(() => {
    loadFees();
  });
</script>

<PageShell
  eyebrow="Revenue ops"
  title="Taxas"
  subtitle="Regras globais ou por merchant, com simulador operacional antes de aplicar em producao."
  wide
>
  {#snippet actions()}
    <button class="ghost" type="button" onclick={loadFees}><RefreshCw size={15} /> Atualizar</button>
    {#if canManage}
      <button class="primary" type="button" onclick={() => { resetForm(); showForm = !showForm; }}><Plus size={15} /> Nova regra</button>
    {/if}
  {/snippet}

  <div class="metrics">
    <MetricPanel label="Total" value={total} tone="cyan" caption="Regras encontradas" />
    <MetricPanel label="Ativas" value={activeCount} tone="success" />
    <MetricPanel label="Inativas" value={inactiveCount} tone="warning" />
    <MetricPanel label="Por merchant" value={merchantRules} tone="magenta" />
  </div>

  {#if error}<div class="notice notice--error">{error}</div>{/if}
  {#if message}<div class="notice notice--success">{message}</div>{/if}

  <div class="layout">
    <section>
      <ActionToolbar>
        <span class="toolbar-copy">CRUD server-aware de fee rules</span>
      </ActionToolbar>

      {#if showForm}
        <div class="form-panel">
          <header>
            <div>
              <p>{editing ? 'Editar regra' : 'Nova regra'}</p>
              <h2>{editing?.feeType ?? 'Fee rule'}</h2>
            </div>
            <button class="ghost" type="button" onclick={() => { showForm = false; resetForm(); }}>Fechar</button>
          </header>

          <div class="form-grid">
            <label><span>Merchant ID opcional</span><input bind:value={form.merchantId} placeholder="global se vazio" /></label>
            <label><span>Tipo</span><select bind:value={form.feeType}>{#each feeTypes as type}<option value={type}>{type}</option>{/each}</select></label>
            <label><span>Calculo</span><select bind:value={form.calculation}>{#each calculations as calc}<option value={calc}>{calc}</option>{/each}</select></label>
            <label><span>Percentual (%)</span><input bind:value={form.percentage} inputmode="decimal" /></label>
            <label><span>Fixo (R$)</span><input bind:value={form.fixedAmount} inputmode="decimal" /></label>
            <label><span>Status</span><select bind:value={form.isActive}><option value={true}>Ativa</option><option value={false}>Inativa</option></select></label>
            <label><span>Minimo (R$)</span><input bind:value={form.minFee} inputmode="decimal" /></label>
            <label><span>Maximo (R$)</span><input bind:value={form.maxFee} inputmode="decimal" /></label>
          </div>

          <footer>
            <button class="primary" type="button" onclick={saveRule} disabled={saving}>
              <Save size={15} /> {saving ? 'Salvando...' : 'Salvar regra'}
            </button>
          </footer>
        </div>
      {/if}

      <section class="table-card">
        {#if loading}
          <div class="empty">Carregando regras...</div>
        {:else if items.length === 0}
          <div class="empty">Nenhuma regra cadastrada.</div>
        {:else}
          <div class="table">
            <div class="row head">
              <span>Escopo</span>
              <span>Tipo</span>
              <span>Calculo</span>
              <span>Taxa</span>
              <span>Status</span>
              <span>Acoes</span>
            </div>
            {#each items as rule}
              <div class="row">
                <span><strong>{rule.merchantId ? 'Merchant' : 'Global'}</strong><small>{rule.merchantId ?? rule.tenantId ?? 'tenant'}</small></span>
                <span>{rule.feeType}</span>
                <span>{rule.calculation}</span>
                <span><strong>{formatBasisPoints(rule.percentageRate)}</strong><small>+ {formatCurrency(rule.fixedAmount)}</small></span>
                <span><StatusBadge status={rule.isActive ? 'ACTIVE' : 'INACTIVE'} /></span>
                <span class="actions">
                  <button type="button" class="ghost" onclick={() => editRule(rule)} disabled={!canManage}>Editar</button>
                  <button type="button" class="ghost" onclick={() => toggleRule(rule)} disabled={!canManage}>{rule.isActive ? 'Desativar' : 'Ativar'}</button>
                  <button type="button" class="danger" onclick={() => removeRule(rule)} disabled={!canManage || deletingId === rule.id}>
                    <Trash2 size={14} /> {deletingId === rule.id ? '...' : 'Remover'}
                  </button>
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    </section>

    <aside class="sim-panel">
      <div class="panel-title">
        <Calculator size={18} />
        <div>
          <p>Simulador</p>
          <h2>Fee preview</h2>
        </div>
      </div>

      <label><span>Valor bruto (R$)</span><input bind:value={simulation.amount} inputmode="decimal" /></label>
      <label><span>Tipo</span><select bind:value={simulation.feeType}>{#each feeTypes as type}<option value={type}>{type}</option>{/each}</select></label>
      <label><span>Merchant ID opcional</span><input bind:value={simulation.merchantId} /></label>
      <button class="primary" type="button" onclick={simulateFee} disabled={simulating}>{simulating ? 'Simulando...' : 'Simular taxa'}</button>

      {#if simulationResult}
        <div class="result">
          <span>Bruto <strong>{formatCurrency(simulationResult.grossAmount)}</strong></span>
          <span>Taxa <strong>{formatCurrency(simulationResult.feeAmount)}</strong></span>
          <span>Liquido <strong>{formatCurrency(simulationResult.netAmount)}</strong></span>
          <small>{simulationResult.calculationType ?? 'regra'} {simulationResult.ruleId ? `#${simulationResult.ruleId}` : ''}</small>
        </div>
      {/if}
    </aside>
  </div>
</PageShell>

<style>
  .metrics,
  .layout,
  .form-grid {
    display: grid;
    gap: 14px;
  }

  .metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin-bottom: 16px;
  }

  .layout {
    grid-template-columns: minmax(0, 1fr) 340px;
    align-items: start;
  }

  button,
  input,
  select {
    font: inherit;
  }

  .primary,
  .ghost,
  .danger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 36px;
    padding: 0 11px;
    border-radius: 10px;
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

  .danger {
    border: 1px solid rgba(255, 59, 92, 0.18);
    color: var(--color-danger);
    background: rgba(255, 59, 92, 0.06);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toolbar-copy,
  label span,
  .panel-title p,
  .form-panel p {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .form-panel,
  .table-card,
  .sim-panel {
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
  }

  .form-panel,
  .sim-panel {
    padding: 16px;
  }

  .form-panel {
    margin-bottom: 14px;
  }

  .form-panel header,
  .form-panel footer,
  .panel-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .form-panel header {
    margin-bottom: 14px;
  }

  .form-panel footer {
    margin-top: 14px;
  }

  h2,
  p {
    margin: 0;
  }

  h2 {
    font-size: 1.12rem;
  }

  .form-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  label {
    display: grid;
    gap: 7px;
  }

  input,
  select {
    min-height: 39px;
    padding: 0 11px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    background: #09090f;
    color: var(--color-foreground);
    outline: none;
  }

  .table-card {
    overflow-x: auto;
  }

  .table {
    min-width: 920px;
  }

  .row {
    display: grid;
    grid-template-columns: 1.25fr 0.75fr 1.1fr 0.85fr 0.7fr 1.35fr;
    gap: 12px;
    align-items: center;
    padding: 13px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.065);
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

  .row small {
    display: block;
    margin-top: 4px;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.74rem;
    word-break: break-all;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .sim-panel {
    position: sticky;
    top: 86px;
    display: grid;
    gap: 13px;
  }

  .result {
    display: grid;
    gap: 9px;
    padding: 13px;
    border: 1px solid rgba(1, 250, 251, 0.16);
    border-radius: 13px;
    background: rgba(1, 250, 251, 0.045);
  }

  .result span {
    display: flex;
    justify-content: space-between;
    gap: 10px;
  }

  .result small {
    color: var(--color-foreground-secondary);
    word-break: break-all;
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
    text-align: center;
  }

  @media (max-width: 1080px) {
    .metrics,
    .layout,
    .form-grid {
      grid-template-columns: 1fr;
    }

    .sim-panel {
      position: static;
    }
  }
</style>
