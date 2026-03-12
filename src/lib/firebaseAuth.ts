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
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken();
}

export async function signInWithApple(): Promise<string> {
  const auth = getFirebaseAuth();
  const provider = new OAuthProvider('apple.com');
  const credential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken();
}

export async function signOutFirebaseSession(): Promise<void> {
  if (!isFirebaseConfigured) {
    return;
  }
  await signOut(getFirebaseAuth());
}

