import type { RequestHandler } from './$types';
import { proxyBackendRequest } from '$appmod/services/api/serverBackendClient.server';

const handler: RequestHandler = async (event) => {
  return proxyBackendRequest(event, event.params.path ?? '');
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
