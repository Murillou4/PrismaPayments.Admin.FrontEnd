<script lang="ts">
  import { X } from 'lucide-svelte';
  import { appServices } from '$core/service_locator/dependencies';
  import type { MerchantListItem } from '$appmod/features/merchants/domain/entities/Merchant';

  interface Props {
    value: string;
    onChange: (id: string) => void;
  }

  let { value, onChange }: Props = $props();

  let searchTerm = $state('');
  let merchants = $state<MerchantListItem[]>([]);
  let open = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let selectedLabel = $state('');
  let inputEl: HTMLInputElement | null = $state(null);
  const merchantService = appServices.merchants();
  const inputId = $props.id();

  async function fetchMerchants(term: string) {
    if (term.length < 2) {
      merchants = [];
      open = false;
      return;
    }
    try {
      const result = await merchantService.listMerchants({ search: term, limit: 10, page: 1 });
      if (result.ok) {
        merchants = result.value.items ?? [];
        open = merchants.length > 0;
      }
    } catch {
      merchants = [];
    }
  }

  function handleInput(e: Event) {
    const term = (e.target as HTMLInputElement).value;
    searchTerm = term;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchMerchants(term);
    }, 300);
  }

  function selectMerchant(merchant: MerchantListItem) {
    selectedLabel = merchant.legalName;
    searchTerm = merchant.legalName;
    onChange(merchant.id);
    open = false;
    merchants = [];
  }

  function clearSelection() {
    searchTerm = '';
    selectedLabel = '';
    onChange('');
    open = false;
    merchants = [];
    if (inputEl) inputEl.focus();
  }

  function handleBlur() {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      open = false;
    }, 150);
  }
</script>

<div style="position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 200px;">
  <label for={inputId} style="font-family: 'Outfit', sans-serif; font-size: 0.75rem; font-weight: 500; color: var(--color-foreground-secondary, #9090A8); text-transform: uppercase; letter-spacing: 0.08em;">
    Merchant
  </label>
  <div style="position: relative; display: flex; align-items: center;">
    <input
      id={inputId}
      bind:this={inputEl}
      type="text"
      value={searchTerm}
      placeholder="Buscar merchant..."
      oninput={handleInput}
      onblur={handleBlur}
      onfocus={() => { if (merchants.length > 0) open = true; }}
      style="
        font-family: 'Outfit', sans-serif;
        font-size: 0.875rem;
        background: var(--color-surface-overlay, #1A1A28);
        border: 1px solid var(--color-border, rgba(255,255,255,0.08));
        border-radius: 12px;
        padding: 10px 40px 10px 12px;
        color: var(--color-foreground, #F6F6FF);
        min-height: 44px;
        width: 100%;
        outline: none;
        transition: border-color 0.15s;
      "
    />
    {#if searchTerm}
      <button
        type="button"
        onclick={clearSelection}
        style="
          position: absolute;
          right: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          min-width: 20px;
          min-height: 20px;
          border: none;
          background: transparent;
          color: var(--color-foreground-secondary, #9090A8);
          cursor: pointer;
          padding: 0;
          border-radius: 4px;
        "
        aria-label="Limpar seleção"
      >
        <X size={14} strokeWidth={2} />
      </button>
    {/if}
  </div>

  {#if open && merchants.length > 0}
    <div
      style="
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        z-index: 50;
        background: var(--color-surface-overlay, #1A1A28);
        border: 1px solid var(--color-border, rgba(255,255,255,0.12));
        border-radius: 12px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.60);
        overflow: hidden;
        max-height: 240px;
        overflow-y: auto;
      "
    >
      {#each merchants as merchant (merchant.id)}
        <button
          type="button"
          onmousedown={() => selectMerchant(merchant)}
          style="
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            padding: 10px 14px;
            border: none;
            background: transparent;
            cursor: pointer;
            text-align: left;
            transition: background 0.1s;
            min-height: 44px;
            gap: 2px;
          "
        >
          <span style="font-family: 'Outfit', sans-serif; font-size: 0.875rem; color: var(--color-foreground, #F6F6FF);">
            {merchant.legalName}
          </span>
          <span style="font-family: 'Outfit', sans-serif; font-size: 0.75rem; color: var(--color-foreground-secondary, #9090A8); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">
            {merchant.documentNumber}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>
