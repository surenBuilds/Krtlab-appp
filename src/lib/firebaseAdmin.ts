import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json' assert { type: 'json' };

/**
 * Server-only Firebase Admin client. Never import this from src/components,
 * src/hooks, or any client-bundled code — it requires a service account
 * and bypasses all Firestore security rules by design (that's exactly why
 * certificate issuance, which the client must never be able to fake, lives here).
 *
 * Configuration: set FIREBASE_SERVICE_ACCOUNT_JSON in the environment to the
 * full service-account JSON (as a single-line string) from
 * Firebase Console -> Project Settings -> Service Accounts -> Generate new private key.
 * On Railway: Variables -> add FIREBASE_SERVICE_ACCOUNT_JSON.
 *
 * If this is not configured, adminDb/adminAuth throw a clear error instead of
 * silently falling back to fake/mocked behavior.
 */
let app: App | null = null;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON is not set. Server-side certificate issuance ' +
      'and other privileged operations are disabled until this is configured. ' +
      'See src/lib/firebaseAdmin.ts for setup instructions.'
    );
  }
  const serviceAccount = JSON.parse(raw);
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: firebaseConfig.projectId,
  });
  return app;
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp(), firebaseConfig.firestoreDatabaseId || '(default)');
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
}
