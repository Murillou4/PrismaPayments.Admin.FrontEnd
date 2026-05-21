<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    trailing?: Snippet;
  }

  let { children, trailing }: Props = $props();
</script>

<div class="toolbar">
  <div class="toolbar__main">
    {@render children()}
  </div>
  {#if trailing}
    <div class="toolbar__trailing">
      {@render trailing()}
    </div>
  {/if}
</div>

<style>
  .toolbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 9px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    padding: 9px;
    border: 1px solid var(--color-border-subtle);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.036), rgba(255, 255, 255, 0.01)),
      rgba(255, 255, 255, 0.014);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
  }

  .toolbar__main,
  .toolbar__trailing {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .toolbar__trailing {
    margin-left: auto;
  }
</style>
