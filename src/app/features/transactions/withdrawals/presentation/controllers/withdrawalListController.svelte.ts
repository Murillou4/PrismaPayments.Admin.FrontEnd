import { appServices } from '$core/service_locator/dependencies';
import type {
  Withdrawal,
  WithdrawalStatus,
  ListWithdrawalsParams
} from '$appmod/features/transactions/withdrawals/domain/entities/Withdrawal';

interface WithdrawalListState {
  withdrawals: Withdrawal[];
  total: number;
  page: number;
  limit: number;
  merchantId: string;
  status: WithdrawalStatus | '';
  dateStart: string | null;
  dateEnd: string | null;
  loading: boolean;
  error: string | null;
}

export function createWithdrawalListController() {
  const service = appServices.withdrawals();

  let state = $state<WithdrawalListState>({
    withdrawals: [],
    total: 0,
    page: 1,
    limit: 20,
    merchantId: '',
    status: '',
    dateStart: null,
    dateEnd: null,
    loading: true,
    error: null
  });

  async function loadWithdrawals() {
    state.loading = true;
    state.error = null;

    const params: ListWithdrawalsParams = {
      page: state.page,
      limit: state.limit
    };
    if (state.merchantId) params.merchantId = state.merchantId;
    if (state.status)     params.status = state.status;

    const result = await service.listWithdrawals(params);
    if (result.ok) {
      state.withdrawals = result.value.items ?? [];
      state.total = result.value.total ?? state.withdrawals.length;
    } else {
      state.withdrawals = [];
      state.total = 0;
      state.error = result.failure.message;
    }
    state.loading = false;
  }

  function setMerchant(id: string) {
    state.merchantId = id;
    state.page = 1;
    loadWithdrawals();
  }

  function setStatus(s: WithdrawalStatus | '') {
    state.status = s;
    state.page = 1;
    loadWithdrawals();
  }

  function setDateRange(start: string | null, end: string | null) {
    state.dateStart = start;
    state.dateEnd = end;
    // D-19: client-side date filter — no API call needed
  }

  function setPage(p: number) {
    state.page = p;
    loadWithdrawals();
  }

  return {
    get state() { return state; },
    loadWithdrawals,
    setMerchant,
    setStatus,
    setDateRange,
    setPage
  };
}
