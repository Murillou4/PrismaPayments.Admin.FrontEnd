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
        {section.active.toLocaleString('pt-BR')} ativos ·
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
            <p class="methods">{p.supportedMethods.join(' · ')}</p>
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
    background: #0f0f18;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    overflow: hidden;
  }
  .panel-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 230, 118, 0.25) 40%,
      rgba(255, 59, 92, 0.2) 100%
    );
  }
  .panel-head {
    margin-bottom: 14px;
  }
  .sec-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #9090a8;
    margin: 0 0 6px;
    padding-bottom: 8px;
    border-bottom: 1px solid #1e1e2e;
  }
  .panel-meta {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #9090a8;
    margin: 0;
  }
  .panel-meta .warn {
    color: #ff3b5c;
  }
  .sk-line {
    height: 14px;
    width: 220px;
    background: #141420;
    border-radius: 4px;
    animation: pulse 1.6s ease-in-out infinite;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
  }
  .card {
    background: #141420;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 14px 16px;
    transition: border-color 0.15s;
  }
  .card:hover {
    border-color: rgba(255, 255, 255, 0.12);
  }
  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .card-name {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #f6f6ff;
    line-height: 1.3;
  }
  .badge {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 3px 10px;
    border-radius: 9999px;
    border: 1px solid;
  }
  .badge--success {
    background: rgba(0, 230, 118, 0.1);
    color: #00e676;
    border-color: rgba(0, 230, 118, 0.22);
  }
  .badge--danger {
    background: rgba(255, 59, 92, 0.1);
    color: #ff3b5c;
    border-color: rgba(255, 59, 92, 0.22);
  }
  .badge--warning {
    background: rgba(255, 179, 0, 0.1);
    color: #ffb300;
    border-color: rgba(255, 179, 0, 0.22);
  }
  .badge--neutral {
    background: #141420;
    color: #9090a8;
    border-color: rgba(255, 255, 255, 0.08);
  }
  .card-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    color: #3a3a50;
    margin: 8px 0 0;
  }
  .methods {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    color: #9090a8;
    margin: 8px 0 0;
    line-height: 1.4;
  }
  .empty {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: #3a3a50;
    margin: 0;
  }
  .sk {
    min-height: 88px;
    animation: pulse 1.6s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.35;
    }
    50% {
      opacity: 0.65;
    }
  }
  .anim {
    animation: enter 0.38s cubic-bezier(0.22, 1, 0.36, 1) 160ms both;
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
</style>
