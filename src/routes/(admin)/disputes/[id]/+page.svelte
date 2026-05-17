<script lang="ts">
  import { page } from '$app/stores';
  import DisputeDetailPage from '$appmod/features/disputes/presentation/pages/DisputeDetailPage.svelte';

  const disputeId = $derived($page.params.id ?? '');
  const role = $derived($page.data.adminRole ?? null);
</script>

<DisputeDetailPage {disputeId} {role} />
