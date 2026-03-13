const AUTH_TOKEN_KEY = 'gethuecoin_auth_token';
const AUTH_SOURCE_KEY = 'gethuecoin_auth_source';

export type AuthSource = 'app' | 'google' | 'apple';

export function getAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token.trim());
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthSource(): AuthSource | '' {
  const v = localStorage.getItem(AUTH_SOURCE_KEY);
  if (v === 'app' || v === 'google' || v === 'apple') {
    return v;
  }
  // Backward compatibility with previously stored source values.
  if (v === 'url') {
    return 'app';
  }
  return '';
}

export function setAuthSource(source: AuthSource): void {
  localStorage.setItem(AUTH_SOURCE_KEY, source);
}

export function clearAuthSource(): void {
  localStorage.removeItem(AUTH_SOURCE_KEY);
}
