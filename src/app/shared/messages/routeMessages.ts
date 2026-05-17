import type { ApiResponse } from '$appmod/services/api/apiResponse';

export interface RouteMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export function fromApiResponse<T>(response: ApiResponse<T>): RouteMessage {
  if (response.status >= 200 && response.status < 300) {
    return {
      type: 'success',
      title: response.title || 'Sucesso',
      message: response.message || 'Operação realizada com sucesso.'
    };
  }

  if (response.status === 400) {
    return {
      type: 'error',
      title: response.title || 'Dados inválidos',
      message: response.message || 'Verifique os dados e tente novamente.'
    };
  }

  if (response.status === 403) {
    return {
      type: 'warning',
      title: response.title || 'Acesso negado',
      message: response.message || 'Você não tem permissão para esta ação.'
    };
  }

  if (response.status >= 500) {
    return {
      type: 'error',
      title: response.title || 'Erro do servidor',
      message: 'Ocorreu um erro interno. Tente novamente mais tarde.'
    };
  }

  return {
    type: 'error',
    title: response.title || 'Erro',
    message: response.message || 'Ocorreu um erro inesperado.'
  };
}
