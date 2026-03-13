import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { getFirebaseConfig } from '../config/appConfig';

export function isFirebaseConfigured(config: ReturnType<typeof getFirebaseConfig>): boolean {
  return [config.apiKey, config.authDomain, config.projectId, config.appId].every(
    (value) => value.length > 0,
  );
}

function getFirebaseAuth(config: ReturnType<typeof getFirebaseConfig>) {
  if (!isFirebaseConfigured(config)) {
    throw new Error('Missing Firebase configuration.');
  }

  const app = getApps()[0] ?? initializeApp(config);
  return getAuth(app);
}

export async function signInWithGoogle(firebaseConfig: ReturnType<typeof getFirebaseConfig>): Promise<string> {
  console.log('[auth] Step 1: Starting Google sign-in (popup)');
  const auth = getFirebaseAuth(firebaseConfig);
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  console.log('[auth] Step 2: Google popup succeeded, fetching id token');
  const idToken = await credential.user.getIdToken();
  console.log('[auth] Step 3: Got Firebase id token, length:', idToken?.length ?? 0);
  return idToken;
}

export async function signInWithApple(firebaseConfig: ReturnType<typeof getFirebaseConfig>): Promise<string> {
  console.log('[auth] Step 1: Starting Apple sign-in (popup)');
  const auth = getFirebaseAuth(firebaseConfig);
  const provider = new OAuthProvider('apple.com');
  const credential = await signInWithPopup(auth, provider);
  console.log('[auth] Step 2: Apple popup succeeded, fetching id token');
  const idToken = await credential.user.getIdToken();
  console.log('[auth] Step 3: Got Firebase id token, length:', idToken?.length ?? 0);
  return idToken;
}

export async function signOutFirebaseSession(firebaseConfig: ReturnType<typeof getFirebaseConfig>): Promise<void> {
  if (!isFirebaseConfigured(firebaseConfig)) {
    return;
  }
  await signOut(getFirebaseAuth(firebaseConfig));
}

