<script lang="ts">
  import LoginPage from '$appmod/features/auth/presentation/pages/LoginPage.svelte';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<LoginPage form={form} />
