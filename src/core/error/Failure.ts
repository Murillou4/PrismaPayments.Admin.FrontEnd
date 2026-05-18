export abstract class Failure {
  constructor(
    public readonly message: string,
    public readonly code?: string
  ) {}
}

export class NetworkFailure extends Failure {
  constructor(message = 'Falha de rede. Verifique sua conexão.') {
    super(message, 'NETWORK_ERROR');
  }
}

export class UnauthorizedFailure extends Failure {
  constructor(message = 'Sessão expirada. Faça login novamente.') {
    super(message, 'UNAUTHORIZED');
  }
}

export class ForbiddenFailure extends Failure {
  constructor(message = 'Você não tem permissão para esta ação.') {
    super(message, 'FORBIDDEN');
  }
}

export class NotFoundFailure extends Failure {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 'NOT_FOUND');
  }
}

export class ValidationFailure extends Failure {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class RateLimitFailure extends Failure {
  constructor(message = 'Muitas requisicoes. Aguarde alguns segundos e tente novamente.') {
    super(message, 'RATE_LIMITED');
  }
}

export class ServerFailure extends Failure {
  constructor(
    message = 'Erro interno do servidor.',
    public readonly extendedResultCode?: string
  ) {
    super(message, 'SERVER_ERROR');
  }
}

export type Either<F extends Failure, S> =
  | { ok: false; failure: F }
  | { ok: true; value: S };

export function left<F extends Failure>(failure: F): Either<F, never> {
  return { ok: false, failure };
}

export function right<S>(value: S): Either<never, S> {
  return { ok: true, value };
}
