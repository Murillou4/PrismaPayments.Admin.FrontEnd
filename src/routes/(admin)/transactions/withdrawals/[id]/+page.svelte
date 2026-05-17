<script lang="ts">
  import { page } from '$app/stores';
  import WithdrawalDetailPage from '$appmod/features/transactions/withdrawals/presentation/pages/WithdrawalDetailPage.svelte';

  const withdrawalId = $derived($page.params.id ?? '');
</script>

<WithdrawalDetailPage {withdrawalId} />
