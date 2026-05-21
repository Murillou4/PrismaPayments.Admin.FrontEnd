<script lang="ts">
  import { CalendarDays, X } from 'lucide-svelte';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
  import {
    CalendarDate,
    getLocalTimeZone,
    startOfMonth,
    today,
    type DateValue
  } from '@internationalized/date';
  import type { DateRange } from 'bits-ui';

  interface Props {
    startDate: string | null;
    endDate: string | null;
    onChange: (start: string | null, end: string | null) => void;
  }

  let { startDate, endDate, onChange }: Props = $props();

  let open = $state(false);
  const triggerId = $props.id();

  function toCalendarDate(iso: string | null): CalendarDate | undefined {
    if (!iso) return undefined;
    const d = new Date(iso);
    return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }

  function toIsoString(cd: DateValue): string {
    const month = String(cd.month).padStart(2, '0');
    const day = String(cd.day).padStart(2, '0');
    return `${cd.year}-${month}-${day}`;
  }

  let calendarValue = $state<DateRange>({ start: undefined, end: undefined });

  $effect(() => {
    calendarValue = {
      start: toCalendarDate(startDate),
      end: toCalendarDate(endDate)
    };
  });

  function formatDisplayDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const displayLabel = $derived(() => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    }
    if (startDate) return `A partir de ${formatDisplayDate(startDate)}`;
    return 'Periodo';
  });

  function applyPreset(start: CalendarDate, end: CalendarDate) {
    calendarValue = { start, end };
    onChange(toIsoString(start), toIsoString(end));
    open = false;
  }

  function presetToday() {
    const t = today(getLocalTimeZone());
    applyPreset(t, t);
  }

  function preset7Days() {
    const t = today(getLocalTimeZone());
    applyPreset(t.subtract({ days: 6 }), t);
  }

  function preset30Days() {
    const t = today(getLocalTimeZone());
    applyPreset(t.subtract({ days: 29 }), t);
  }

  function presetThisMonth() {
    const t = today(getLocalTimeZone());
    applyPreset(startOfMonth(t), t);
  }

  function clearDates() {
    calendarValue = { start: undefined, end: undefined };
    onChange(null, null);
  }

  function handleCalendarChange(range: DateRange) {
    calendarValue = range;
    if (range.start && range.end) {
      onChange(toIsoString(range.start), toIsoString(range.end));
      open = false;
    }
  }
</script>

<div class="date-range-picker">
  <label for={triggerId}>Periodo</label>
  <Popover.Root bind:open>
    <Popover.Trigger
      id={triggerId}
      class={`date-range-picker__trigger ${startDate ? 'date-range-picker__trigger--active' : ''}`}
    >
      <CalendarDays size={14} strokeWidth={1.5} />
      {displayLabel()}
    </Popover.Trigger>
    <Popover.Content class="date-range-picker__content">
      <div class="date-range-picker__panel">
        <div class="date-range-picker__presets">
          <p>Atalhos</p>
          {#each [
            { label: 'Hoje', action: presetToday },
            { label: '7 dias', action: preset7Days },
            { label: '30 dias', action: preset30Days },
            { label: 'Este mes', action: presetThisMonth }
          ] as preset (preset.label)}
            <button type="button" onclick={preset.action}>
              {preset.label}
            </button>
          {/each}
          {#if startDate || endDate}
            <div class="date-range-picker__clear">
              <button type="button" onclick={clearDates}>
                <X size={12} strokeWidth={2} />
                Limpar
              </button>
            </div>
          {/if}
        </div>
        <div class="date-range-picker__calendar">
          <RangeCalendar value={calendarValue} onValueChange={handleCalendarChange} locale="pt-BR" />
        </div>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>

<style>
  .date-range-picker {
    display: flex;
    min-width: 200px;
    flex-direction: column;
    gap: 5px;
  }

  .date-range-picker label {
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  :global(.date-range-picker__trigger) {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.035);
    color: var(--color-foreground-secondary);
    cursor: pointer;
    font-size: 0.84rem;
    white-space: nowrap;
    transition: border-color 0.18s, background 0.18s, color 0.18s;
  }

  :global(.date-range-picker__trigger:hover),
  :global(.date-range-picker__trigger--active) {
    border-color: var(--color-border-hover);
    background: rgba(255, 255, 255, 0.055);
    color: var(--color-foreground);
  }

  :global(.date-range-picker__content) {
    z-index: 50;
    overflow: hidden;
    padding: 0;
    border-color: var(--color-border);
    border-radius: var(--radius-xl);
    background: var(--color-surface-overlay);
    box-shadow: var(--shadow-lg);
  }

  .date-range-picker__panel {
    display: flex;
  }

  .date-range-picker__presets {
    display: flex;
    min-width: 120px;
    flex-direction: column;
    gap: 2px;
    padding: 12px;
    border-right: 1px solid var(--color-border-subtle);
  }

  .date-range-picker__presets p {
    margin: 0 0 8px;
    color: var(--color-foreground-secondary);
    font-family: var(--font-mono);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .date-range-picker__presets button {
    display: flex;
    align-items: center;
    min-height: 32px;
    padding: 0 10px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--color-foreground);
    cursor: pointer;
    font: inherit;
    font-size: 0.8rem;
    text-align: left;
    transition: background 0.12s, color 0.12s;
  }

  .date-range-picker__presets button:hover {
    background: rgba(255, 255, 255, 0.055);
  }

  .date-range-picker__clear {
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid var(--color-border-subtle);
  }

  .date-range-picker__clear button {
    gap: 5px;
    width: 100%;
    color: var(--color-foreground-secondary);
  }

  .date-range-picker__calendar {
    padding: 8px;
  }
</style>
