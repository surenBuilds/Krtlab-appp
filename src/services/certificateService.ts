import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Certificate } from '../types';

export interface CertificateRequestResult {
  certificateId: string;
  status: 'pending_payment';
  paymentAvailable: boolean;
  checkoutUrl?: string;
  message?: string;
}

/**
 * Requests a certificate for a skill. Requires 70%+ computed mastery
 * (enforced server-side, not just in the UI). Returns a checkout URL only
 * if a real payment provider is configured — otherwise returns
 * paymentAvailable: false with an explanatory message, never a fake success.
 */
export async function requestCertificate(skillId: string): Promise<CertificateRequestResult> {
  const user = auth.currentUser;
  if (!user) throw new Error('Պետք է մուտք գործած լինել');
  const idToken = await user.getIdToken();

  const res = await fetch('/api/certificates/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ skillId }),
  });
  const data = await res.json();
  if (!res.ok && res.status !== 202) throw new Error(data.message || 'Certificate request failed');
  return data as CertificateRequestResult;
}

/** Public read — allowed for anyone per firestore.rules, powers the shareable verification page. */
export async function getCertificateForVerification(certId: string): Promise<Certificate | null> {
  const snap = await getDoc(doc(db, 'certificates', certId));
  if (!snap.exists()) return null;
  return snap.data() as Certificate;
}
