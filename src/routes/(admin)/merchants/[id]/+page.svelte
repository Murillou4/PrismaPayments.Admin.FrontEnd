<script lang="ts">
  import { page } from '$app/stores';
  import MerchantDetailPage from '$appmod/features/merchants/presentation/pages/MerchantDetailPage.svelte';

  const merchantId = $derived($page.params.id ?? '');
  const role = $derived($page.data.adminRole ?? null);
</script>

<MerchantDetailPage {merchantId} {role} />
