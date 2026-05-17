<script lang="ts">
  import MerchantsListPage from '$appmod/features/merchants/presentation/pages/MerchantsListPage.svelte';
  import { page } from '$app/stores';

  const role = $derived($page.data.adminRole ?? null);
</script>

<MerchantsListPage {role} />
