<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let formEl: HTMLFormElement;

  onMount(() => {
    formEl.requestSubmit();
  });
</script>

<form bind:this={formEl} method="POST" use:enhance={() => {
  return async () => {
    await goto('/login');
  };
}}>
  <button type="submit" style="display:none">Logout</button>
</form>
