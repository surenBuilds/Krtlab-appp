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
      hoursInvested: 1, // approximate
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

  return { updatedProfile, skillUpdates, analyticsEvent, recommendedActions };
}

/**
 * Called when a goal is completed or makes progress.
 */
export function onGoalProgress(params: {
  profile: GrowthProfile;
  goal: Goal;
  progressDelta: number;
}): {
  updatedProfile: Partial<GrowthProfile>;
  analyticsEvent: GrowthEvent;
  recommendedActions: AIAction[];
} {
  const { profile, goal, progressDelta } = params;

  const totalXp = Math.round(progressDelta * 2); // 2 XP per 1% progress

  const analyticsEvent: GrowthEvent = {
    type: 'goal_milestone',
    userId: profile.uid,
    timestamp: new Date().toISOString(),
    data: { goalId: goal.id, goalTitle: goal.title, progressDelta },
    xpGained: totalXp,
    skillsAffected: [],
  };

  const recommendedActions: AIAction[] = goal.progress >= 100
    ? [
        {
          type: 'goal',
          title: `Congratulations! Goal "${goal.title}" complete!`,
          priority: 'high',
          description: 'Set your next growth goal',
        },
        {
          type: 'reflection',
          title: `Reflect on completing "${goal.title}"`,
          priority: 'medium',
          description: 'Document what you learned',
        },
      ]
    : [
        {
          type: 'goal',
          title: `Keep working on "${goal.title}"`,
          priority: 'medium',
          description: `${goal.progress}% complete — stay consistent`,
        },
      ];

  const updatedProfile: Partial<GrowthProfile> = {
    xp: profile.xp + totalXp,
    lastActive: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { updatedProfile, analyticsEvent, recommendedActions };
}

/**
 * Called when a habit is completed for the day.
 */
export function onHabitCompleted(params: {
  profile: GrowthProfile;
  habitTitle: string;
  newStreak: number;
}): {
  updatedProfile: Partial<GrowthProfile>;
  analyticsEvent: GrowthEvent;
} {
  const { profile, habitTitle, newStreak } = params;

  const analyticsEvent: GrowthEvent = {
    type: 'habit_completed',
    userId: profile.uid,
    timestamp: new Date().toISOString(),
    data: { habitTitle, newStreak },
    xpGained: 5 + newStreak, // bonus for long streaks
    skillsAffected: [],
  };

  const updatedProfile: Partial<GrowthProfile> = {
    xp: profile.xp + 5 + newStreak,
    lastActive: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { updatedProfile, analyticsEvent };
}

/**
 * Build the context snapshot for AI Mentor conversations.
 * This distills the user's profile into a structured context
 * that the AI can use to give personalized guidance.
 */
export function buildMentorContext(params: {
  profile: GrowthProfile;
  goals: Goal[];
  skills: UserSkill[];
  recentLearning: LearningProgressRecord[];
  projects: Project[];
  careerItem?: any;
}): MentorContext {
  const { profile, goals, skills, recentLearning, projects, careerItem } = params;

  return {
    profile: {
      name: profile.name,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
    },
    activeGoals: goals
      .filter(g => g.status === 'active')
      .map(g => ({
        title: g.title,
        progress: g.progress,
        priority: g.priority,
        category: g.category,
      })),
    topSkills: skills
      .sort((a, b) => b.currentLevel - a.currentLevel)
      .slice(0, 10)
      .map(s => ({
        name: s.name,
        currentLevel: s.currentLevel,
        levelLabel: s.levelLabel,
      })),
    recentLearning: recentLearning
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(l => ({
        subfieldId: l.subfieldId,
        levelId: l.levelId,
        quizScore: l.quizScore,
        aiLevel: l.aiLevel,
      })),
    activeProjects: projects
      .filter(p => p.status === 'in_progress')
      .map(p => ({
        title: p.title,
        status: p.status,
        progress: p.progress,
        skillsUsed: p.skillsUsed,
      })),
    habits: [],
    careerGaps: careerItem?.skillGaps || [],
  };
}

/**
 * Calculate the composite Growth Score (0-1000).
 * Weighted formula combining skills, learning, projects, discipline, career readiness.
 */
export function calculateGrowthScore(params: {
  profile: GrowthProfile;
  skills: UserSkill[];
  goals: Goal[];
  projects: Project[];
  habits: { currentStreak: number }[];
  careerItem?: any;
}): number {
  const { profile, skills, goals, projects, habits, careerItem } = params;

  // Skill breadth & depth (0-300)
  const skillScore = Math.min(300, 
    skills.reduce((sum, s) => sum + s.currentLevel, 0)
  );

  // Learning momentum (0-200)
  const learningScore = Math.min(200, profile.xp / 25);

  // Goal completion (0-150)
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const goalProgressSum = goals.reduce((sum, g) => sum + g.progress, 0);
  const goalScore = Math.min(150, (completedGoals * 30) + (goalProgressSum * 0.5));

  // Project impact (0-150)
  const projectScore = Math.min(150, projects.filter(p => p.status === 'completed').length * 25);

  // Discipline (0-100)
  const habitScore = Math.min(100, 
    habits.reduce((sum, h) => sum + h.currentStreak * 5, 0)
  );

  // Career readiness (0-100)
  let careerScore = 0;
  if (careerItem) {
    const totalGaps = careerItem.skillGaps.length;
    const closedGaps = careerItem.skillGaps.filter(g => g.current >= g.required).length;
    careerScore = totalGaps > 0 ? Math.round((closedGaps / totalGaps) * 100) : 50;
  }

  return skillScore + learningScore + goalScore + projectScore + habitScore + careerScore;
}
