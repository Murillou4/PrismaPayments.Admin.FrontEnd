import { appServices } from '$core/service_locator/dependencies';
import type {
  MerchantListItem,
  MerchantStatus,
  VerificationStatus,
  ListMerchantsParams
} from '$appmod/features/merchants/domain/entities/Merchant';

interface MerchantListState {
  merchants: MerchantListItem[];
  total: number;
  page: number;
  limit: number;
  status: MerchantStatus | 'ALL';
  verification: VerificationStatus | 'ALL';
  search: string;
  loading: boolean;
  error: string | null;
  pendingKYCCount: number;
  // Counts por status para as tabs
  counts: Record<string, number>;
}

export function createMerchantListController() {
  const service = appServices.merchants();

  let state = $state<MerchantListState>({
    merchants: [],
    total: 0,
    page: 1,
    limit: 20,
    status: 'ALL',
    verification: 'ALL',
    search: '',
    loading: true,
    error: null,
    pendingKYCCount: 0,
    counts: {}
  });

  async function loadMerchants() {
    state.loading = true;
    state.error = null;

    const params: ListMerchantsParams = {
      page: state.page,
      limit: state.limit
    };
    if (state.status !== 'ALL')       params.status = state.status;
    if (state.verification !== 'ALL') params.verification = state.verification;
    if (state.search.trim())          params.search = state.search.trim();

    const result = await service.listMerchants(params);
    if (result.ok) {
      state.merchants = result.value.items;
      state.total = result.value.total;
    } else {
      state.error = result.failure.message;
    }
    state.loading = false;
  }

  async function loadPendingKYCCount() {
    const result = await service.getPendingKYCCount();
    if (result.ok) state.pendingKYCCount = result.value;
  }

  // Carrega a contagem de um status específico de forma lazy (só quando o usuário
  // clica na tab pela primeira vez). Usa o campo `total` da resposta paginada.
  async function loadCountForStatus(s: MerchantStatus) {
    if (state.counts[s] !== undefined) return; // já carregado, usa cache
    const res = await service.listMerchants({ page: 1, limit: 1, status: s });
    if (res.ok) state.counts[s] = res.value.total;
  }

  /**
   * Carrega apenas a lista principal. Os counts das tabs são carregados
   * lazy (ao clicar), não na inicialização da página — evita o burst de
   * 6+ requests simultâneos que causava HTTP 429.
   */
  async function loadAll() {
    await loadMerchants();
    // Carrega o KYC count 1s após a lista principal para não competir pelo rate limit
    await loadPendingKYCCount();
  }

  function setStatus(s: MerchantStatus | 'ALL') {
    state.status = s;
    state.page = 1;
    // Carrega a contagem do status selecionado de forma lazy (sem esperar — fire & forget)
    if (s !== 'ALL') loadCountForStatus(s);
    loadMerchants();
  }

  function setVerification(v: VerificationStatus | 'ALL') {
    state.verification = v;
    state.page = 1;
    loadMerchants();
  }

  function setSearch(s: string) {
    state.search = s;
    state.page = 1;
    loadMerchants();
  }

  function setPage(p: number) {
    state.page = p;
    loadMerchants();
  }

  // Reseta todos os filtros de uma vez e dispara um único loadMerchants
  function resetFilters() {
    state.status = 'ALL';
    state.verification = 'ALL';
    state.search = '';
    state.page = 1;
    loadMerchants();
  }

  return {
    get state() { return state; },
    loadAll,
    loadMerchants,
    loadPendingKYCCount,
    loadCountForStatus,
    setStatus,
    setVerification,
    setSearch,
    setPage,
    resetFilters
  };
}
