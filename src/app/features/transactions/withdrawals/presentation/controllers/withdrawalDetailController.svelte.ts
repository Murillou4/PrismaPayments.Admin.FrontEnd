import { appServices } from '$core/service_locator/dependencies';
import type { Withdrawal } from '$appmod/features/transactions/withdrawals/domain/entities/Withdrawal';

interface WithdrawalDetailState {
  withdrawal: Withdrawal | null;
  loading: boolean;
  error: string | null;
}

export function createWithdrawalDetailController(withdrawalId: string) {
  const service = appServices.withdrawals();

  let state = $state<WithdrawalDetailState>({
    withdrawal: null,
    loading: true,
    error: null,
  });

  async function loadWithdrawal() {
    state.loading = true;
    state.error = null;
    const result = await service.getById(withdrawalId);
    if (result.ok) {
      state.withdrawal = result.value;
    } else {
      state.error = result.failure.message;
    }
    state.loading = false;
  }

  return {
    get state() { return state; },
    loadWithdrawal,
  };
}
