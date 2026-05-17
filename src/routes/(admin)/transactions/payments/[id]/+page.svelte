<script lang="ts">
  import { page } from '$app/stores';
  import PaymentDetailPage from '$appmod/features/transactions/payments/presentation/pages/PaymentDetailPage.svelte';

  const paymentId = $derived($page.params.id ?? '');
</script>

<PaymentDetailPage {paymentId} />
