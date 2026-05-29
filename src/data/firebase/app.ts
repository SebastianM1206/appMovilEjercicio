import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { env } from '../../app/env';

const FIREBASE_ENV_KEYS = [
  'apiKey',
  'authDomain',
  'databaseURL',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

const assertFirebaseConfig = (): void => {
  if (import.meta.env.MODE === 'test') {
    return;
  }

  const missing = FIREBASE_ENV_KEYS.filter((key) => !env.firebase[key]?.trim());
  if (missing.length === 0) {
    return;
  }

  throw new Error(
    `Firebase config incompleta. Variables faltantes: ${missing.map((key) => `VITE_FIREBASE_${key.toUpperCase()}`).join(', ')}`,
  );
};

const getFirebaseConfig = () => ({
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  databaseURL: env.firebase.databaseURL,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
});

export const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApp();
  }

  assertFirebaseConfig();
  return initializeApp(getFirebaseConfig());
};
