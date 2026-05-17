<script lang="ts">
  import { CalendarDays, X } from 'lucide-svelte';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import { RangeCalendar } from '$lib/components/ui/range-calendar/index.js';
  import {
    CalendarDate,
    today,
    getLocalTimeZone,
    startOfMonth,
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
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const displayLabel = $derived(() => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`;
    }
    if (startDate) return `A partir de ${formatDisplayDate(startDate)}`;
    return 'Periodo';
  });

  function applyPreset(start: CalendarDate, end: CalendarDate) {
    calendarValue = { start, end };
    const startIso = toIsoString(start);
    const endIso = toIsoString(end);
    onChange(startIso, endIso);
    open = false;
  }

  function presetToday() {
    const t = today(getLocalTimeZone());
    applyPreset(t, t);
  }

  function preset7Days() {
    const t = today(getLocalTimeZone());
    const s = t.subtract({ days: 6 });
    applyPreset(s, t);
  }

  function preset30Days() {
    const t = today(getLocalTimeZone());
    const s = t.subtract({ days: 29 });
    applyPreset(s, t);
  }

  function presetThisMonth() {
    const t = today(getLocalTimeZone());
    const s = startOfMonth(t);
    applyPreset(s, t);
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

<div style="display: flex; flex-direction: column; gap: 4px; min-width: 200px;">
  <label for={triggerId} style="font-family: 'Outfit', sans-serif; font-size: 0.75rem; font-weight: 500; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.08em;">
    Periodo
  </label>
  <Popover.Root bind:open>
    <Popover.Trigger
      id={triggerId}
      style="
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.875rem;
          background: var(--color-surface-overlay, #1A1A28);
          border: 1px solid var(--color-border, rgba(255,255,255,0.08));
          border-radius: 12px;
          padding: 10px 12px;
          color: {startDate ? 'var(--color-foreground, #F6F6FF)' : 'var(--color-foreground-secondary, #9090A8)'};
          min-height: 44px;
          cursor: pointer;
          transition: border-color 0.15s;
          white-space: nowrap;
        "
    >
      <CalendarDays size={14} strokeWidth={1.5} />
      {displayLabel()}
    </Popover.Trigger>
    <Popover.Content
      style="
        background: var(--color-surface-overlay, #1A1A28);
        border: 1px solid var(--color-border, rgba(255,255,255,0.12));
        border-radius: 12px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.60);
        padding: 0;
        z-index: 50;
      "
    >
      <div style="display: flex; gap: 0;">
        <!-- Presets -->
        <div style="display: flex; flex-direction: column; gap: 2px; padding: 12px; border-right: 1px solid rgba(255,255,255,0.08); min-width: 120px;">
          <p style="font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 600; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">
            Atalhos
          </p>
          {#each [
            { label: 'Hoje', action: presetToday },
            { label: '7 dias', action: preset7Days },
            { label: '30 dias', action: preset30Days },
            { label: 'Este mes', action: presetThisMonth },
          ] as preset (preset.label)}
            <button
              type="button"
              onclick={preset.action}
              style="
                display: flex;
                align-items: center;
                padding: 8px 12px;
                border: none;
                background: transparent;
                color: var(--color-foreground, #F6F6FF);
                font-family: 'Outfit', sans-serif;
                font-size: 0.8125rem;
                cursor: pointer;
                border-radius: 8px;
                text-align: left;
                min-height: 36px;
                transition: background 0.12s;
              "
            >
              {preset.label}
            </button>
          {/each}
          {#if startDate || endDate}
            <div style="margin-top: auto; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
              <button
                type="button"
                onclick={clearDates}
                style="
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  padding: 8px 12px;
                  border: none;
                  background: transparent;
                  color: var(--color-foreground-secondary, #9090A8);
                  font-family: 'Outfit', sans-serif;
                  font-size: 0.8125rem;
                  cursor: pointer;
                  border-radius: 8px;
                  min-height: 36px;
                  width: 100%;
                "
              >
                <X size={12} strokeWidth={2} />
                Limpar
              </button>
            </div>
          {/if}
        </div>
        <!-- Calendar -->
        <div style="padding: 8px;">
          <RangeCalendar
            value={calendarValue}
            onValueChange={handleCalendarChange}
            locale="pt-BR"
          />
        </div>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
