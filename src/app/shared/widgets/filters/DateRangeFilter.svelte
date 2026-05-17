<script lang="ts">
  import { Calendar } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input/index.js';

  interface DateRange {
    from: string;
    to: string;
  }

  interface Props {
    value?: DateRange;
    onChange: (range: DateRange) => void;
  }

  let {
    value = { from: '', to: '' },
    onChange
  }: Props = $props();

  let from = $state('');
  let to = $state('');

  $effect(() => {
    from = value.from;
    to = value.to;
  });

  function handleFromChange(e: Event) {
    from = (e.target as HTMLInputElement).value;
    onChange({ from, to });
  }

  function handleToChange(e: Event) {
    to = (e.target as HTMLInputElement).value;
    onChange({ from, to });
  }
</script>

<div style="display: flex; align-items: center; gap: 8px;">
  <!-- From -->
  <div style="position: relative; display: inline-flex; align-items: center;">
    <span
      style="
        position: absolute; left: 10px; z-index: 1;
        display: flex; align-items: center;
        color: var(--color-foreground-secondary, #9090A8);
        pointer-events: none;
      "
    >
      <Calendar size={14} strokeWidth={1.5} />
    </span>
    <Input
      type="date"
      value={from}
      onchange={handleFromChange}
      style="
        background: var(--color-surface-overlay, #1A1A28);
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: var(--radius-md, 12px);
        padding: 10px 16px 10px 36px;
        color: var(--color-foreground, #F6F6FF);
        font-size: 0.875rem;
        min-height: 44px;
      "
    />
  </div>

  <span style="font-size: 0.875rem; color: var(--color-foreground-secondary, #9090A8);">até</span>

  <!-- To -->
  <div style="position: relative; display: inline-flex; align-items: center;">
    <span
      style="
        position: absolute; left: 10px; z-index: 1;
        display: flex; align-items: center;
        color: var(--color-foreground-secondary, #9090A8);
        pointer-events: none;
      "
    >
      <Calendar size={14} strokeWidth={1.5} />
    </span>
    <Input
      type="date"
      value={to}
      onchange={handleToChange}
      style="
        background: var(--color-surface-overlay, #1A1A28);
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: var(--radius-md, 12px);
        padding: 10px 16px 10px 36px;
        color: var(--color-foreground, #F6F6FF);
        font-size: 0.875rem;
        min-height: 44px;
      "
    />
  </div>
</div>
