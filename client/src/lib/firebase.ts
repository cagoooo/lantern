import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

let authReady = false;
let authReadyResolve: ((uid: string) => void) | null = null;
const authReadyPromise = new Promise<string>((resolve) => {
  authReadyResolve = resolve;
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authReady = true;
    if (authReadyResolve) {
      authReadyResolve(user.uid);
      authReadyResolve = null;
    }
  }
});

export async function ensureAuth(): Promise<string> {
  if (auth.currentUser) return auth.currentUser.uid;

  if (!authReady) {
    try {
      const cred = await signInAnonymously(auth);
      return cred.user.uid;
    } catch {
      return authReadyPromise;
    }
  }

  return authReadyPromise;
}

export function getCurrentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}
