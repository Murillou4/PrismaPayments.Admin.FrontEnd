<script lang="ts">
  import type { DisputeStatus } from '$appmod/features/disputes/domain/entities/Dispute';
  import { formatDate } from '$appmod/shared/utils/formatters';

  interface Props {
    status: DisputeStatus;
    openedAt: string;
    resolvedAt: string | null;
  }

  let { status, openedAt, resolvedAt }: Props = $props();

  // D-08/D-09: Step state logic (per user decisions — DO NOT use updatedAt as proxy for "Em Análise")
  const TERMINAL_STATUSES: DisputeStatus[] = ['ACCEPTED', 'REJECTED', 'RESOLVED'];
  const ANALYSIS_STATUSES: DisputeStatus[] = ['UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'RESOLVED'];

  // Step 1 — Aberta: always completed
  const step1Completed = $derived(true);

  // Step 2 — Em Análise: completed when terminal, active when analysis or beyond
  const step2Completed = $derived(TERMINAL_STATUSES.includes(status));
  const step2Active    = $derived(ANALYSIS_STATUSES.includes(status));

  // Step 3 — Resolvida: completed only when resolvedAt is not null
  const step3Completed = $derived(resolvedAt !== null);
  // step3 is current when step2 is completed but step3 is not
  const step3Current   = $derived(step2Completed && !step3Completed);

  // Colors (UI-SPEC)
  const COLOR_COMPLETED = '#01FAFB';   // cyan
  const COLOR_CURRENT   = '#FF00FF';   // magenta
  const COLOR_FUTURE    = 'rgba(255,255,255,0.08)';
  const COLOR_SECONDARY = '#9090A8';

  function circleColor(completed: boolean, current: boolean): string {
    if (completed) return COLOR_COMPLETED;
    if (current)   return COLOR_CURRENT;
    return COLOR_FUTURE;
  }

  function connectorStyle(completed: boolean): string {
    return completed
      ? `flex: 1; height: 2px; background: ${COLOR_COMPLETED};`
      : `flex: 1; height: 2px; background: repeating-linear-gradient(to right, ${COLOR_SECONDARY} 0, ${COLOR_SECONDARY} 4px, transparent 4px, transparent 8px);`;
  }

  // step1 is "current" when status is OPEN (not yet in analysis)
  const step1Current = $derived(!ANALYSIS_STATUSES.includes(status));
  // step2 is "current" (not completed) when in analysis but not terminal
  const step2CurrentOnly = $derived(step2Active && !step2Completed);
</script>

<!-- Horizontal 3-step timeline -->
<div style="display: flex; align-items: flex-start; gap: 0; width: 100%;">

  <!-- Step 1: Aberta -->
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 80px;">
    <div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: {circleColor(step1Completed, step1Current)};
      border: 2px solid {step1Current ? COLOR_CURRENT : circleColor(step1Completed, false)};
      {step1Current ? 'box-shadow: 0 0 8px rgba(255,0,255,0.5);' : ''}
      flex-shrink: 0;
    "></div>
    <span style="font-size: 0.75rem; font-family: var(--font-body); color: {COLOR_SECONDARY}; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; white-space: nowrap;">
      Aberta
    </span>
    <span style="font-size: 0.75rem; color: {COLOR_SECONDARY}; text-align: center;">
      {formatDate(openedAt)}
    </span>
  </div>

  <!-- Connector 1→2 -->
  <div style="{connectorStyle(step2Active)}; margin-top: 11px; align-self: flex-start;"></div>

  <!-- Step 2: Em Análise -->
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 96px;">
    <div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: {circleColor(step2Completed, step2CurrentOnly)};
      border: 2px solid {step2CurrentOnly ? COLOR_CURRENT : circleColor(step2Completed, step2CurrentOnly)};
      {step2CurrentOnly ? 'box-shadow: 0 0 8px rgba(255,0,255,0.5);' : ''}
      flex-shrink: 0;
    "></div>
    <span style="font-size: 0.75rem; font-family: var(--font-body); color: {COLOR_SECONDARY}; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; white-space: nowrap;">
      Em Análise
    </span>
    <span style="font-size: 0.75rem; color: {COLOR_SECONDARY}; text-align: center;">
      —
    </span>
  </div>

  <!-- Connector 2→3 -->
  <div style="{connectorStyle(step3Completed)}; margin-top: 11px; align-self: flex-start;"></div>

  <!-- Step 3: Resolvida -->
  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 80px;">
    <div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: {circleColor(step3Completed, step3Current)};
      border: 2px solid {step3Current ? COLOR_CURRENT : (step3Completed ? COLOR_COMPLETED : COLOR_FUTURE)};
      {step3Current ? 'box-shadow: 0 0 8px rgba(255,0,255,0.5);' : ''}
      flex-shrink: 0;
    "></div>
    <span style="font-size: 0.75rem; font-family: var(--font-body); color: {COLOR_SECONDARY}; text-transform: uppercase; letter-spacing: 0.05em; text-align: center; white-space: nowrap;">
      Resolvida
    </span>
    <span style="font-size: 0.75rem; color: {COLOR_SECONDARY}; text-align: center;">
      {resolvedAt ? formatDate(resolvedAt) : '—'}
    </span>
  </div>

</div>
