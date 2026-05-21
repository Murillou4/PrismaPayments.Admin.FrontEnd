<script lang="ts">
  import { Doughnut } from 'svelte5-chartjs';
  import type { ChartData } from 'chart.js';

  type Props = {
    data: ChartData<'doughnut'>;
    empty: boolean;
    loading: boolean;
  };

  let { data, empty, loading }: Props = $props();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '66%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9A9AAF',
          font: { family: 'JetBrains Mono Variable', size: 10 },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle' as const
        }
      },
      tooltip: {
        backgroundColor: '#0F0F18',
        borderColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        titleColor: '#F6F6FF',
        bodyColor: '#9090A8',
        padding: 12,
        cornerRadius: 10,
        titleFont: { family: 'Onest Variable', size: 13, weight: 700 },
        bodyFont: { family: 'Onest Variable', size: 12 },
        callbacks: {
          label(ctx: { parsed: number; dataset: { data?: number[] } }) {
            const v = ctx.parsed;
            return ` R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        }
      }
    }
  };
</script>

<div class="panel anim">
  <div class="panel-accent" aria-hidden="true"></div>
  <div class="panel-head">
    <p class="sec-label">Mix por método</p>
    <p class="panel-hint">Volume em R$ por canal</p>
  </div>
  {#if loading}
    <div class="donut-skeleton">
      <div class="ring sk"></div>
    </div>
  {:else if empty}
    <div class="empty">Sem dados de método no período</div>
  {:else}
    <div class="donut-wrap">
      <Doughnut {data} {options} />
    </div>
  {/if}
</div>

<style>
  .panel {
    position: relative;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.014)),
      var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 20px;
    padding: 20px;
    height: 100%;
    min-height: 320px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow:
      0 18px 44px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.055);
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
      rgba(114, 34, 131, 0.5) 45%,
      rgba(1, 250, 251, 0.45) 100%
    );
  }
  .panel-head {
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .sec-label {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--color-foreground-secondary);
    margin: 0 0 4px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .panel-hint {
    font-size: 0.74rem;
    color: var(--color-foreground-secondary);
    margin: 0;
  }
  .donut-wrap {
    flex: 1;
    min-height: 240px;
    position: relative;
  }
  .donut-skeleton {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
  }
  .ring {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 14px solid var(--color-surface-inset);
  }
  .sk {
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
  .empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.78rem;
    color: var(--color-foreground-secondary);
    letter-spacing: 0.06em;
    min-height: 200px;
  }
  .anim {
    animation: enter 0.38s cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
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
