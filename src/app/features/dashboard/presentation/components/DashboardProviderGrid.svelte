<script lang="ts">
  import type { ProvidersSection } from '../../domain/entities/AdminDashboardResponse';

  type Props = {
    section: ProvidersSection | null;
    loading: boolean;
  };

  let { section, loading }: Props = $props();

  function badgeVariant(
    status: string
  ): 'success' | 'danger' | 'warning' | 'neutral' {
    const s = status.toLowerCase();
    if (/(healthy|ok|up|online|active|good)/.test(s)) return 'success';
    if (/(down|error|fail|unhealthy|offline|dead)/.test(s)) return 'danger';
    if (/(degrad|warn|slow|unknown)/.test(s)) return 'warning';
    return 'neutral';
  }
</script>

<div class="panel anim">
  <div class="panel-accent" aria-hidden="true"></div>
  <div class="panel-head">
    <p class="sec-label">Provedores</p>
    {#if !loading && section}
      <p class="panel-meta">
        {section.active.toLocaleString('pt-BR')} ativos /
        <span class:warn={section.unhealthy > 0}>{section.unhealthy.toLocaleString('pt-BR')} com falha</span>
      </p>
    {:else if loading}
      <p class="panel-meta sk-line"></p>
    {/if}
  </div>
  {#if loading}
    <div class="grid">
      {#each [1, 2, 3] as _}
        <div class="card sk"></div>
      {/each}
    </div>
  {:else if section && section.items.length > 0}
    <div class="grid">
      {#each section.items as p (p.id)}
        {@const v = badgeVariant(p.healthStatus)}
        <div class="card">
          <div class="card-top">
            <span class="card-name">{p.displayName || p.name}</span>
            <span class="badge" class:badge--success={v === 'success'} class:badge--danger={v === 'danger'} class:badge--warning={v === 'warning'} class:badge--neutral={v === 'neutral'}>
              {p.healthStatus}
            </span>
          </div>
          {#if p.lastHealthCheck}
            <p class="card-sub">Check: {new Date(p.lastHealthCheck).toLocaleString('pt-BR')}</p>
          {/if}
          {#if p.supportedMethods?.length}
            <p class="methods">{p.supportedMethods.join(' / ')}</p>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty">Nenhum provedor retornado</p>
  {/if}
</div>

<style>
  .panel {
    position: relative;
    padding: 16px;
    margin-bottom: 18px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.042), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
    box-shadow: var(--shadow-md);
  }

  .panel::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 12% 0%, rgba(1, 250, 251, 0.07), transparent 34%),
      radial-gradient(circle at 82% 20%, rgba(255, 0, 255, 0.05), transparent 28%);
    opacity: 0.9;
    pointer-events: none;
  }

  .panel-accent {
    position: absolute;
    inset: 0 auto 0 0;
    width: 2px;
    background: linear-gradient(
      180deg,
      rgba(1, 250, 251, 0.66),
      rgba(255, 0, 255, 0.2),
      transparent
    );
  }

  .panel-head,
  .grid,
  .empty {
    position: relative;
    z-index: 1;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  .sec-label {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    font-weight: 760;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .panel-meta {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 620;
    text-align: right;
  }

  .panel-meta .warn {
    color: var(--color-danger);
  }

  .sk-line {
    width: 220px;
    height: 13px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.055);
    animation: pulse 1.55s ease-in-out infinite;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(218px, 1fr));
    gap: 10px;
  }

  .card {
    min-height: 92px;
    padding: 13px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 14px;
    background:
      linear-gradient(160deg, rgba(255, 255, 255, 0.037), rgba(255, 255, 255, 0.008)),
      rgba(255, 255, 255, 0.018);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
    transition:
      transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: var(--color-border-hover);
    background: rgba(255, 255, 255, 0.038);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .card-name {
    color: var(--color-foreground);
    font-size: 0.86rem;
    font-weight: 760;
    line-height: 1.25;
  }

  .badge {
    flex-shrink: 0;
    padding: 3px 8px;
    border: 1px solid;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 760;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .badge--success {
    color: var(--color-success);
    border-color: rgba(0, 230, 118, 0.24);
    background: rgba(0, 230, 118, 0.075);
  }

  .badge--danger {
    color: var(--color-danger);
    border-color: rgba(255, 59, 92, 0.28);
    background: rgba(255, 59, 92, 0.075);
  }

  .badge--warning {
    color: var(--color-warning);
    border-color: rgba(255, 179, 0, 0.26);
    background: rgba(255, 179, 0, 0.075);
  }

  .badge--neutral {
    color: var(--color-foreground-secondary);
    border-color: var(--color-border-subtle);
    background: rgba(255, 255, 255, 0.026);
  }

  .card-sub {
    margin: 9px 0 0;
    color: var(--color-foreground-disabled);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    line-height: 1.45;
  }

  .methods {
    margin: 8px 0 0;
    color: var(--color-foreground-secondary);
    font-size: 0.72rem;
    line-height: 1.45;
  }

  .empty {
    margin: 0;
    padding: 18px;
    border: 1px dashed var(--color-border-subtle);
    border-radius: 14px;
    color: var(--color-foreground-secondary);
    font-size: 0.82rem;
    text-align: center;
  }

  .sk {
    min-height: 88px;
    animation: pulse 1.55s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.42;
    }
    50% {
      opacity: 0.82;
    }
  }

  .anim {
    animation: enter 0.38s cubic-bezier(0.16, 1, 0.3, 1) 160ms both;
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 760px) {
    .panel-head {
      align-items: flex-start;
      flex-direction: column;
    }

    .panel-meta {
      text-align: left;
    }
  }
</style>
