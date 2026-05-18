<script lang="ts">
  import { formatDate } from '$appmod/shared/utils/formatters';
  import type { FlowGraphResource } from '../../domain/entities/Diagnostics';

  interface Props {
    resources?: FlowGraphResource[];
  }

  let { resources = [] }: Props = $props();
</script>

<section class="resources">
  <header>
    <p>Recursos tocados</p>
    <h3>{resources.length} timelines</h3>
  </header>

  {#if resources.length === 0}
    <div class="empty">Nenhum recurso associado ao fluxo carregado.</div>
  {:else}
    <div class="resource-list">
      {#each resources as resource}
        <article class="resource">
          <div class="resource__head">
            <strong>{resource.resourceType}</strong>
            <span>{resource.states.length} estados</span>
          </div>
          <code>{resource.resourceId}</code>

          <div class="states">
            {#each resource.states as state}
              <div class="state">
                <i></i>
                <div>
                  <strong>{state.label}</strong>
                  <span>{state.type} / {state.status ?? state.severity ?? 'registrado'} / {formatDate(state.timestamp)}</span>
                </div>
              </div>
            {/each}
          </div>
        </article>
      {/each}
    </div>
  {/if}
</section>

<style>
  .resources {
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
    align-items: baseline;
  }

  p {
    margin: 0;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h3 {
    margin: 0;
    font-size: 1rem;
  }

  .resource-list {
    display: grid;
    gap: 10px;
    max-height: 480px;
    overflow: auto;
    padding-right: 3px;
  }

  .resource {
    display: grid;
    gap: 9px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 14px;
    background: #08080d;
  }

  .resource__head {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .resource__head span,
  code,
  .state span {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.7rem;
  }

  code {
    overflow-wrap: anywhere;
  }

  .states {
    display: grid;
    gap: 8px;
  }

  .state {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr);
    gap: 9px;
    align-items: start;
  }

  .state i {
    width: 8px;
    height: 8px;
    margin-top: 5px;
    border-radius: 999px;
    background: var(--color-brand-cyan);
    box-shadow: 0 0 0 4px rgba(1, 250, 251, 0.08);
  }

  .state div {
    display: grid;
    gap: 3px;
  }

  .state strong {
    overflow-wrap: anywhere;
    font-size: 0.82rem;
  }

  .empty {
    padding: 16px;
    border-radius: 12px;
    color: var(--color-foreground-secondary);
    background: rgba(255, 255, 255, 0.025);
    text-align: center;
  }
</style>
