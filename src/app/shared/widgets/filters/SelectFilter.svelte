<script lang="ts">
  import * as Select from '$lib/components/ui/select/index.js';

  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    options: Option[];
    value?: string;
    placeholder?: string;
    onChange: (value: string) => void;
  }

  let {
    options,
    value = '',
    placeholder = 'Filtrar...',
    onChange
  }: Props = $props();

  // Find the label of the currently selected option for display in trigger
  const selectedLabel = $derived(
    value ? (options.find((o) => o.value === value)?.label ?? placeholder) : placeholder
  );

  function handleValueChange(newValue: string) {
    onChange(newValue);
  }
</script>

<Select.Root type="single" value={value} onValueChange={handleValueChange}>
  <Select.Trigger
    class={`select-filter__trigger ${value ? 'select-filter__trigger--active' : ''}`}
  >
    {selectedLabel}
  </Select.Trigger>
  <Select.Content class="select-filter__content">
    {#if value}
      <Select.Item
        value=""
        label="Todos"
        class="select-filter__item select-filter__item--muted"
      />
    {/if}
    {#each options as option}
      <Select.Item
        value={option.value}
        label={option.label}
        class="select-filter__item"
      />
    {/each}
  </Select.Content>
</Select.Root>

<style>
  :global(.select-filter__trigger) {
    min-width: 160px;
    min-height: 37px;
    padding: 0 12px;
    border-radius: 999px;
    border-color: var(--color-border-subtle);
    background: rgba(255, 255, 255, 0.026);
    color: var(--color-foreground-secondary);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.026);
    font-size: 0.82rem;
    cursor: pointer;
    transition:
      transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      background 0.18s cubic-bezier(0.16, 1, 0.3, 1),
      color 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  :global(.select-filter__trigger:hover),
  :global(.select-filter__trigger--active) {
    border-color: rgba(1, 250, 251, 0.26);
    background: rgba(1, 250, 251, 0.04);
    color: var(--color-foreground);
  }

  :global(.select-filter__trigger:hover) {
    transform: translateY(-1px);
  }

  :global(.select-filter__content) {
    overflow: hidden;
    border-color: var(--color-border);
    border-radius: var(--radius-xl);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.014)),
      var(--color-surface-overlay);
    box-shadow: var(--shadow-lg);
  }

  :global(.select-filter__item) {
    min-height: 36px;
    padding: 8px 36px 8px 12px;
    color: var(--color-foreground);
    font-size: 0.84rem;
  }

  :global(.select-filter__item--muted) {
    color: var(--color-foreground-secondary);
  }
</style>
