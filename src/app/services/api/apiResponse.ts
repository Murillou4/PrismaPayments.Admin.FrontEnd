import {
  ForbiddenFailure,
  NetworkFailure,
  NotFoundFailure,
  RateLimitFailure,
  ServerFailure,
  UnauthorizedFailure,
  ValidationFailure,
  left,
  right,
  type Either,
  type Failure
} from '$core/error/Failure';

export type ResponseType =
  | 'OK'
  | 'CREATED'
  | 'NO_CONTENT'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR'
  | (string & {});

export interface ApiResponse<T = unknown> {
  responseType: ResponseType;
  message: string;
  title: string;
  status: number;
  data: T | null;
  extendedResultCode: string;
  date: string;
}

interface ParseOptions {
  fallbackMessage?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasRouteMessageShape(value: unknown): value is ApiResponse<unknown> {
  if (!isRecord(value)) return false;
  // `extendedResultCode` é opcional: o backend o inclui em respostas de erro,
  // mas o omite nas de sucesso. Exigi-lo fazia o envelope de sucesso não ser
  // reconhecido e vazar inteiro como `data` (quebrando telas de detalhe).
  return (
    typeof value.responseType === 'string' &&
    typeof value.message === 'string' &&
    typeof value.title === 'string' &&
    typeof value.status === 'number' &&
    'data' in value &&
    (value.extendedResultCode === undefined || typeof value.extendedResultCode === 'string') &&
    typeof value.date === 'string'
  );
}

function responseTypeFromStatus(status: number): ResponseType {
  if (status === 201) return 'CREATED';
  if (status === 204) return 'NO_CONTENT';
  if (status === 400) return 'BAD_REQUEST';
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'TOO_MANY_REQUESTS';
  if (status >= 200 && status < 300) return 'OK';
  return 'INTERNAL_SERVER_ERROR';
}

function messageFromStatus(status: number): string {
  if (status === 429) return 'Muitas requisicoes. Aguarde alguns segundos e tente novamente.';
  if (status >= 500) return 'Erro interno do servidor.';
  return 'Falha ao conectar. Tente novamente.';
}

export function createApiResponse<T>(
  status: number,
  message: string,
  data: T | null = null,
  extendedResultCode = responseTypeFromStatus(status)
): ApiResponse<T> {
  return {
    responseType: responseTypeFromStatus(status),
    message,
    title: responseTypeFromStatus(status),
    status,
    data,
    extendedResultCode,
    date: new Date().toISOString()
  };
}

export function parseApiResponse<T>(
  rawBody: unknown,
  status: number,
  options: ParseOptions = {}
): ApiResponse<T> {
  if (hasRouteMessageShape(rawBody)) {
    return {
      ...rawBody,
      status: rawBody.status || status,
      extendedResultCode: rawBody.extendedResultCode ?? responseTypeFromStatus(rawBody.status || status),
      data: (rawBody.data ?? null) as T | null
    };
  }

  if (status === 204) {
    return createApiResponse<T>(204, 'Operacao concluida.', null, 'NO_CONTENT');
  }

  if (status >= 200 && status < 300) {
    return createApiResponse<T>(
      status,
      options.fallbackMessage ?? 'Operacao concluida.',
      rawBody as T,
      responseTypeFromStatus(status)
    );
  }

  return createApiResponse<T>(
    status,
    options.fallbackMessage ?? messageFromStatus(status),
    null,
    responseTypeFromStatus(status)
  );
}

export function createNetworkApiResponse<T>(message = 'Falha de rede. Verifique sua conexao.'): ApiResponse<T> {
  return createApiResponse<T>(0, message, null, 'NETWORK_ERROR');
}

export function isSuccess(response: ApiResponse<unknown>): boolean {
  return response.status >= 200 && response.status < 300;
}

export function isNoContent(response: ApiResponse<unknown>): boolean {
  return response.status === 204;
}

export function isBadRequest(response: ApiResponse<unknown>): boolean {
  return response.status === 400;
}

export function isUnauthorized(response: ApiResponse<unknown>): boolean {
  return response.status === 401;
}

export function isForbidden(response: ApiResponse<unknown>): boolean {
  return response.status === 403;
}

export function isNotFound(response: ApiResponse<unknown>): boolean {
  return response.status === 404;
}

export function isServerError(response: ApiResponse<unknown>): boolean {
  return response.status >= 500;
}

export function isRateLimited(response: ApiResponse<unknown>): boolean {
  return response.status === 429;
}

export function failureFromApiResponse(response: ApiResponse<unknown>): Failure {
  if (response.status === 0) {
    return new NetworkFailure(response.message);
  }
  if (isUnauthorized(response)) {
    return new UnauthorizedFailure(response.message);
  }
  if (isForbidden(response)) {
    return new ForbiddenFailure(response.message);
  }
  if (isNotFound(response)) {
    return new NotFoundFailure(response.message);
  }
  if (isRateLimited(response)) {
    return new RateLimitFailure(response.message);
  }
  if (isBadRequest(response)) {
    return new ValidationFailure(response.message);
  }
  return new ServerFailure(response.message, response.extendedResultCode);
}

export function apiResponseToEither<T>(response: ApiResponse<T>): Either<Failure, T> {
  if (isSuccess(response) && response.data !== null) {
    return right(response.data);
  }

  if (isNoContent(response)) {
    return right(undefined as T);
  }

  return left(failureFromApiResponse(response));
}
