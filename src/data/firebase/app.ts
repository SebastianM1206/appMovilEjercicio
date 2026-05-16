import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { env } from '../../app/env';

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

  return initializeApp(getFirebaseConfig());
};
