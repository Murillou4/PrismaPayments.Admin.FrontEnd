<script lang="ts">
  import CopyButton from '$appmod/shared/widgets/CopyButton.svelte';
  import { formatDate } from '$appmod/shared/utils/formatters';
  import type { FlowGraph, FlowGraphNode } from '../../domain/entities/Diagnostics';

  interface Props {
    graph: FlowGraph | null;
    selectedNodeId?: string | null;
  }

  let { graph, selectedNodeId = null }: Props = $props();

  const node = $derived.by<FlowGraphNode | null>(() =>
    graph?.nodes.find((item) => item.id === selectedNodeId) ?? graph?.nodes[0] ?? null
  );

  const metadataEntries = $derived.by(() =>
    Object.entries(node?.metadata ?? {}).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );
</script>

<section class="inspector">
  <header>
    <div>
      <p>Node inspector</p>
      <h3>{node?.label ?? 'Selecione um no'}</h3>
    </div>
    {#if node}
      <CopyButton value={node.id} label="Copiar" />
    {/if}
  </header>

  {#if !node}
    <div class="empty">Clique em um no do grafo para ver detalhes tecnicos.</div>
  {:else}
    <div class="badges">
      <span>{node.type}</span>
      {#if node.status}<span>{node.status}</span>{/if}
      {#if node.severity}<span>{node.severity}</span>{/if}
    </div>

    <div class="kv">
      <div><span>Resource</span><strong>{node.resourceType ?? '-'}</strong></div>
      <div><span>Resource ID</span><strong>{node.resourceId ?? '-'}</strong></div>
      <div><span>Timestamp</span><strong>{formatDate(node.timestamp)}</strong></div>
    </div>

    {#if metadataEntries.length > 0}
      <section class="metadata">
        <p>Metadata</p>
        {#each metadataEntries as [key, value]}
          <div>
            <span>{key}</span>
            <strong>{value}</strong>
          </div>
        {/each}
      </section>
    {/if}
  {/if}
</section>

<style>
  .inspector {
    display: grid;
    gap: 14px;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background: var(--color-surface);
  }

  header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
  }

  p,
  .kv span,
  .metadata span {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h3 {
    margin: 5px 0 0;
    font-size: 1rem;
    overflow-wrap: anywhere;
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .badges span {
    padding: 6px 8px;
    border: 1px solid rgba(1, 250, 251, 0.16);
    border-radius: 999px;
    color: var(--color-brand-cyan);
    background: rgba(1, 250, 251, 0.055);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 760;
  }

  .kv,
  .metadata {
    display: grid;
    gap: 8px;
  }

  .kv {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kv div,
  .metadata div {
    min-width: 0;
    display: grid;
    gap: 5px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 12px;
    background: #08080d;
  }

  .kv strong,
  .metadata strong {
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 650;
  }

  .metadata {
    max-height: 260px;
    overflow: auto;
  }

  .empty {
    padding: 18px;
    border-radius: 12px;
    color: var(--color-foreground-secondary);
    background: rgba(255, 255, 255, 0.025);
    text-align: center;
  }
</style>
