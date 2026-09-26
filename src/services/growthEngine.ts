/**
 * Growth Engine — Central Orchestrator
 * 
 * This is the heart of the Personal & Professional Growth OS.
 * It coordinates all cross-module relationships. When any event occurs
 * (lesson completed, project finished, habit logged, etc.), this engine
 * propagates the updates across all connected systems.
 * 
 * Architecture:
 *   Event → GrowthEngine → [
 *     Skills update,
 *     Goal progress,
 *     Career gap recalc,
 *     Profile summary refresh,
 *     Analytics event,
 *     AI Mentor context update
 *   ]
 */

import type {
  GrowthProfile,
  Goal,
  UserSkill,
  LearningProgressRecord,
  AnalyticsEvent,
  AnalyticsEventType,
  SkillPoints,
  SkillEvidence,
  Project,
  Certificate,
  MentorContext,
  AIAction,
} from '../types/learner';
import { calculateSkillPoints } from '../data/skillMappings';

// ============================================================================
// EVENT TRIGGERS
// ============================================================================

export interface GrowthEvent {
  type: AnalyticsEventType;
  userId: string;
  timestamp: string;
  data: Record<string, unknown>;
  xpGained: number;
  skillsAffected: SkillPoints[];
}

/**
 * Called when a user completes a learning level.
 * This is the primary entry point for the learning → skills pipeline.
 */
export function onLessonCompleted(params: {
  profile: GrowthProfile;
  learningProgress: LearningProgressRecord;
}): {
  updatedProfile: Partial<GrowthProfile>;
  skillUpdates: Partial<UserSkill>[];
  analyticsEvent: GrowthEvent;
  recommendedActions: AIAction[];
} {
  const { profile, learningProgress } = params;

  // 1. Calculate skill points from subfield mapping
  const skillsAffected = calculateSkillPoints(
    learningProgress.subfieldId,
    learningProgress.categoryId,
    learningProgress.levelId,
    learningProgress.quizScore
  );

  // 2. Generate skill evidence
  const evidence: SkillEvidence = {
    source: 'lesson',
    sourceId: `${learningProgress.subfieldId}_${learningProgress.levelId}`,
    description: `Completed ${learningProgress.subfieldId} level ${learningProgress.levelId} with ${learningProgress.quizScore}%`,
    points: skillsAffected.reduce((sum, s) => sum + s.points, 0),
    timestamp: new Date().toISOString(),
  };

  // 3. Build skill updates
  const skillUpdates: Partial<UserSkill>[] = skillsAffected.map(sp => {
    const existing = profile.strengths || [];
    const skillName = sp.skillId; // In production, lookup from SKILL_DEFINITIONS
    return {
      id: sp.skillId,
      currentLevel: Math.min(100, sp.points), // accumulated
      evidence: [evidence],
      lastPracticed: new Date().toISOString(),
      hoursInvested: learningProgress.timeSpent / 3600,
    };
  });

  // 4. Calculate XP
  const baseXp = 25 + learningProgress.levelId * 5;
  const quizBonus = Math.round((learningProgress.quizScore / 100) * 50);
  const totalXp = baseXp + quizBonus;

  // 5. Analytics event
  const analyticsEvent: GrowthEvent = {
    type: 'lesson_completed',
    userId: profile.uid,
    timestamp: new Date().toISOString(),
    data: {
      subfieldId: learningProgress.subfieldId,
      categoryId: learningProgress.categoryId,
      levelId: learningProgress.levelId,
      quizScore: learningProgress.quizScore,
    },
    xpGained: totalXp,
    skillsAffected,
  };

  // 6. AI-recommended next actions
  const recommendedActions: AIAction[] = [
    {
      type: 'learning',
      title: `Continue ${learningProgress.subfieldId} — Level ${learningProgress.levelId + 1}`,
      priority: 'high',
      description: 'Keep your learning momentum going',
    },
    ...skillsAffected.map(sp => ({
      type: 'project' as const,
      title: `Build a project using ${sp.skillId}`,
      priority: 'medium' as const,
      description: `Apply your new ${sp.skillId} skills in a practical project`,
    })),
  ];

  // 7. Profile updates
  const updatedProfile: Partial<GrowthProfile> = {
    xp: profile.xp + totalXp,
    lastActive: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { updatedProfile, skillUpdates, analyticsEvent, recommendedActions };
}

/**
 * Called when a project is completed.
 */
export function onProjectCompleted(params: {
  profile: GrowthProfile;
  project: Project;
}): {
  updatedProfile: Partial<GrowthProfile>;
  skillUpdates: Partial<UserSkill>[];
  analyticsEvent: GrowthEvent;
  recommendedActions: AIAction[];
} {
  const { profile, project } = params;

  const skillsAffected: SkillPoints[] = project.skillsUsed.map(skillId => ({
    skillId,
    points: Math.round(project.xpReward / project.skillsUsed.length),
  }));

  const evidence: SkillEvidence = {
    source: 'project',
    sourceId: project.id,
    description: `Completed project: ${project.title}`,
    points: project.xpReward,
    timestamp: new Date().toISOString(),
  };

  const skillUpdates: Partial<UserSkill>[] = skillsAffected.map(sp => ({
    id: sp.skillId,
    evidence: [evidence],
    lastPracticed: new Date().toISOString(),
    hoursInvested: project.hoursInvested,
  }));

  const analyticsEvent: GrowthEvent = {
    type: 'project_completed',
    userId: profile.uid,
    timestamp: new Date().toISOString(),
    data: { projectId: project.id, projectTitle: project.title },
    xpGained: project.xpReward,
    skillsAffected,
  };

  const updatedProfile: Partial<GrowthProfile> = {
    xp: profile.xp + project.xpReward,
    projectsCompleted: profile.projectsCompleted + 1,
    lastActive: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const recommendedActions: AIAction[] = [
    {
      type: 'portfolio',
      title: `Add "${project.title}" to your portfolio`,
      priority: 'high',
      description: 'Showcase this project to potential employers',
    },
    ...skillsAffected.map(sp => ({
      type: 'career' as const,
      title: `Update career profile with ${sp.skillId}`,
      priority: 'medium' as const,
    })),
  ];

  return { updatedProfil