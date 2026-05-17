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
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 18px;
    padding: 14px;
    border: 1px solid rgba(255, 255, 255, 0.075);
    border-radius: 16px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.026), rgba(255, 255, 255, 0.01)),
      var(--color-surface);
  }

  .toolbar__main,
  .toolbar__trailing {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-wrap: wrap;
  }

  .toolbar__trailing {
    margin-left: auto;
  }
</style>
