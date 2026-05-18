<script lang="ts">
  import type { FlowGraph, FlowGraphEdge, FlowGraphNode } from '../../domain/entities/Diagnostics';
  import { formatDate } from '$appmod/shared/utils/formatters';

  interface Props {
    graph: FlowGraph | null;
    loading?: boolean;
    selectedNodeId?: string | null;
  }

  type PositionedNode = FlowGraphNode & {
    x: number;
    y: number;
    width: number;
    height: number;
    rank: number;
  };

  type PositionedEdge = FlowGraphEdge & {
    path: string;
    color: string;
    dashed: boolean;
  };

  const nodeWidth = 238;
  const nodeHeight = 104;
  const columnGap = 300;
  const rowGap = 144;
  const margin = 34;

  let { graph, loading = false, selectedNodeId = $bindable(null) }: Props = $props();

  const layout = $derived.by(() => buildLayout(graph));

  function rankFor(node: FlowGraphNode) {
    const type = node.type?.toUpperCase();
    if (type === 'SESSION') return 0;
    if (type === 'API_KEY' || type === 'CHECKOUT_SESSION') return 1;
    if (type === 'PAYMENT' || type === 'WITHDRAWAL') return 2;
    if (type === 'WEBHOOK_DELIVERY' || type === 'PROVIDER_LOG') return 3;
    if (type === 'ACTIVITY' || type === 'AUDIT') return 4;
    return 5;
  }

  function edgeColor(type: string) {
    const normalized = type.toUpperCase();
    if (normalized === 'PARENT') return 'var(--color-brand-magenta)';
    if (normalized === 'RESOURCE') return 'var(--color-warning)';
    return 'var(--color-brand-cyan)';
  }

  function nodeTone(node: FlowGraphNode) {
    const text = `${node.status ?? ''} ${node.severity ?? ''}`.toUpperCase();
    if (text.includes('ERROR') || text.includes('FAILED') || text.includes('CRITICAL')) return 'danger';
    if (text.includes('WARN') || text.includes('PENDING') || text.includes('PROCESSING')) return 'warning';
    if (text.includes('SUCCESS') || text.includes('PAID') || text.includes('ACTIVE') || text.includes('DELIVERED')) return 'success';
    if (node.type === 'SESSION') return 'cyan';
    if (node.type === 'API_KEY') return 'magenta';
    return 'neutral';
  }

  function buildLayout(input: FlowGraph | null) {
    if (!input) return { nodes: [] as PositionedNode[], edges: [] as PositionedEdge[], width: 920, height: 430 };

    const groups = new Map<number, FlowGraphNode[]>();
    const sorted = [...input.nodes].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    for (const node of sorted) {
      const rank = rankFor(node);
      const group = groups.get(rank) ?? [];
      group.push(node);
      groups.set(rank, group);
    }

    const positioned: PositionedNode[] = [];
    for (const [rank, nodes] of groups.entries()) {
      nodes.forEach((node, index) => {
        positioned.push({
          ...node,
          rank,
          width: nodeWidth,
          height: nodeHeight,
          x: margin + rank * columnGap,
          y: margin + index * rowGap
        });
      });
    }

    const byId = new Map(positioned.map((node) => [node.id, node]));
    const edges = input.edges
      .map((edge) => {
        const source = byId.get(edge.source);
        const target = byId.get(edge.target);
        if (!source || !target) return null;

        const sx = source.x + source.width;
        const sy = source.y + source.height / 2;
        const tx = target.x;
        const ty = target.y + target.height / 2;
        const mid = sx + Math.max((tx - sx) / 2, 54);

        return {
          ...edge,
          path: `M ${sx} ${sy} C ${mid} ${sy}, ${mid} ${ty}, ${tx} ${ty}`,
          color: edgeColor(edge.type),
          dashed: edge.type.toUpperCase() === 'RESOURCE'
        };
      })
      .filter(Boolean) as PositionedEdge[];

    const maxRank = positioned.length ? Math.max(...positioned.map((node) => node.rank)) : 0;
    const maxRows = groups.size ? Math.max(...[...groups.values()].map((nodes) => nodes.length)) : 1;

    return {
      nodes: positioned,
      edges,
      width: Math.max(920, margin * 2 + (maxRank + 1) * columnGap + nodeWidth),
      height: Math.max(430, margin * 2 + maxRows * rowGap)
    };
  }

  function selectNode(id: string) {
    selectedNodeId = selectedNodeId === id ? null : id;
  }
</script>

