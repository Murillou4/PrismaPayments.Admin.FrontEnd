import { appServices } from '$core/service_locator/dependencies';
import type { Dispute, ResolveDisputePayload } from '$appmod/features/disputes/domain/entities/Dispute';

interface DisputeDetailState {
  dispute: Dispute | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

export function createDisputeDetailController(disputeId: string) {
  const service = appServices.disputes();

  let state = $state<DisputeDetailState>({
    dispute: null,
    loading: true,
    error: null,
    submitting: false,
  });

  async function loadDispute() {
    state.loading = true;
    state.error = null;
    const result = await service.getById(disputeId);
    if (result.ok) {
      state.dispute = result.value;
    } else {
      state.error = result.failure.message;
    }
    state.loading = false;
  }

  async function resolveDispute(payload: ResolveDisputePayload): Promise<boolean> {
    state.submitting = true;
    const result = await service.resolveDispute(disputeId, payload);
    state.submitting = false;
    if (result.ok) {
      state.dispute = result.value;
      return true;
    }
    return false;
  }

  return {
    get state() { return state; },
    loadDispute,
    resolveDispute,
  };
}
