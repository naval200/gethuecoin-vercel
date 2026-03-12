import { apiV0Client } from './client';
import { setAuthToken } from '../lib/storage';

interface SigninResponse {
  authToken?: string;
  token?: string;
}

export async function signinUser(token: string): Promise<string> {
  const response = await apiV0Client.post<SigninResponse>('/auth', { token });
  const authToken = (response.data.authToken ?? response.data.token ?? '').trim();

  if (!authToken) {
    throw new Error('Auth token missing in /auth response');
  }

  setAuthToken(authToken);
  return authToken;
}

