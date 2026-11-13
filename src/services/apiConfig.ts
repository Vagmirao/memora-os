const apiMode =
  import.meta.env.VITE_MEMORA_API_MODE === 'real'
    ? 'real'
    : 'mock';

export const API_CONFIG = {
  baseUrl: '/api',

  timeoutMs: 30000,

  mode: apiMode,
} as const;