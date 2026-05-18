import { appServices } from '$core/service_locator/dependencies';
import type { Dispute, DisputeStatus, DisputeType, ListDisputesParams } from '$appmod/features/disputes/domain/entities/Dispute';

interface DisputeListState {
  disputes: Dispute[];
  total: number;
  page: number;
  limit: number;
  status: DisputeStatus | '';
  disputeType: DisputeType | '';
  merchantId: string;
  loading: boolean;
  error: string | null;
}

export function createDisputeListController() {
  const service = appServices.disputes();

  let state = $state<DisputeListState>({
    disputes: [],
    total: 0,
    page: 1,
    limit: 20,
    status: '',
    disputeType: '',
    merchantId: '',
    loading: true,
    error: null,
  });

  async function loadDisputes() {
    state.loading = true;
    state.error = null;
    const params: ListDisputesParams = { page: state.page, limit: state.limit };
    if (state.status)      params.status      = state.status as DisputeStatus;
    if (state.disputeType) params.disputeType = state.disputeType as DisputeType;
    if (state.merchantId)  params.merchantId  = state.merchantId;
    const result = await service.listDisputes(params);
    if (result.ok) {
      state.disputes = result.value.items ?? [];
      state.total = result.value.total ?? state.disputes.length;
    } else {
      state.disputes = [];
      state.total = 0;
      state.error = result.failure.message;
    }
    state.loading = false;
  }

  function setStatus(s: DisputeStatus | '') {
    state.status = s;
    state.page = 1;
    loadDisputes();
  }

  function setType(t: DisputeType | '') {
    state.disputeType = t;
    state.page = 1;
    loadDisputes();
  }

  function setMerchant(id: string) {
    state.merchantId = id;
    state.page = 1;
    loadDisputes();
  }

  function setPage(p: number) {
    state.page = p;
    loadDisputes();
  }

  return {
    get state() { return state; },
    loadDisputes,
    setStatus,
    setType,
    setMerchant,
    setPage,
  };
}
