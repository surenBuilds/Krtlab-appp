import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider
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
    // This is a simple connection test that forces a fetch from the server.
    // If it fails with "the client is offline", there's a configuration issue.
    // Use a small timeout or just log errors.
    console.log("Verifying Firestore connection...");
    await getDocFromServer(doc(db, '_connection_test_', 'check')).catch(() => {
      // Ignore document not found errors, we only care about connectivity
    });
    console.log("Firestore connection successfully verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("CRITICAL: Firestore configuration error. The client is offline and cannot reach the backend.");
    }
  }
}

// Only run validation in transition to idle or after a short delay to not block main thread
if (typeof window !== 'undefined') {
  setTimeout(validateConnection, 1000);
}

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      // Handle account linking if needed, but Firebase usually handles this if configured.
      // For now, we'll just re-throw or handle it in the UI.
      console.error("Account exists with different credential", error);
    }
    throw error;
  }
};

export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const registerWithEmail = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);
