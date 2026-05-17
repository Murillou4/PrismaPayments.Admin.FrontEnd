import { env as publicEnv } from '$env/dynamic/public';

export const env = {
  publicApiBaseUrl: publicEnv.PUBLIC_API_BASE_URL ?? ''
} as const;
