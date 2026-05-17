import { appServices } from '$core/service_locator/dependencies';
import type { Payment } from '$appmod/features/transactions/payments/domain/entities/Payment';

interface PaymentDetailState {
  payment: Payment | null;
  loading: boolean;
  error: string | null;
}

export function createPaymentDetailController(paymentId: string) {
  const service = appServices.payments();

  let state = $state<PaymentDetailState>({
    payment: null,
    loading: true,
    error: null,
  });

  async function loadPayment() {
    state.loading = true;
    state.error = null;
    const result = await service.getById(paymentId);
    if (result.ok) {
      state.payment = result.value;
    } else {
      state.error = result.failure.message;
    }
    state.loading = false;
  }

  return {
    get state() { return state; },
    loadPayment,
  };
}
