const AUTH_TOKEN_KEY = 'gethuecoin_auth_token';

export function getAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? '';
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token.trim());
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
