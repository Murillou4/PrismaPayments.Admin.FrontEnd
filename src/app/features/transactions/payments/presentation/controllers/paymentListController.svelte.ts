import { appServices } from '$core/service_locator/dependencies';
import type {
  Payment,
  PaymentStatus,
  PaymentMethod,
  ListPaymentsParams
} from '$appmod/features/transactions/payments/domain/entities/Payment';

interface PaymentListState {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  merchantId: string;
  status: PaymentStatus | '';
  method: PaymentMethod | '';
  dateStart: string | null;
  dateEnd: string | null;
  loading: boolean;
  error: string | null;
}

export function createPaymentListController() {
  const service = appServices.payments();

  let state = $state<PaymentListState>({
    payments: [],
    total: 0,
    page: 1,
    limit: 20,
    merchantId: '',
    status: '',
    method: '',
    dateStart: null,
    dateEnd: null,
    loading: true,
    error: null
  });

  async function loadPayments() {
    state.loading = true;
    state.error = null;

    const params: ListPaymentsParams = {
      page: state.page,
      limit: state.limit
    };
    if (state.merchantId) params.merchantId = state.merchantId;
    if (state.status)     params.status = state.status;
    if (state.method)     params.method = state.method;

    const result = await service.listPayments(params);
    if (result.ok) {
      state.payments = result.value.items ?? [];
      state.total = result.value.total ?? state.payments.length;
    } else {
      state.payments = [];
      state.total = 0;
      state.error = result.failure.message;
    }
    state.loading = false;
  }

  function setMerchant(id: string) {
    state.merchantId = id;
    state.page = 1;
    loadPayments();
  }

  function setStatus(s: PaymentStatus | '') {
    state.status = s;
    state.page = 1;
    loadPayments();
  }

  function setMethod(m: PaymentMethod | '') {
    state.method = m;
    state.page = 1;
    loadPayments();
  }

  function setDateRange(start: string | null, end: string | null) {
    state.dateStart = start;
    state.dateEnd = end;
    // D-19: client-side date filter — no API call needed
  }

  function setPage(p: number) {
    state.page = p;
    loadPayments();
  }

  return {
    get state() { return state; },
    loadPayments,
    setMerchant,
    setStatus,
    setMethod,
    setDateRange,
    setPage
  };
}
