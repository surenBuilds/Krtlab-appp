import { db } from '../lib/firebase';
import {
  collection, doc, setDoc, getDocs, query, where, orderBy, deleteDoc,
} from 'firebase/firestore';
import { PortfolioItem, PortfolioItemType, Certificate } from '../types';

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function addPortfolioItem(
  uid: string,
  item: Omit<PortfolioItem, 'id' | 'uid' | 'createdAt'>
): Promise<PortfolioItem> {
  const full: PortfolioItem = {
    ...item,
    id: newId('port'),
    uid,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'portfolioItems', full.id), full);
  return full;
}

export async function getPortfolioItems(uid: string): Promise<PortfolioItem[]> {
  const q = query(collection(db, 'portfolioItems'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as PortfolioItem);
}

export async function deletePortfolioItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'portfolioItems', itemId));
}

export async function setPortfolioItemVisibility(itemId: string, isPublic: boolean): Promise<void> {
  await setDoc(doc(db, 'portfolioItems', itemId), { isPublic }, { merge: true });
}

/**
 * Section 8 — automatic portfolio. Called right after a Certificate is
 * actually issued (never before payment/verification succeeds — see
 * certificateService.issueCertificate). Idempotent: uses a deterministic
 * id so re-running doesn't create duplicates.
 */
export async function autoAddCertificateToPortfolio(uid: string, cert: Certificate): Promise<void> {
  const id = `port_cert_${cert.id}`;
  const item: PortfolioItem = {
    id,
    uid,
    type: 'certificate' as PortfolioItemType,
    title: `Verified: ${cert.skillTitle}`,
    description: `KrtLab Verified Certificate, issued ${cert.issueDate.slice(0, 10)}.`,
    skillIds: [cert.skillId],
    url: cert.verificationUrl,
    isPublic: true,
    source: 'auto_certificate',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'portfolioItems', id), item);
}

/**
 * Section 12 — project-based learning. Called when Practice Lab marks a
 * project as completed with a passing evaluation (real score, not assumed).
 */
export async function autoAddProjectToPortfolio(
  uid: string,
  project: { id: string; title: string; description: string; skillIds: string[] }
): Promise<void> {
  const id = `port_proj_${project.id}_${uid}`;
  const item: PortfolioItem = {
    id,
    uid,
    type: 'project',
    title: project.title,
    description: project.description,
    skillIds: project.skillIds,
    isPublic: true,
    source: 'auto_project',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'portfolioItems', id), item);
}
