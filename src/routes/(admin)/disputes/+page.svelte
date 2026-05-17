<script lang="ts">
  import { page } from '$app/stores';
  import DisputesListPage from '$appmod/features/disputes/presentation/pages/DisputesListPage.svelte';

  const role = $derived($page.data.adminRole ?? null);
</script>

<DisputesListPage {role} />
