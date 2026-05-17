import { describe, expect, it } from 'vitest';
import openApi from '../../../../Prisma.Payments.Backend/docs/openapi.json';
import { API_PATHS } from './apiPaths';

const paths = openApi.paths as Record<string, unknown>;

describe('Admin API paths contract', () => {
  it('mantem os caminhos principais do Admin sincronizados com o OpenAPI do backend', () => {
    const requiredPaths = [
      API_PATHS.AUTH_ADMIN_LOGIN,
      API_PATHS.AUTH_REFRESH,
      API_PATHS.AUTH_ADMIN_2FA_SETUP,
      API_PATHS.AUTH_ADMIN_2FA_VERIFY,
      API_PATHS.AUTH_ADMIN_2FA_DISABLE,
      API_PATHS.AUTH_ADMIN_2FA_LOGIN,
      API_PATHS.AUTH_ADMIN_FORGOT_PASSWORD,
      API_PATHS.AUTH_ADMIN_RESET_PASSWORD,
      API_PATHS.ADMIN_ME,
      API_PATHS.ADMIN_SEARCH,
      API_PATHS.ADMIN_USERS,
      API_PATHS.ADMIN_USER('admin_1'),
      API_PATHS.ADMIN_TENANTS,
      API_PATHS.ADMIN_TENANT('tenant_1'),
      API_PATHS.ADMIN_MERCHANTS,
      API_PATHS.ADMIN_MERCHANT('merchant_1'),
      API_PATHS.ADMIN_PAYMENTS,
      API_PATHS.ADMIN_PAYMENT('payment_1'),
      API_PATHS.ADMIN_WITHDRAWALS,
      API_PATHS.ADMIN_WITHDRAWAL('withdrawal_1'),
      API_PATHS.ADMIN_DISPUTES,
      API_PATHS.ADMIN_DISPUTE('dispute_1'),
      API_PATHS.ADMIN_AUDIT,
      API_PATHS.ADMIN_PROVIDERS,
      API_PATHS.ADMIN_CONFIG,
      API_PATHS.ADMIN_RATE_LIMIT,
      API_PATHS.FEES_RULES,
      API_PATHS.FEES_RULE('fee_1'),
      API_PATHS.FEES_SIMULATE,
      API_PATHS.DIAGNOSTICS_LOGS,
      API_PATHS.DIAGNOSTICS_LOG('log_1'),
      API_PATHS.DIAGNOSTICS_TRACE('trace_1'),
      API_PATHS.DIAGNOSTICS_STATS,
      API_PATHS.DASHBOARD_ADMIN
    ];

    for (const path of requiredPaths) {
      const openApiPath = path
        .replace('/merchant_1', '/{id}')
        .replace('/admin_1', '/{id}')
        .replace('/tenant_1', '/{id}')
        .replace('/payment_1', '/{id}')
        .replace('/withdrawal_1', '/{id}')
        .replace('/dispute_1', '/{id}')
        .replace('/fee_1', '/{id}')
        .replace('/log_1', '/{id}')
        .replace('/trace_1', '/{traceId}');

      expect(paths[openApiPath], `${openApiPath} missing from backend OpenAPI`).toBeTruthy();
    }
  });
});