<section class="flow-graph">
  <header class="flow-graph__header">
    <div>
      <p>Grafo operacional</p>
      <h2>{graph?.flowId ?? 'Sem flow carregado'}</h2>
    </div>
    {#if graph}
      <div class="flow-graph__meta">
        <span>{graph.nodes.length} nos</span>
        <span>{graph.edges.length} ligacoes</span>
      </div>
    {/if}
  </header>

  {#if loading}
    <div class="flow-skeleton">
      <span></span><span></span><span></span><span></span>
    </div>
  {:else if !graph}
    <div class="flow-empty">
      <strong>Nenhum fluxo aberto</strong>
      <span>Informe um flowId ou selecione um log para montar a trilha operacional.</span>
    </div>
  {:else if graph.nodes.length === 0}
    <div class="flow-empty">
      <strong>Fluxo sem eventos</strong>
      <span>O backend respondeu, mas nao encontrou recursos associados a esse flowId.</span>
    </div>
  {:else}
    <div class="flow-scroll" aria-label="Diagrama do fluxo operacional">
      <div class="flow-canvas" style={`width: ${layout.width}px; height: ${layout.height}px;`}>
        <svg class="flow-edges" viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
          <defs>
            <marker id="flow-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
              <path d="M 0 0 L 9 4.5 L 0 9 z" fill="currentColor" />
            </marker>
          </defs>
          {#each layout.edges as edge}
            <path
              d={edge.path}
              stroke={edge.color}
              stroke-width="1.7"
              stroke-dasharray={edge.dashed ? '5 7' : undefined}
              fill="none"
              marker-end="url(#flow-arrow)"
            />
          {/each}
        </svg>

        {#each layout.nodes as node}
          <button
            type="button"
            class={`flow-node flow-node--${nodeTone(node)}`}
            class:flow-node--selected={selectedNodeId === node.id}
            style={`left: ${node.x}px; top: ${node.y}px; width: ${node.width}px; height: ${node.height}px;`}
            onclick={() => selectNode(node.id)}
          >
            <span class="flow-node__type">{node.type}</span>
            <strong>{node.label}</strong>
            <span class="flow-node__foot">
              <span>{node.status ?? node.severity ?? 'evento'}</span>
              <span>{formatDate(node.timestamp)}</span>
            </span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</section>

<style>
  .flow-graph {
    min-width: 0;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 18px;
    background:
      radial-gradient(circle at 12% 10%, rgba(1, 250, 251, 0.08), transparent 32%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
      var(--color-surface);
    overflow: hidden;
  }

  .flow-graph__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.065);
  }

  .flow-graph__header p,
  .flow-node__type,
  .flow-graph__meta {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .flow-graph__header h2 {
    max-width: 760px;
    margin: 5px 0 0;
    overflow-wrap: anywhere;
    font-size: 1.05rem;
  }

  .flow-graph__meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .flow-graph__meta span {
    padding: 7px 9px;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.035);
  }

  .flow-scroll {
    width: 100%;
    min-height: 430px;
    overflow: auto;
  }

  .flow-canvas {
    position: relative;
    min-width: 100%;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  .flow-edges {
    position: absolute;
    inset: 0;
    color: var(--color-brand-cyan);
    pointer-events: none;
  }

  .flow-node {
    position: absolute;
    display: grid;
    align-content: space-between;
    gap: 8px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 14px;
    color: var(--color-foreground);
    background: rgba(10, 10, 15, 0.94);
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.28);
    text-align: left;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  }

  .flow-node:hover {
    transform: translateY(-2px);
    border-color: rgba(1, 250, 251, 0.26);
  }

  .flow-node:active {
    transform: translateY(0) scale(0.99);
  }

  .flow-node--selected {
    border-color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.085);
  }

  .flow-node--danger {
    border-color: rgba(255, 59, 92, 0.34);
  }

  .flow-node--warning {
    border-color: rgba(255, 179, 0, 0.34);
  }

  .flow-node--success {
    border-color: rgba(0, 230, 118, 0.26);
  }

  .flow-node--cyan {
    border-color: rgba(1, 250, 251, 0.26);
  }

  .flow-node--magenta {
    border-color: rgba(255, 0, 255, 0.24);
  }

  .flow-node strong {
    display: -webkit-box;
    overflow: hidden;
    font-size: 0.93rem;
    line-height: 1.18;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  .flow-node__foot {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.64rem;
  }

  .flow-skeleton,
  .flow-empty {
    min-height: 430px;
    display: grid;
    place-items: center;
    padding: 22px;
    color: var(--color-foreground-secondary);
  }

  .flow-skeleton {
    grid-template-columns: repeat(4, minmax(160px, 1fr));
    gap: 22px;
  }

  .flow-skeleton span {
    height: 104px;
    border-radius: 14px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.035));
    background-size: 220% 100%;
    animation: shimmer 1.15s ease-in-out infinite;
  }

  .flow-empty {
    align-content: center;
    gap: 8px;
    text-align: center;
  }

  .flow-empty strong {
    color: var(--color-foreground);
    font-family: var(--font-display);
    font-size: 1.12rem;
  }

  @keyframes shimmer {
    from { background-position: 120% 0; }
    to { background-position: -120% 0; }
  }

  @media (max-width: 760px) {
    .flow-graph__header {
      flex-direction: column;
    }

    .flow-skeleton {
      grid-template-columns: 1fr;
    }
  }
</style>
