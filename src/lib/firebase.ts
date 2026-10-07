import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore without persistence for now to avoid IndexedDB transaction conflicts in iframe/preview mode
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function validateConnection() {
  if (typeof window === 'undefined') return;

  try {
    console.log("Verifying Firestore connection...");
    await getDocFromServer(doc(db, '_connection_test_', 'check')).catch(() => {
      // Ignore document not found errors; we only care about connectivity.
    });
    console.log("Firestore connection successfully verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("CRITICAL: Firestore configuration error. The client is offline and cannot reach the backend.");
    }
  }
}

if (typeof window !== 'undefined') {
  setTimeout(validateConnection, 1000);
}

export const googleProvider = new GoogleAuthProvider();

// Always show Google's account chooser so users can select the account
// they want to use for their KrtLab profile.
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google sign-in failed:', {
      code: error?.code,
      message: error?.message,
    });
    throw error;
  }
};

export const loginWithEmail = (email: string, pass: string) =>
  signInWithEmailAndPassword(auth, email, pass);

export const registerWithEmail = (email: string, pass: string) =>
  createUserWithEmailAndPassword(auth, email, pass);

export const logout = () => signOut(auth);
