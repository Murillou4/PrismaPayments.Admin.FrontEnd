<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }

  let { currentPage, totalPages, onPageChange }: Props = $props();
  let pageInput = $state('1');

  $effect(() => {
    pageInput = String(currentPage);
  });

  const clampPage = (page: number) => Math.max(1, Math.min(totalPages, page));

  const submitPage = () => {
    const parsed = Number.parseInt(pageInput, 10);
    const safePage = Number.isNaN(parsed) ? currentPage : clampPage(parsed);

    pageInput = String(safePage);

    if (safePage !== currentPage) {
      onPageChange(safePage);
    }
  };
</script>

<div
  class="border-border bg-background-subtle/30 flex justify-center border-t px-4 py-2.5"
>
  <div class="flex items-center gap-1.5 sm:gap-2">
    <Button
      variant="outline"
      size="icon"
      disabled={currentPage <= 1}
      onclick={() => onPageChange(currentPage - 1)}
      class="text-foreground size-9 shrink-0 rounded-[min(var(--radius-md),12px)] transition-[transform,box-shadow,background-color,border-color] duration-150 active:scale-[0.96] disabled:opacity-[0.38]"
      aria-label="Página anterior"
    >
      <ChevronLeft class="size-4" strokeWidth={1.5} />
    </Button>

    <div
      class="text-foreground-secondary flex items-center gap-1.5 text-sm font-medium tracking-tight sm:gap-2"
    >
      <span class="hidden sm:inline">Página</span>
      <span class="sm:hidden" aria-hidden="true">P.</span>
      <Input
        type="number"
        min={1}
        max={totalPages}
        inputmode="numeric"
        bind:value={pageInput}
        onblur={submitPage}
        onkeydown={(event) => event.key === 'Enter' && submitPage()}
        class="page-jump-input text-foreground border-border hover:border-border-hover focus-visible:border-ring h-9 min-h-9 w-[2.75rem] min-w-[2.75rem] rounded-[min(var(--radius-md),12px)] px-1.5 py-0 text-center text-sm tabular-nums transition-[border-color,box-shadow] duration-150 [font-family:var(--font-mono)]"
        aria-label="Ir para página"
      />
      <span class="text-foreground-secondary tabular-nums [font-family:var(--font-mono)]"
        >de {totalPages}</span
      >
    </div>

    <Button
      variant="outline"
      size="icon"
      disabled={currentPage >= totalPages}
      onclick={() => onPageChange(currentPage + 1)}
      class="text-foreground size-9 shrink-0 rounded-[min(var(--radius-md),12px)] transition-[transform,box-shadow,background-color,border-color] duration-150 active:scale-[0.96] disabled:opacity-[0.38]"
      aria-label="Próxima página"
    >
      <ChevronRight class="size-4" strokeWidth={1.5} />
    </Button>
  </div>
</div>

<style>
  /* Remove spinners do input number — evita caixa larga e número descentralizado */
  :global(.page-jump-input)::-webkit-inner-spin-button,
  :global(.page-jump-input)::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
    appearance: none;
  }
  :global(.page-jump-input[type='number']) {
    -moz-appearance: textfield;
    appearance: textfield;
  }
</style>
