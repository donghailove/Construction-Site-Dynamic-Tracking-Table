import * as firebaseApp from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// These should be set in your environment variables (e.g. .env.local or Vercel Environment Variables)
// Access env safely with type casting to avoid TS errors if types are missing
const env = (import.meta as any).env || {};

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let db: any = null;

const missingKeys = requiredKeys.filter(key => !env[key]);

try {
  if (missingKeys.length === 0) {
    // Workaround for type definition issues where initializeApp is not found as a named export
    const initializeApp = (firebaseApp as any).initializeApp || (firebaseApp as any).default?.initializeApp;
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } else {
    console.log("Firebase config missing. Running in Local Mode.");
    console.warn("To enable Cloud Sync, please set the following environment variables:", missingKeys);
  }
} catch (e) {
  console.error("Error initializing Firebase:", e);
}

export { db };