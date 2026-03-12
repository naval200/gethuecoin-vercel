function env(name: string): string {
  return (import.meta.env[name] as string | undefined)?.trim() ?? '';
}

const DEFAULT_API_BASE_URL = 'https://dev-api.halfchess.com';

export const API_BASE_URL = (env('VITE_API_BASE_URL') || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
export const GOOGLE_LOGIN_URL = env('VITE_GOOGLE_LOGIN_URL') || `${API_BASE_URL}/v0/auth/google`;
export const APPLE_LOGIN_URL = env('VITE_APPLE_LOGIN_URL') || `${API_BASE_URL}/v0/auth/apple`;

