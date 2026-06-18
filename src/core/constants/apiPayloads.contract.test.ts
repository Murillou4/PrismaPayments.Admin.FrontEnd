import { describe, expect, it } from 'vitest';
import openApi from '../../../../Prisma.Payments.Backend/docs/openapi.json';
import { API_PATHS } from './apiPaths';

/**
 * Guard de contrato de BODY (complementa apiPaths.contract.test.ts, que só
 * valida existência de paths). Cruza os campos que cada repositório do front
 * realmente envia contra as `properties` do requestBody do OpenAPI do backend.
 *
 * Pega drift silencioso de nome de campo — a classe de bug que quebrou
 * verification e merchant settings (withdrawalLimit/autoWithdrawal vs
 * dailyWithdrawalLimit/autoWithdrawalEnabled) em produção sem erro de tipo.
 *
 * Ao alterar um payload de repositório, atualize o array `sends` correspondente:
 * se um campo novo não existir no backend, este teste falha aqui (no CI) em vez
 * de virar no-op silencioso em runtime.
 */

type AnySchema = Record<string, unknown>;
const spec = openApi as unknown as AnySchema;
const schemas = ((spec.components as AnySchema)?.schemas ?? {}) as Record<string, AnySchema>;

function resolveRef(schema: AnySchema | undefined): AnySchema {
  let s: AnySchema = schema ?? {};
  let guard = 0;
  while (typeof s.$ref === 'string' && guard++ < 10) {
    const name = s.$ref.split('/').pop() as string;
    s = schemas[name] ?? {};
  }
  return s;
}

function requestBodyProps(path: string, method: string): string[] {
  const op = ((spec.paths as AnySchema)[path] as AnySchema)?.[method] as AnySchema | undefined;
  expect(op, `${method.toUpperCase()} ${path} ausente no OpenAPI do backend`).toBeTruthy();
  const requestBody = (op?.requestBody ?? {}) as AnySchema;
  const content = (requestBody.content ?? {}) as Record<string, AnySchema>;
  const media =
    content['application/json'] ??
    content['multipart/form-data'] ??
    content['application/x-www-form-urlencoded'];
  const schema = resolveRef(media?.schema as AnySchema | undefined);
  return Object.keys((schema.properties ?? {}) as AnySchema);
}

interface PayloadCase {
  label: string;
  path: string;
  method: 'post' | 'put';
  /** Campos que o repositório do front envia no body. */
  sends: string[];
}

const cases: PayloadCase[] = [
  // MerchantRepository.updateStatus → MerchantStatusUpdate
  { label: 'merchant status', path: API_PATHS.ADMIN_MERCHANT_STATUS('{id}'), method: 'put', sends: ['status', 'reason'] },
  // MerchantRepository.updateVerification → mapeado p/ { verificationStatus, notes }
  { label: 'merchant verification', path: API_PATHS.ADMIN_MERCHANT_VERIFICATION('{id}'), method: 'put', sends: ['verificationStatus', 'notes'] },
  // MerchantRepository.updateSettings → MerchantSettingsUpdate
  { label: 'merchant settings', path: API_PATHS.ADMIN_MERCHANT_SETTINGS('{id}'), method: 'put', sends: ['webhookUrl', 'twoFactorEnabled', 'dailyWithdrawalLimit', 'autoWithdrawalEnabled', 'autoWithdrawalThreshold'] },
  // MerchantRepository.createCredential → CreateCredentialPayload
  { label: 'merchant credentials', path: API_PATHS.ADMIN_MERCHANT_CREDENTIALS('{id}'), method: 'post', sends: ['label', 'environment'] },
  // TenantRepository.update → tenantFormData (branding achatado em branding.<key> mapeia p/ o objeto `branding`)
  { label: 'tenant update', path: API_PATHS.ADMIN_TENANT('{id}'), method: 'put', sends: ['name', 'slug', 'status', 'branding'] },
  // AdminUsersRepository.create → CreateAdminUserPayload
  { label: 'admin user create', path: API_PATHS.ADMIN_USERS, method: 'post', sends: ['name', 'email', 'password', 'role'] },
  // AdminUsersRepository.update → UpdateAdminUserPayload
  { label: 'admin user update', path: API_PATHS.ADMIN_USER('{id}'), method: 'put', sends: ['name', 'role', 'isActive'] },
  // PlatformRepository.toggleRateLimit → ToggleRateLimitPayload
  { label: 'rate limit toggle', path: API_PATHS.ADMIN_RATE_LIMIT, method: 'put', sends: ['enabled', 'ttlMinutes'] }
];

describe('Admin write payloads contract', () => {
  for (const c of cases) {
    it(`${c.label}: todo campo enviado existe no requestBody do backend`, () => {
      const backendProps = requestBodyProps(c.path, c.method);
      const unknownFields = c.sends.filter((k) => !backendProps.includes(k));
      expect(
        unknownFields,
        `campos enviados pelo front ausentes no backend: [${unknownFields.join(', ')}] | backend aceita: [${backendProps.join(', ')}]`
      ).toEqual([]);
    });
  }
});
