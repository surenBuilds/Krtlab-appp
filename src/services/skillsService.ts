import { db } from '../lib/firebase';
import {
  doc, getDoc, setDoc, collection, query, where, getDocs, limit,
} from 'firebase/firestore';
import { CATEGORIES } from '../data/categories';
import { UserProfile, SkillMastery, SkillMasteryLevel, SkillsPassportProfile, SkillMatchResult } from '../types';

/**
 * Core principle (spec section 32 - NO FAKE BUSINESS):
 * Skill mastery is never invented. It is computed deterministically from
 * UserProfile.progress, which already tracks completedLessons/completedQuizzes/
 * score/accuracy per subfield. This function is the single source of truth —
 * the Skills Passport, Portfolio auto-items, and Opportunity matching all
 * call this instead of maintaining a separate parallel data store.
 */
export function computeSkillMastery(profile: UserProfile): SkillMastery[] {
  const results: SkillMastery[] = [];

  for (const category of CATEGORIES) {
    const catProgress = profile.progress?.categories?.[category.id];
    if (!catProgress) continue;

    for (const subfield of category.subfields) {
      const sfProgress = catProgress.subfields?.[subfield.id];
      if (!sfProgress) continue;

      const totalLevels = subfield.maxLevels ?? subfield.levels?.length ?? 0;
      const levelsCompleted = sfProgress.completedLessons?.length ?? 0;
      const accuracy = sfProgress.accuracy ?? 0;

      // No activity at all -> skip (don't list a 0% skill the user never touched)
      if (levelsCompleted === 0 && accuracy === 0) continue;

      const completionRatio = totalLevels > 0 ? levelsCompleted / totalLevels : 0;
      // Mastery blends completion depth (70%) with demonstrated accuracy (30%)
      const masteryPercent = Math.round(
        Math.min(100, completionRatio * 100 * 0.7 + accuracy * 0.3)
      );

      results.push({
        skillId: subfield.id,
        skillTitle: subfield.title,
        categoryId: category.id,
        masteryPercent,
        masteryLevel: masteryLevelFromPercent(masteryPercent),
        levelsCompleted,
        totalLevels,
        avgQuizAccuracy: Math.round(accuracy),
        lastActivityAt: profile.lastActive ?? null,
        verified: false, // set true only when a real Certificate doc exists — see attachVerifiedFlags
      });
    }
  }

  return results.sort((a, b) => b.masteryPercent - a.masteryPercent);
}

function masteryLevelFromPercent(pct: number): SkillMasteryLevel {
  if (pct >= 90) return 'expert';
  if (pct >= 70) return 'advanced';
  if (pct >= 40) return 'intermediate';
  if (pct > 0) return 'beginner';
  return 'none';
}

/** Cross-reference computed skills against issued certificates to mark verified=true. Never trust a client-sent flag. */
async function attachVerifiedFlags(uid: string, skills: SkillMastery[]): Promise<SkillMastery[]> {
  const certsQuery = query(
    collection(db, 'certificates'),
    where('uid', '==', uid),
    where('status', '==', 'issued')
  );
  const snap = await getDocs(certsQuery);
  const verifiedSkillIds = new Set(snap.docs.map(d => d.data().skillId as string));
  return skills.map(s => ({ ...s, verified: verifiedSkillIds.has(s.skillId) }));
}

/**
 * Recomputes and persists the user's Skills Passport snapshot.
 * Called after any progress-changing action (lesson/quiz/project completion).
 * The snapshot is a CACHE for fast public-profile reads — the UserProfile.progress
 * data remains the source of truth and this can always be regenerated from it.
 */
export async function recomputeSkillsPassport(uid: string, profile: UserProfile): Promise<SkillsPassportProfile> {
  const rawSkills = computeSkillMastery(profile);
  const skills = await attachVerifiedFlags(uid, rawSkills);

  const existingSnap = await getDoc(doc(db, 'skillsPassports', uid));
  const existing = existingSnap.exists() ? (existingSnap.data() as SkillsPassportProfile) : null;

  const passport: SkillsPassportProfile = {
    uid,
    isPublic: existing?.isPublic ?? false, // default PRIVATE — user must opt in to public sharing
    publicSlug: existing?.publicSlug,
    displayName: profile.name,
    bio: existing?.bio ?? '',
    location: existing?.location,
    languages: existing?.languages ?? [],
    photoUrl: existing?.photoUrl,
    skills,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'skillsPassports', uid), passport);
  return passport;
}

export async function getSkillsPassport(uid: string): Promise<SkillsPassportProfile | null> {
  const snap = await getDoc(doc(db, 'skillsPassports', uid));
  return snap.exists() ? (snap.data() as SkillsPassportProfile) : null;
}

export async function setPassportVisibility(uid: string, isPublic: boolean, publicSlug?: string): Promise<void> {
  await setDoc(doc(db, 'skillsPassports', uid), { isPublic, ...(publicSlug ? { publicSlug } : {}) }, { merge: true });
}

/**
 * Fetch a public passport by slug for the shareable verification/profile page.
 * Only returns data if isPublic === true — enforced again here even though
 * Firestore rules also gate it, so the app never renders private data client-side.
 */
export async function getPublicPassportBySlug(slug: string): Promise<SkillsPassportProfile | null> {
  const q = query(collection(db, 'skillsPassports'), where('publicSlug', '==', slug), where('isPublic', '==', true), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as SkillsPassportProfile;
}

/**
 * Section 9 — AI Matching Engine. Pure function: Skill Graph ∩ Opportunity requirements.
 * No AI call needed for the core match score — it's a deterministic set comparison,
 * which is faster, cheaper, and fully explainable (spec requires explaining WHY the match is what it is).
 */
export function matchSkillsToOpportunity(
  userSkills: SkillMastery[],
  opportunityId: string,
  requiredSkillIds: string[],
  preferredSkillIds: string[]
): SkillMatchResult {
  const heldSkillIds = new Set(
    userSkills.filter(s => s.masteryPercent >= 40).map(s => s.skillId) // 'intermediate'+ counts as "has this skill"
  );

  const matchedRequired = requiredSkillIds.filter(id => heldSkillIds.has(id));
  const missingRequired = requiredSkillIds.filter(id => !heldSkillIds.has(id));
  const matchedPreferred = preferredSkillIds.filter(id => heldSkillIds.has(id));

  const requiredWeight = 0.8;
  const preferredWeight = 0.2;
  const requiredScore = requiredSkillIds.length > 0 ? matchedRequired.length / requiredSkillIds.length : 1;
  const preferredScore = preferredSkillIds.length > 0 ? matchedPreferred.length / preferredSkillIds.length : 1;

  const matchPercent = Math.round((requiredScore * requiredWeight + preferredScore * preferredWeight) * 100);

  return { opportunityId, matchPercent, matchedRequired, missingRequired, matchedPreferred };
}
