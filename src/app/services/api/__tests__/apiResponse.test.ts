import { describe, expect, it } from 'vitest';
import {
  apiResponseToEither,
  createNetworkApiResponse,
  failureFromApiResponse,
  isSuccess,
  parseApiResponse
} from '$appmod/services/api/apiResponse';

describe('apiResponse parser', () => {
  it('preserva um RouteMessages valido', () => {
    const parsed = parseApiResponse<{ id: string }>({
      responseType: 'OK',
      message: 'ok',
      title: 'OK',
      status: 200,
      data: { id: 'pay_1' },
      extendedResultCode: 'OK',
      date: '2026-05-17T00:00:00.000Z'
    }, 200);

    expect(isSuccess(parsed)).toBe(true);
    expect(parsed.data?.id).toBe('pay_1');
  });

  it('normaliza body invalido em erro parseavel', () => {
    const parsed = parseApiResponse<unknown>('<html>boom</html>', 500);
    const failure = failureFromApiResponse(parsed);

    expect(parsed.status).toBe(500);
    expect(parsed.data).toBeNull();
    expect(failure.code).toBe('SERVER_ERROR');
  });

  it('transforma sucesso com data em Either.right', () => {
    const result = apiResponseToEither(parseApiResponse({ total: 1 }, 200));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ total: 1 });
  });

  it('representa falha de rede como NETWORK_ERROR', () => {
    const response = createNetworkApiResponse('offline');
    const result = apiResponseToEither(response);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.code).toBe('NETWORK_ERROR');
  });

  it('representa 429 como RATE_LIMITED para nao acionar retry generico', () => {
    const parsed = parseApiResponse<unknown>({
      responseType: 'TOO_MANY_REQUESTS',
      message: 'Muitas requisicoes.',
      title: 'TOO_MANY_REQUESTS',
      status: 429,
      data: null,
      extendedResultCode: 'TOO_MANY_REQUESTS',
      date: '2026-05-18T00:00:00.000Z'
    }, 429);
    const result = apiResponseToEither(parsed);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.failure.code).toBe('RATE_LIMITED');
  });
});

// Regressao: o backend OMITE `extendedResultCode` em respostas de sucesso (so
// inclui em erros). Exigi-lo no shape guard fazia o envelope inteiro vazar como
// `data`, travando todas as telas de detalhe em "Carregando...".
describe('regressao: envelope de sucesso sem extendedResultCode', () => {
  const successEnvelope = {
    responseType: 'OK',
    message: 'Operacao realizada com sucesso',
    title: 'Sucesso',
    status: 200,
    data: { id: 'mch_1', legalName: 'Acme Ltda' },
    date: '2026-06-16T00:00:00.000Z'
  };

  it('reconhece o envelope e desempacota .data mesmo sem extendedResultCode', () => {
    const parsed = parseApiResponse<{ id: string; legalName: string }>(successEnvelope, 200);

    expect(parsed.data).toEqual({ id: 'mch_1', legalName: 'Acme Ltda' });
    expect(parsed.extendedResultCode).toBe('OK');
  });

  it('apiResponseToEither devolve a entidade, nao o envelope inteiro', () => {
    const result = apiResponseToEither(parseApiResponse(successEnvelope, 200));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ id: 'mch_1', legalName: 'Acme Ltda' });
      expect(result.value).not.toHaveProperty('responseType');
    }
  });

  it('ainda reconhece envelope de erro que inclui extendedResultCode', () => {
    const parsed = parseApiResponse({
      responseType: 'NOT_FOUND',
      message: 'Rota nao encontrada',
      title: 'Nao Encontrado',
      status: 404,
      data: null,
      extendedResultCode: 'ROUTE_NOT_FOUND',
      date: '2026-06-16T00:00:00.000Z'
    }, 404);

    expect(parsed.status).toBe(404);
    expect(parsed.extendedResultCode).toBe('ROUTE_NOT_FOUND');
    expect(failureFromApiResponse(parsed).code).toBe('NOT_FOUND');
  });
});
