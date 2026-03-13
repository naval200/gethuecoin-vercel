import type { AppMode } from '../lib/mode';

export type { AppMode } from '../lib/mode';

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
      apiKey: 'AIzaSyCytHCjedD3jlUkqIDqudpEsIP5BYCLDbw',
      authDomain: 'hf-app-prod.firebaseapp.com',
      projectId: 'hf-app-prod',
      storageBucket: 'hf-app-prod.firebasestorage.app',
      messagingSenderId: '124887059085',
      appId: '1:124887059085:web:d3b7bbc6c5b007f65c30c4',
      measurementId: 'G-RRNZJ02647'
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

export function getApiBaseUrl(mode: AppMode): string {
  return CONFIGS[mode].apiBaseUrl.replace(/\/+$/, '');
}

export function getFirebaseConfig(mode: AppMode) {
  const { firebase } = CONFIGS[mode];
  return {
    apiKey: firebase.apiKey,
    authDomain: firebase.authDomain,
    projectId: firebase.projectId,
    appId: firebase.appId,
    messagingSenderId: firebase.messagingSenderId,
    storageBucket: firebase.storageBucket,
    measurementId: firebase.measurementId,
  } as const;
}
