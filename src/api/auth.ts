import { apiV0Client } from './client';
import { API_BASE_URL } from '../config/appConfig';

interface SigninResponse {
  authToken?: string;
  token?: string;
}

export async function signinUser(token: string): Promise<string> {
  const url = `${API_BASE_URL}/v0/auth`;
  console.log('[auth] Step 4: Exchanging Firebase token at', url, '(token length:', token?.length ?? 0, ')');
  try {
    const response = await apiV0Client.post<SigninResponse>('/auth', { token });
    console.log('[auth] Step 5: /auth response status:', response.status, 'data keys:', Object.keys(response.data ?? {}));
    const authToken = (response.data.authToken ?? response.data.token ?? '').trim();

    if (!authToken) {
      console.error('[auth] Step 5 failed: no authToken or token in response', response.data);
      throw new Error('Auth token missing in /auth response');
    }

    console.log('[auth] Step 6: Got session token, length:', authToken.length);
    return authToken;
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string };
    console.error('[auth] Step 4/5 failed: request to /auth failed', {
      url,
      status: axiosErr.response?.status,
      responseData: axiosErr.response?.data,
      message: axiosErr.message ?? err,
    });
    throw err;
  }
}

