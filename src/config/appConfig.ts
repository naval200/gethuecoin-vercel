import { type AppMode, getAppMode } from '../lib/mode';

export type { AppMode } from '../lib/mode';

export const APP_MODE = getAppMode();

interface EnvConfig {
  apiBaseUrl: string;
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    appId: string;
    messagingSenderId: string;
    storageBucket: string;
    measurementId: string;
  };
}

const CONFIGS: Record<AppMode, EnvConfig> = {
  mainnet: {
    apiBaseUrl: 'https://api.halfchess.com',
    firebase: {
      apiKey: 'AIzaSyBg5iR8onjBaYWjqsigD7PNA1YccrqIdI8',
      authDomain: 'hf-bet-app.firebaseapp.com',
      projectId: 'hf-bet-app',
      appId: '1:537026299712:web:5f199ba36635b9da6fdca5',
      messagingSenderId: '537026299712',
      storageBucket: 'hf-bet-app.firebasestorage.app',
      measurementId: 'G-G4T3QTP1Q5',
    },
  },
  development: {
    apiBaseUrl: 'https://dev-api.halfchess.com',
    firebase: {
      apiKey: 'AIzaSyBg5iR8onjBaYWjqsigD7PNA1YccrqIdI8',
      authDomain: 'hf-bet-app.firebaseapp.com',
      projectId: 'hf-bet-app',
      appId: '1:537026299712:web:5f199ba36635b9da6fdca5',
      messagingSenderId: '537026299712',
      storageBucket: 'hf-bet-app.firebasestorage.app',
      measurementId: 'G-G4T3QTP1Q5',
    },
  },
  local: {
    apiBaseUrl: 'http://localhost:8080',
    firebase: {
      apiKey: 'AIzaSyBg5iR8onjBaYWjqsigD7PNA1YccrqIdI8',
      authDomain: 'hf-bet-app.firebaseapp.com',
      projectId: 'hf-bet-app',
      appId: '1:537026299712:web:5f199ba36635b9da6fdca5',
      messagingSenderId: '537026299712',
      storageBucket: 'hf-bet-app.firebasestorage.app',
      measurementId: 'G-G4T3QTP1Q5',
    },
  },
};

const active = CONFIGS[APP_MODE];

export const API_BASE_URL = active.apiBaseUrl.replace(/\/+$/, '');

export const FIREBASE_CONFIG = {
  apiKey: active.firebase.apiKey,
  authDomain: active.firebase.authDomain,
  projectId: active.firebase.projectId,
  appId: active.firebase.appId,
  messagingSenderId: active.firebase.messagingSenderId,
  storageBucket: active.firebase.storageBucket,
  measurementId: active.firebase.measurementId,
} as const;

if (typeof console !== 'undefined') {
  console.log('[gethuecoin] mode:', APP_MODE, '| API_BASE_URL:', API_BASE_URL);
}
