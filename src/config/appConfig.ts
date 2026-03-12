function env(name: string): string {
  return (import.meta.env[name] as string | undefined)?.trim() ?? '';
}

const DEFAULT_API_BASE_URL = 'https://dev-api.halfchess.com';

export const API_BASE_URL = (env('VITE_API_BASE_URL') || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

if (typeof console !== 'undefined') {
  console.log('[gethuecoin] VITE_API_BASE_URL (in use):', API_BASE_URL);
}

export const FIREBASE_CONFIG = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  measurementId: env('VITE_FIREBASE_MEASUREMENT_ID'),
} as const;

