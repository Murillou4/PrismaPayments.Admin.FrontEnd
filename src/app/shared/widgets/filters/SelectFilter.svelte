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
    style="
      background: var(--color-surface-overlay, #1A1A28);
      border: 1px solid var(--color-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-md, 12px);
      padding: 10px 16px;
      color: {value ? 'var(--color-foreground, #F6F6FF)' : 'var(--color-foreground-secondary, #9090A8)'};
      font-size: 0.875rem;
      min-height: 44px;
      min-width: 160px;
      cursor: pointer;
      transition: border-color 0.15s;
    "
  >
    {selectedLabel}
  </Select.Trigger>
  <Select.Content
    style="
      background: var(--color-surface-overlay, #1A1A28);
      border: 1px solid var(--color-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-md, 12px);
      box-shadow: var(--shadow-lg, 0 16px 48px rgba(0,0,0,0.60));
      overflow: hidden;
    "
  >
    {#if value}
      <Select.Item
        value=""
        label="Todos"
        style="
          font-size: 0.875rem;
          color: var(--color-foreground-secondary, #9090A8);
          min-height: 44px;
          padding: 10px 16px;
        "
      />
    {/if}
    {#each options as option}
      <Select.Item
        value={option.value}
        label={option.label}
        style="
          font-size: 0.875rem;
          color: var(--color-foreground, #F6F6FF);
          min-height: 44px;
          padding: 10px 16px;
        "
      />
    {/each}
  </Select.Content>
</Select.Root>
