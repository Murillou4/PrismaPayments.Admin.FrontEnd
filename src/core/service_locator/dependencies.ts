import { sl } from './serviceLocator';
import { DashboardRepository } from '$appmod/features/dashboard/data/repositories/DashboardRepository';
import { DashboardService } from '$appmod/features/dashboard/services/DashboardService';
import { MerchantRepository } from '$appmod/features/merchants/data/repositories/MerchantRepository';
import { MerchantService } from '$appmod/features/merchants/services/MerchantService';
import { PaymentRepository } from '$appmod/features/transactions/payments/data/repositories/PaymentRepository';
import { PaymentService } from '$appmod/features/transactions/payments/services/PaymentService';
import { WithdrawalRepository } from '$appmod/features/transactions/withdrawals/data/repositories/WithdrawalRepository';
import { WithdrawalService } from '$appmod/features/transactions/withdrawals/services/WithdrawalService';
import { DisputeRepository } from '$appmod/features/disputes/data/repositories/DisputeRepository';
import { DisputeService } from '$appmod/features/disputes/services/DisputeService';
import { AuthRepository } from '$appmod/features/auth/data/repositories/AuthRepository';
import { AuthService } from '$appmod/features/auth/services/AuthService';
import { AdminUsersRepository } from '$appmod/features/admin_users/data/repositories/AdminUsersRepository';
import { AdminUsersService } from '$appmod/features/admin_users/services/AdminUsersService';
import { TenantRepository } from '$appmod/features/tenants/data/repositories/TenantRepository';
import { TenantService } from '$appmod/features/tenants/services/TenantService';
import { FeeRepository } from '$appmod/features/fees/data/repositories/FeeRepository';
import { FeeService } from '$appmod/features/fees/services/FeeService';
import { AuditRepository } from '$appmod/features/audit/data/repositories/AuditRepository';
import { AuditService } from '$appmod/features/audit/services/AuditService';
import { ProviderRepository } from '$appmod/features/providers/data/repositories/ProviderRepository';
import { ProviderService } from '$appmod/features/providers/services/ProviderService';
import { DiagnosticsRepository } from '$appmod/features/diagnostics/data/repositories/DiagnosticsRepository';
import { DiagnosticsService } from '$appmod/features/diagnostics/services/DiagnosticsService';
import { PlatformRepository } from '$appmod/features/platform/data/repositories/PlatformRepository';
import { PlatformService } from '$appmod/features/platform/services/PlatformService';

const keys = {
  dashboardRepository: 'dashboardRepository',
  dashboardService: 'dashboardService',
  merchantRepository: 'merchantRepository',
  merchantService: 'merchantService',
  paymentRepository: 'paymentRepository',
  paymentService: 'paymentService',
  withdrawalRepository: 'withdrawalRepository',
  withdrawalService: 'withdrawalService',
  disputeRepository: 'disputeRepository',
  disputeService: 'disputeService',
  authRepository: 'authRepository',
  authService: 'authService',
  adminUsersRepository: 'adminUsersRepository',
  adminUsersService: 'adminUsersService',
  tenantRepository: 'tenantRepository',
  tenantService: 'tenantService',
  feeRepository: 'feeRepository',
  feeService: 'feeService',
  auditRepository: 'auditRepository',
  auditService: 'auditService',
  providerRepository: 'providerRepository',
  providerService: 'providerService',
  diagnosticsRepository: 'diagnosticsRepository',
  diagnosticsService: 'diagnosticsService',
  platformRepository: 'platformRepository',
  platformService: 'platformService'
} as const;

let registered = false;

export function registerAppDependencies(): void {
  if (registered) return;

  sl.registerLazySingleton(keys.dashboardRepository, () => new DashboardRepository());
  sl.registerLazySingleton(keys.dashboardService, () => new DashboardService(sl.get(keys.dashboardRepository)));

  sl.registerLazySingleton(keys.merchantRepository, () => new MerchantRepository());
  sl.registerLazySingleton(keys.merchantService, () => new MerchantService(sl.get(keys.merchantRepository)));

  sl.registerLazySingleton(keys.paymentRepository, () => new PaymentRepository());
  sl.registerLazySingleton(keys.paymentService, () => new PaymentService(sl.get(keys.paymentRepository)));

  sl.registerLazySingleton(keys.withdrawalRepository, () => new WithdrawalRepository());
  sl.registerLazySingleton(keys.withdrawalService, () => new WithdrawalService(sl.get(keys.withdrawalRepository)));

  sl.registerLazySingleton(keys.disputeRepository, () => new DisputeRepository());
  sl.registerLazySingleton(keys.disputeService, () => new DisputeService(sl.get(keys.disputeRepository)));

  sl.registerLazySingleton(keys.authRepository, () => new AuthRepository());
  sl.registerLazySingleton(keys.authService, () => new AuthService(sl.get(keys.authRepository)));

  sl.registerLazySingleton(keys.adminUsersRepository, () => new AdminUsersRepository());
  sl.registerLazySingleton(keys.adminUsersService, () => new AdminUsersService(sl.get(keys.adminUsersRepository)));

  sl.registerLazySingleton(keys.tenantRepository, () => new TenantRepository());
  sl.registerLazySingleton(keys.tenantService, () => new TenantService(sl.get(keys.tenantRepository)));

  sl.registerLazySingleton(keys.feeRepository, () => new FeeRepository());
  sl.registerLazySingleton(keys.feeService, () => new FeeService(sl.get(keys.feeRepository)));

  sl.registerLazySingleton(keys.auditRepository, () => new AuditRepository());
  sl.registerLazySingleton(keys.auditService, () => new AuditService(sl.get(keys.auditRepository)));

  sl.registerLazySingleton(keys.providerRepository, () => new ProviderRepository());
  sl.registerLazySingleton(keys.providerService, () => new ProviderService(sl.get(keys.providerRepository)));

  sl.registerLazySingleton(keys.diagnosticsRepository, () => new DiagnosticsRepository());
  sl.registerLazySingleton(keys.diagnosticsService, () => new DiagnosticsService(sl.get(keys.diagnosticsRepository)));

  sl.registerLazySingleton(keys.platformRepository, () => new PlatformRepository());
  sl.registerLazySingleton(keys.platformService, () => new PlatformService(sl.get(keys.platformRepository)));

  registered = true;
}

function getDependency<T>(key: string): T {
  registerAppDependencies();
  return sl.get<T>(key);
}

export const appServices = {
  auth: () => getDependency<AuthService>(keys.authService),
  dashboard: () => getDependency<DashboardService>(keys.dashboardService),
  merchants: () => getDependency<MerchantService>(keys.merchantService),
  payments: () => getDependency<PaymentService>(keys.paymentService),
  withdrawals: () => getDependency<WithdrawalService>(keys.withdrawalService),
  disputes: () => getDependency<DisputeService>(keys.disputeService),
  adminUsers: () => getDependency<AdminUsersService>(keys.adminUsersService),
  tenants: () => getDependency<TenantService>(keys.tenantService),
  fees: () => getDependency<FeeService>(keys.feeService),
  audit: () => getDependency<AuditService>(keys.auditService),
  providers: () => getDependency<ProviderService>(keys.providerService),
  diagnostics: () => getDependency<DiagnosticsService>(keys.diagnosticsService),
  platform: () => getDependency<PlatformService>(keys.platformService)
};
