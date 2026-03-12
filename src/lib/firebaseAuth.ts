import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { FIREBASE_CONFIG } from '../config/appConfig';

const requiredFirebaseKeys = [
  FIREBASE_CONFIG.apiKey,
  FIREBASE_CONFIG.authDomain,
  FIREBASE_CONFIG.projectId,
  FIREBASE_CONFIG.appId,
];

export const isFirebaseConfigured = requiredFirebaseKeys.every((value) => value.length > 0);

function getFirebaseAuth() {
  if (!isFirebaseConfigured) {
    throw new Error('Missing Firebase configuration.');
  }

  const app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
  return getAuth(app);
}

export async function signInWithGoogle(): Promise<string> {
  console.log('[auth] Step 1: Starting Google sign-in (popup)');
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  console.log('[auth] Step 2: Google popup succeeded, fetching id token');
  const idToken = await credential.user.getIdToken();
  console.log('[auth] Step 3: Got Firebase id token, length:', idToken?.length ?? 0);
  return idToken;
}

export async function signInWithApple(): Promise<string> {
  console.log('[auth] Step 1: Starting Apple sign-in (popup)');
  const auth = getFirebaseAuth();
  const provider = new OAuthProvider('apple.com');
  const credential = await signInWithPopup(auth, provider);
  console.log('[auth] Step 2: Apple popup succeeded, fetching id token');
  const idToken = await credential.user.getIdToken();
  console.log('[auth] Step 3: Got Firebase id token, length:', idToken?.length ?? 0);
  return idToken;
}

export async function signOutFirebaseSession(): Promise<void> {
  if (!isFirebaseConfigured) {
    return;
  }
  await signOut(getFirebaseAuth());
}

