import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { env } from '../../app/env';

const FIREBASE_ENV_KEYS = [
  { key: 'apiKey', env: 'VITE_FIREBASE_API_KEY', required: true },
  { key: 'authDomain', env: 'VITE_FIREBASE_AUTH_DOMAIN', required: true },
  { key: 'databaseURL', env: 'VITE_FIREBASE_DATABASE_URL', required: true },
  { key: 'projectId', env: 'VITE_FIREBASE_PROJECT_ID', required: true },
  { key: 'storageBucket', env: 'VITE_FIREBASE_STORAGE_BUCKET', required: false },
  { key: 'messagingSenderId', env: 'VITE_FIREBASE_MESSAGING_SENDER_ID', required: true },
  { key: 'appId', env: 'VITE_FIREBASE_APP_ID', required: true },
] as const;

const assertFirebaseConfig = (): void => {
  if (import.meta.env.MODE === 'test') {
    return;
  }

  const missing = FIREBASE_ENV_KEYS.filter(
    (item) => item.required && !env.firebase[item.key]?.trim(),
  );
  if (missing.length === 0) {
    return;
  }

  throw new Error(
    `Firebase config incompleta. Variables faltantes: ${missing.map((item) => item.env).join(', ')}`,
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
