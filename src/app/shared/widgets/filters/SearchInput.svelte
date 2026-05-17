<script lang="ts">
  import { Search } from 'lucide-svelte';
  import { Input } from '$lib/components/ui/input/index.js';

  interface Props {
    value?: string;
    placeholder?: string;
    debounceMs?: number;
    onSearch: (value: string) => void;
  }

  let {
    value = '',
    placeholder = 'Buscar...',
    debounceMs = 300,
    onSearch
  }: Props = $props();

  let inputValue = $state('');
  let debounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    inputValue = value;
  });

  function handleInput(e: Event) {
    inputValue = (e.target as HTMLInputElement).value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onSearch(inputValue);
    }, debounceMs);
  }
</script>

<div style="position: relative; display: inline-flex; align-items: center;">
  <span
    style="
      position: absolute;
      left: 12px;
      z-index: 1;
      display: flex;
      align-items: center;
      color: var(--color-foreground-secondary, #9090A8);
      pointer-events: none;
    "
  >
    <Search size={16} strokeWidth={1.5} />
  </span>
  <Input
    type="text"
    value={inputValue}
    {placeholder}
    oninput={handleInput}
    style="
      background: var(--color-surface-overlay, #1A1A28);
      border: 1px solid var(--color-border, rgba(255,255,255,0.08));
      border-radius: var(--radius-md, 12px);
      padding: 10px 16px 10px 36px;
      color: var(--color-foreground, #F6F6FF);
      font-size: 0.875rem;
      min-width: 220px;
      min-height: 44px;
    "
  />
</div>
