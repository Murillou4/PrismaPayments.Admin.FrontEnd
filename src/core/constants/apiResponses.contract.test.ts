import { describe, expect, it } from 'vitest';
import openApi from '../../../../Prisma.Payments.Backend/docs/openapi.json';
import { API_PATHS } from './apiPaths';

/**
 * Guard de contrato de RESPONSE (complementa apiPayloads.contract.test.ts).
 * Valida que todo campo load-bearing que o front LÊ de uma entidade existe no
 * schema de resposta do backend — pegando a outra metade do drift de contrato.
 *
 * O bug de merchant settings tinha duas metades: a escrita (coberta pelo guard
 * de payload) e a LEITURA — `MerchantSettings.withdrawalLimit` era lido cru do
 * body mas o backend devolvia `dailyWithdrawalLimit`, então vinha sempre
 * undefined sem erro de tipo. Este guard trava esse caso: se o backend renomear
 * um campo que o front lê, o CI falha aqui em vez da tela mostrar vazio.
 *
 * Regra de baixo ruído: listamos apenas os campos OBRIGATÓRIOS (não-opcionais)
 * que o front consome. Campos `?:` na entidade já são tolerantes a ausência e
 * ficam de fora para evitar falso-positivo.
 *
 * O backend embrulha tudo em `data`; coleções em `data.items[]`; sub-objetos
 * (ex.: `settings`) ficam aninhados sob `data`.
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

function propsOf(schema: AnySchema): AnySchema {
  return (resolveRef(schema).properties ?? {}) as AnySchema;
}

interface UnwrapOpts {
  /** Resposta de coleção: desce para o schema do elemento de `data.items[]`. */
  list?: boolean;
  /** Sub-objeto aninhado sob `data` (ex.: 'settings'). */
  nested?: string;
}

function responseProps(path: string, method: string, opts: UnwrapOpts = {}): string[] {
  const op = ((spec.paths as AnySchema)[path] as AnySchema)?.[method] as AnySchema | undefined;
  expect(op, `${method.toUpperCase()} ${path} ausente no OpenAPI do backend`).toBeTruthy();
  const responses = (op?.responses ?? {}) as Record<string, AnySchema>;
  const ok = responses['200'] ?? responses['201'];
  const schema = resolveRef(
    ((ok?.content ?? {}) as AnySchema)['application/json'] as AnySchema | undefined
  );
  const mediaSchema = resolveRef((schema as AnySchema).schema as AnySchema | undefined);

  let data = resolveRef(propsOf(mediaSchema).data as AnySchema | undefined);
  if (opts.list) {
    const items = resolveRef(propsOf(data).items as AnySchema | undefined);
    data = resolveRef(items.items as AnySchema | undefined); // elemento do array
  }
  if (opts.nested) {
    data = resolveRef(propsOf(data)[opts.nested] as AnySchema | undefined);
  }
  return Object.keys(propsOf(data));
}

interface ResponseCase {
  label: string;
  path: string;
  method: 'get' | 'post';
  opts?: UnwrapOpts;
  /** Campos obrigatórios que o front lê da entidade. */
  reads: string[];
}

const cases: ResponseCase[] = [
  // MerchantListItem (Merchant.ts) — tabela da lista
  {
    label: 'merchant list item',
    path: API_PATHS.ADMIN_MERCHANTS,
    method: 'get',
    opts: { list: true },
    reads: ['id', 'legalName', 'documentNumber', 'documentType', 'email', 'status', 'verificationStatus', 'createdAt']
  },
  // Merchant detail (Merchant.ts) — campos load-bearing do detalhe
  {
    label: 'merchant detail',
    path: API_PATHS.ADMIN_MERCHANT('{id}'),
    method: 'get',
    reads: ['id', 'legalName', 'documentNumber', 'documentType', 'email', 'status', 'verificationStatus', 'tenantId', 'settings', 'balance', 'createdAt', 'updatedAt']
  },
  // MerchantSettings (Merchant.ts) — locus do bug: read precisa casar com o backend
  {
    label: 'merchant settings (nested)',
    path: API_PATHS.ADMIN_MERCHANT('{id}'),
    method: 'get',
    opts: { nested: 'settings' },
    reads: ['webhookUrl', 'dailyWithdrawalLimit', 'autoWithdrawalEnabled']
  },
  // Tenant (Tenant.ts)
  {
    label: 'tenant detail',
    path: API_PATHS.ADMIN_TENANT('{id}'),
    method: 'get',
    reads: ['id', 'name', 'slug', 'status', 'createdAt', 'updatedAt']
  },
  // AdminUser (AdminUser.ts)
  {
    label: 'admin user list item',
    path: API_PATHS.ADMIN_USERS,
    method: 'get',
    opts: { list: true },
    reads: ['id', 'name', 'email', 'role', 'twoFactorEnabled', 'isActive', 'createdAt', 'updatedAt']
  },
  // RateLimitStatus (Platform.ts) — só `enabled` é obrigatório (response tem
  // shape variável; demais campos são opcionais e tolerantes a ausência)
  {
    label: 'rate limit status',
    path: API_PATHS.ADMIN_RATE_LIMIT,
    method: 'get',
    reads: ['enabled']
  },
  // Dispute (Dispute.ts) — detalhe operacional
  {
    label: 'dispute detail',
    path: API_PATHS.ADMIN_DISPUTE('{id}'),
    method: 'get',
    reads: ['id', 'paymentId', 'merchantId', 'disputeType', 'status', 'amount', 'openedAt', 'createdAt', 'updatedAt']
  },
  // FeeRule (Fee.ts) — item da listagem de regras
  {
    label: 'fee rule list item',
    path: API_PATHS.FEES_RULES,
    method: 'get',
    opts: { list: true },
    reads: ['id', 'feeType', 'calculation', 'percentageRate', 'fixedAmount', 'isActive', 'createdAt', 'updatedAt']
  },
  // FeeSimulationResult (Fee.ts) — resposta do POST de simulação
  {
    label: 'fee simulation result',
    path: API_PATHS.FEES_SIMULATE,
    method: 'post',
    reads: ['grossAmount', 'feeAmount', 'netAmount']
  },
  // Payment (Payment.ts) — detalhe de pagamento
  {
    label: 'payment detail',
    path: API_PATHS.ADMIN_PAYMENT('{id}'),
    method: 'get',
    reads: ['id', 'merchantId', 'method', 'status', 'amount', 'feeAmount', 'netAmount', 'currency', 'isTest', 'createdAt', 'updatedAt']
  },
  // Withdrawal (Withdrawal.ts) — detalhe de saque
  {
    label: 'withdrawal detail',
    path: API_PATHS.ADMIN_WITHDRAWAL('{id}'),
    method: 'get',
    reads: ['id', 'merchantId', 'status', 'amount', 'feeAmount', 'netAmount', 'currency', 'recipient', 'createdAt', 'updatedAt']
  }
];

describe('Admin read responses contract', () => {
  for (const c of cases) {
    it(`${c.label}: todo campo lido existe no response do backend`, () => {
      const backendProps = responseProps(c.path, c.method, c.opts);
      const missing = c.reads.filter((k) => !backendProps.includes(k));
      expect(
        missing,
        `campos lidos pelo front ausentes no response do backend: [${missing.join(', ')}] | backend devolve: [${backendProps.join(', ')}]`
      ).toEqual([]);
    });
  }
});
