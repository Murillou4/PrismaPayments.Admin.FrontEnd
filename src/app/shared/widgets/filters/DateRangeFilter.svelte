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

  let { value = { from: '', to: '' }, onChange }: Props = $props();

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

<div class="date-range-filter">
  <div class="date-range-filter__input">
    <span><Calendar size={14} strokeWidth={1.5} /></span>
    <Input type="date" value={from} onchange={handleFromChange} class="date-range-filter__field" />
  </div>

  <span class="date-range-filter__separator">até</span>

  <div class="date-range-filter__input">
    <span><Calendar size={14} strokeWidth={1.5} /></span>
    <Input type="date" value={to} onchange={handleToChange} class="date-range-filter__field" />
  </div>
</div>

<style>
  .date-range-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .date-range-filter__input {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .date-range-filter__input span {
    position: absolute;
    left: 10px;
    z-index: 1;
    display: flex;
    color: var(--color-foreground-secondary);
    pointer-events: none;
  }

  :global(.date-range-filter__field) {
    min-height: 37px;
    padding-left: 32px;
    border-radius: 999px;
    border-color: var(--color-border-subtle);
    background: rgba(255, 255, 255, 0.026);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.026);
    font-size: 0.82rem;
    transition:
      border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.date-range-filter__field:focus-visible) {
    border-color: rgba(1, 250, 251, 0.34);
    background: rgba(1, 250, 251, 0.04);
    box-shadow: 0 0 0 3px rgba(1, 250, 251, 0.1);
  }

  .date-range-filter__separator {
    color: var(--color-foreground-secondary);
    font-size: 0.76rem;
  }
</style>
