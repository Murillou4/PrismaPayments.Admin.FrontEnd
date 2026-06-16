import { appServices } from '$core/service_locator/dependencies';
import type {
  Merchant,
  MerchantDocument,
  MerchantCredential,
  MerchantCredentialCreated,
  CreateCredentialPayload,
  MerchantSettingsUpdate,
  MerchantStatusUpdate,
  MerchantVerificationUpdate
} from '$appmod/features/merchants/domain/entities/Merchant';

// Tipo minimalista para transações (feature completa em fase futura)
export interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface MerchantDetailState {
  merchant: Merchant | null;
  activeTab: string;
  // KYC
  kycDocs: MerchantDocument[];
  kycLoaded: boolean;
  kycLoading: boolean;
  // Credentials
  credentials: MerchantCredential[];
  credsLoaded: boolean;
  credsLoading: boolean;
  // Transactions
  recentTxns: RecentTransaction[];
  txnsLoaded: boolean;
  txnsLoading: boolean;
  // Global
  loading: boolean;
  error: string | null;
  // Settings form
  settingsSaving: boolean;
  settingsError: string | null;
  // Status update
  statusUpdating: boolean;
  statusError: string | null;
}

export function createMerchantDetailController(merchantId: string) {
  const service = appServices.merchants();
  const paymentService = appServices.payments();

  let state = $state<MerchantDetailState>({
    merchant: null,
    activeTab: 'info',
    kycDocs: [],
    kycLoaded: false,
    kycLoading: false,
    credentials: [],
    credsLoaded: false,
    credsLoading: false,
    recentTxns: [],
    txnsLoaded: false,
    txnsLoading: false,
    loading: true,
    error: null,
    settingsSaving: false,
    settingsError: null,
    statusUpdating: false,
    statusError: null
  });

  /** Carrega merchant principal (Info + Saldo + Configurações) */
  async function loadMerchant() {
    state.loading = true;
    state.error = null;
    try {
      const result = await service.getById(merchantId);
      if (result.ok) {
        state.merchant = result.value;
      } else {
        state.error = result.failure.message;
      }
    } catch (e) {
      state.error = e instanceof Error ? e.message : 'Erro ao carregar merchant.';
    } finally {
      state.loading = false;
    }
  }

  /** Carrega documentos KYC — lazy, só na 1ª vez */
  async function loadKYCTab() {
    if (state.kycLoaded) return;
    state.kycLoading = true;
    const result = await service.getDocuments(merchantId);
    if (result.ok) {
      state.kycDocs = result.value;
      state.kycLoaded = true;
    }
    state.kycLoading = false;
  }

  /** Carrega credenciais — lazy, só na 1ª vez */
  async function loadCredentialsTab() {
    if (state.credsLoaded) return;
    state.credsLoading = true;
    const result = await service.getCredentials(merchantId);
    if (result.ok) {
      state.credentials = result.value;
      state.credsLoaded = true;
    }
    state.credsLoading = false;
  }

  /** Carrega transações recentes — lazy, só na 1ª vez */
  async function loadTransactionsTab() {
    if (state.txnsLoaded) return;
    state.txnsLoading = true;
    // Endpoint de transações filtrado por merchant — implementado em fase futura
    // Por ora, tenta buscar; se falhar, marca como carregado com lista vazia
    const result = await paymentService.listPayments({ merchantId, limit: 10, page: 1 });
    if (result.ok) {
      state.recentTxns = result.value.items.map((item) => ({
        id: item.id,
        type: item.method,
        amount: item.amount,
        status: item.status,
        createdAt: item.createdAt
      }));
    }
    state.txnsLoaded = true;
    state.txnsLoading = false;
  }

  /** Salva configurações do merchant */
  async function updateSettings(payload: MerchantSettingsUpdate) {
    if (!state.merchant) return;
    state.settingsSaving = true;
    state.settingsError = null;
    const result = await service.updateSettings(merchantId, payload);
    if (result.ok) {
      state.merchant = result.value;
    } else {
      state.settingsError = result.failure.message;
    }
    state.settingsSaving = false;
  }

  /** Atualiza status do merchant (Aprovar, Suspender, Bloquear, etc.) */
  async function updateStatus(payload: MerchantStatusUpdate) {
    state.statusUpdating = true;
    state.statusError = null;
    const result = await service.updateStatus(merchantId, payload);
    if (result.ok) {
      state.merchant = result.value;
    } else {
      state.statusError = result.failure.message;
    }
    state.statusUpdating = false;
  }

  /** Atualiza resultado de verificação KYC */
  async function updateVerification(payload: MerchantVerificationUpdate) {
    const result = await service.updateVerification(merchantId, payload);
    if (result.ok) {
      state.merchant = result.value;
    }
    return result;
  }

  /** Cria credencial e atualiza lista local */
  async function createCredential(payload: CreateCredentialPayload): Promise<import('$core/error/Failure').Either<import('$core/error/Failure').Failure, MerchantCredentialCreated>> {
    const result = await service.createCredential(merchantId, payload);
    if (result.ok) {
      state.credentials = [...state.credentials, result.value];
    }
    return result;
  }

  /** Callback após criar credencial — recarrega lista */
  function refreshCredentials() {
    state.credsLoaded = false;
    loadCredentialsTab();
  }

  function setActiveTab(tab: string) {
    state.activeTab = tab;
  }

  return {
    get state() { return state; },
    loadMerchant,
    loadKYCTab,
    loadCredentialsTab,
    loadTransactionsTab,
    updateSettings,
    updateStatus,
    updateVerification,
    createCredential,
    refreshCredentials,
    setActiveTab
  };
}
