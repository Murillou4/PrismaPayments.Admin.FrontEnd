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

<div class="search-input">
  <span class="search-input__icon">
    <Search size={16} strokeWidth={1.5} />
  </span>
  <Input
    type="text"
    value={inputValue}
    {placeholder}
    oninput={handleInput}
    class="search-input__field"
  />
</div>

<style>
  .search-input {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .search-input__icon {
    position: absolute;
    left: 11px;
    z-index: 1;
    display: flex;
    align-items: center;
    color: var(--color-foreground-secondary);
    pointer-events: none;
  }

  :global(.search-input__field) {
    min-width: 220px;
    min-height: 37px;
    padding-left: 34px;
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

  :global(.search-input__field:focus-visible) {
    border-color: rgba(1, 250, 251, 0.34);
    background: rgba(1, 250, 251, 0.04);
    box-shadow: 0 0 0 3px rgba(1, 250, 251, 0.1);
  }
</style>
