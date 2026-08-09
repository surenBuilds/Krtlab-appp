/**
 * KrtLab Intelligence Engine v2
 * 
 * Central brain of the KrtLab Operating System.
 * Powers: Goals, Skills, Mastery, Daily Missions, Adaptive Learning, Mentor Context.
 * 
 * Architecture:
 *   LearnerProfile → diagnose → skillGraph → nextAction → dailyMission → mentorContext
 * 
 * All computations are deterministic — AI reasoning happens in the Mentor layer.
 */

import { SKILL_DEFINITIONS, SUBFIELD_SKILL_MAP } from "../data/skillMappings";
import type {
  LearnerProfile, LearnerGoal, LearnerSkill, SkillMastery, SkillEvidence,
  KnowledgeNode, LearningState, DailyMission, MissionTask, NextAction,
  MentorContextSnapshot, LearnerAnalytics, RecentLesson,
  MasteryDimension, SkillLevel, Priority, ActionType, LearningFormat,
  GoalMilestone, WeeklyPlan,
} from "../types/learner";

// ============================================================================
// CONSTANTS
// ============================================================================

const CAREER_SKILLS: Record<string, { skills: string[]; concepts: string[]; weeks: number }> = {
  programmer: { skills: ["python-programming","javascript","web-development","ai-ml","data-analysis"], concepts: ["algorithms","data-structures","apis","databases","testing"], weeks: 12 },
  ai_engineer: { skills: ["python-programming","ai-ml","data-analysis","cloud-computing","critical-thinking"], concepts: ["neural-networks","rag","llms","mlops","embeddings"], weeks: 12 },
  data_scientist: { skills: ["python-programming","data-analysis","ai-ml","mathematics","critical-thinking"], concepts: ["statistics","regression","classification","visualization","sql"], weeks: 10 },
  web_developer: { skills: ["javascript","web-development","python-programming","communication","time-management"], concepts: ["html","css","react","nodejs","deployment"], weeks: 8 },
  designer: { skills: ["graphic-design","video-production","communication","time-management"], concepts: ["color-theory","typography","ux","wireframing","prototyping"], weeks: 8 },
  lawyer: { skills: ["law","critical-thinking","communication","psychology","leadership"], concepts: ["constitutional-law","civil-law","criminal-law","legal-writing","argumentation"], weeks: 16 },
  entrepreneur: { skills: ["entrepreneurship","marketing","sales","leadership","strategic-management"], concepts: ["business-model","mvp","fundraising","growth","product-market-fit"], weeks: 12 },
};

const MASTERY_WEIGHTS: Record<MasteryDimension, number> = {
  comprehension: 0.20, recall: 0.15, application: 0.25, transfer: 0.20, creation: 0.10, retention: 0.10,
};

// ============================================================================
// GOAL DECOMPOSITION
// ============================================================================

function getSkillName(id: string): string { return SKILL_DEFINITIONS?.find(s => s.id === id)?.name || id; }

export function decomposeGoal(
  text: string, category: string, deadlineWeeks: number | null
): { goal: LearnerGoal; allSkills: LearnerSkill[]; allKnowledge: KnowledgeNode[] } {
  const weeks = deadlineWeeks || 12;
  const key = Object.keys(CAREER_SKILLS).find(k => text.toLowerCase().includes(k.replace("_"," "))) || category;
  const mapping = CAREER_SKILLS[key] || { skills: ["critical-thinking","communication","time-management","leadership"], concepts: ["logic","writing","planning","strategy"], weeks };
  const totalWeeks = mapping.weeks;

  const requiredSkills = mapping.skills.map((sid, i) => ({ skillId: sid, targetLevel: 70 + (i * 3), priority: (i < 3 ? "high" : "medium") as Priority }));
  const milestones: GoalMilestone[] = mapping.skills.map((sid, i) => ({
    title: `Master ${getSkillName(sid)}`, skills: [sid], knowledge: [],
    estimatedWeeks: Math.ceil(totalWeeks / mapping.skills.length), order: i + 1, completed: false,
  }));
  const plan: WeeklyPlan[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const si = w % mapping.skills.length;
    plan.push({ week: w + 1, focus: getSkillName(mapping.skills[si]), skills: [mapping.skills[si]], concepts: [], tasks: [`Learn ${getSkillName(mapping.skills[si])} fundamentals`, "Complete 3 practice exercises", "Take assessment quiz", "Review mistakes"], completed: false });
  }

  const goal: LearnerGoal = {
    id: crypto.randomUUID?.() || `goal-${Date.now()}`,
    title: text, description: `KrtLab-decomposed: ${text}`, category,
    status: "active", priority: "high", progress: 0,
    parentGoalId: undefined, subGoals: [],
    requiredSkills, requiredKnowledge: [], milestones, learningPlan: plan,
    estimatedHours: totalWeeks * 10, actualHours: 0, difficulty: "intermediate",
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };

  // Generate skill objects
  const skills: LearnerSkill[] = mapping.skills.map(sid => ({
    id: sid, name: getSkillName(sid), category,
    description: `Core skill for: ${key}`, icon: "Brain",
    currentLevel: 0, targetLevel: 70, levelLabel: "beginner",
    prerequisites: [], dependencies: [], relatedKnowledge: [],
    evidence: [], hoursInvested: 0, lastPracticed: new Date().toISOString(),
    growthRate: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }));

  // Generate knowledge nodes
  const knowledge: KnowledgeNode[] = mapping.concepts.map(cid => ({
    id: cid, name: cid.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "),
    domain: key, description: `Concept in ${key}`,
    prerequisites: [], relatedTo: [], applications: [], examples: [],
    exposure: 0, comprehension: 0,
    lastReviewed: new Date().toISOString(),
    lessons: [], projects: [], assessments: [],
  }));

  return { goal, allSkills: skills, allKnowledge: knowledge };
}

// ============================================================================
// SKILL DIAGNOSTIC
// ============================================================================

export function diagnoseSkills(profile: LearnerProfile & { progress?: any }): LearnerSkill[] {
  const existing = new Map<string, LearnerSkill>(profile.skills.map(s => [s.id, s]));

  return (SKILL_DEFINITIONS || []).map(def => {
    const existing_skill = existing.get(def.id);
    let totalPoints = existing_skill?.currentLevel || 0;

    // Calculate from lesson progress
    const mappings = (SUBFIELD_SKILL_MAP || []).filter(m => m.skills.some(s => s.skillId === def.id));
    for (const m of mappings) {
      const cat = profile.progress?.categories?.[m.categoryId];
      if (!cat) continue;
      const sub = cat.subfields?.[m.subfieldId];
      if (!sub) continue;
      const completed = sub.completedLessons?.length || 0;
      totalPoints += completed * 3;
    }

    const score = Math.min(100, totalPoints || 0);

    return {
      id: def.id,
      name: def.name,
      category: def.category,
      description: def.description,
      icon: def.icon,
      currentLevel: score,
      targetLevel: existing_skill?.targetLevel || 70,
      levelLabel: score > 70 ? "advanced" : score > 40 ? "intermediate" : "beginner",
      prerequisites: [],
      dependencies: [],
      relatedKnowledge: existing_skill?.relatedKnowledge || [],
      evidence: existing_skill?.evidence || [],
      hoursInvested: existing_skill?.hoursInvested || 0,
      lastPracticed: existing_skill?.lastPracticed || profile.lastActive || new Date().toISOString(),
      growthRate: existing_skill?.growthRate || 0,
      createdAt: existing_skill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

// ============================================================================
// MASTERY ENGINE
// ============================================================================

const DIMENSION_KEYS: MasteryDimension[] = ["comprehension","recall","application","transfer","creation","retention"];

export function computeMastery(skills: LearnerSkill[], existingMastery: SkillMastery[]): SkillMastery[] {
  const existing = new Map<string, SkillMastery>(existingMastery.map(m => [m.skillId, m]));

  return skills.map(s => {
    const prev = existing.get(s.id);
    const dimensions = Object.fromEntries(
      DIMENSION_KEYS.map(d => [d, estimateDimension(d, s, prev)])
    ) as Record<MasteryDimension, number>;

    const overallMastery = Math.round(
      DIMENSION_KEYS.reduce((sum, d) => sum + dimensions[d] * MASTERY_WEIGHTS[d], 0)
    );

    return {
      skillId: s.id,
      skillName: s.name,
      dimensions,
      overallMastery,
      lastPracticed: s.lastPracticed,
      retentionRate: prev?.retentionRate || 100,
      interval: prev?.interval || 1,
      easeFactor: prev?.easeFactor || 2.5,
      repetitionCount: prev?.repetitionCount || 0,
      assessmentHistory: prev?.assessmentHistory || [],
      confidence: overallMastery > 50 ? "high" : overallMastery > 20 ? "medium" : "low",
      lastAssessed: s.lastPracticed,
      evidence: s.evidence || [],
    };
  });
}

function estimateDimension(dim: MasteryDimension, skill: LearnerSkill, _prev?: SkillMastery): number {
  const s = skill.currentLevel;
  switch (dim) {
    case "comprehension": return Math.min(100, s + 5);
    case "recall": return Math.min(100, s - 5);
    case "application": return Math.min(100, Math.max(0, s - 10) + (skill.evidence?.length || 0) * 3);
    case "transfer": return Math.min(100, Math.max(0, s - 15) + (skill.hoursInvested || 0));
    case "creation": return Math.min(100, Math.max(0, s - 20) + ((skill.evidence?.filter(e => e.source === "project").length || 0) * 10));
    case "retention": return Math.min(100, s + Math.random() * 5); // TODO: real retention calc
  }
}

// ============================================================================
// ADAPTIVE LEARNING ENGINE
// ============================================================================

export function computeNextAction(
  skills: LearnerSkill[], mastery: SkillMastery[], goals: LearnerGoal[],
  recentMistakes: string[] = []
): NextAction {
  const activeGoals = goals.filter(g => g.status === "active");
  const goalSkillIds = new Set(activeGoals.flatMap(g => g.requiredSkills.map(s => s.skillId)));

  // Pick target: goal-linked skill with lowest mastery
  let targetId: string | undefined;
  if (goalSkillIds.size > 0) {
    const goalMasteries = mastery.filter(m => goalSkillIds.has(m.skillId));
    targetId = goalMasteries.sort((a, b) => a.overallMastery - b.overallMastery)[0]?.skillId;
  }
  if (!targetId) {
    targetId = mastery.sort((a, b) => a.overallMastery - b.overallMastery)[0]?.skillId;
  }

  const targetSkill = skills.find(s => s.id === targetId) || skills[0];
  const targetMastery = mastery.find(m => m.skillId === targetId);
  const m = targetMastery?.overallMastery || 0;
  const name = targetSkill?.name || "Unknown Skill";

  let type: ActionType, reason: string, suggestedTask: string, format: LearningFormat;

  if (m < 20) {
    type = "teach"; reason = `${name} mastery at ${m}% — building foundations`; suggestedTask = `Start learning ${name}`; format = "text";
  } else if (m < 40) {
    type = "teach"; reason = `${name} mastery at ${m}% — continue building`; suggestedTask = `Complete ${name} lesson`; format = "visual";
  } else if (m < 60) {
    type = "practice"; reason = `${name} mastery at ${m}% — apply knowledge`; suggestedTask = `Complete 3 ${name} exercises`; format = "exercise";
  } else if (m < 80) {
    type = "project"; reason = `${name} mastery at ${m}% — real-world application`; suggestedTask = `Build a project using ${name}`; format = "project";
  } else if (m < 95) {
    type = "assess"; reason = `${name} mastery near complete — verify understanding`; suggestedTask = `Take ${name} mastery assessment`; format = "interactive";
  } else {
    type = "advance"; reason = `${name} mastered — move to next skill`; suggestedTask = `Advance to ${name} dependent skills`; format = "dialogue";
  }

  if (recentMistakes.length > 0) {
    type = "review";
    reason = `Recent mistakes detected — targeted review needed`;
    suggestedTask = `Review concepts with errors and retry`;
    format = "exercise";
  }

  let urgency: NextAction["urgency"];
  if (m < 30) urgency = "now"; else if (m < 60) urgency = "today";
  else if (m < 80) urgency = "this_week"; else urgency = "next_week";

  return { type, skillId: targetId || "unknown", skillName: name, reason, suggestedTask, priority: m < 50 ? "high" : "medium", urgency, format };
}

// ============================================================================
// DAILY MISSION GENERATOR
// ============================================================================

export function generateDailyMission(goals: LearnerGoal[], nextAction: NextAction, _profile: LearnerProfile): DailyMission {
  const activeGoal = goals.find(g => g.status === "active");

  const tasks: MissionTask[] = [
    {
      id: `m-${Date.now()}`,
      title: nextAction.suggestedTask,
      type: nextAction.type === "teach" || nextAction.type === "advance" ? "learn"
        : nextAction.type === "practice" ? "practice"
        : nextAction.type === "project" ? "build"
        : nextAction.type === "review" ? "review" : "assess",
      skillId: nextAction.skillId,
      completed: false,
      xpReward: 50,
    },
    { id: `m-${Date.now()+1}`, title: `Practice ${nextAction.skillName} — 3 exercises`, type: "practice", skillId: nextAction.skillId, completed: false, xpReward: 30 },
    { id: `m-${Date.now()+2}`, title: `Review yesterday's ${nextAction.skillName}`, type: "review", skillId: nextAction.skillId, completed: false, xpReward: 15 },
  ];

  const quotes = ["Փոքր քայլեր, մեծ արդյունք:", "Ամեն օր մի փոքր ավելի լավը:", "Սովորելը ճանապարհ է:", "Քո ապագան սկսվում է այսօր:"];

  return {
    date: new Date().toISOString().split("T")[0],
    goalTitle: activeGoal?.title || "Personal Growth",
    tasks,
    quote: quotes[Math.floor(Math.random() * quotes.length)],
    completed: false,
  };
}

// ============================================================================
// MENTOR CONTEXT BUILDER
// ============================================================================

export function buildMentorContext(profile: LearnerProfile): MentorContextSnapshot {
  const activeGoals = profile.goals.filter(g => g.status === "active");
  const topSkills = profile.mastery
    .sort((a, b) => b.overallMastery - a.overallMastery)
    .slice(0, 10);

  return {
    profile: {
      name: profile.name,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      growthScore: profile.growthScore,
    },
    activeGoals: activeGoals.map(g => ({
      title: g.title,
      progress: g.progress,
      priority: g.priority,
      nextMilestone: g.milestones.find(m => !m.completed)?.title,
    })),
    skillSummary: topSkills.map(s => ({
      name: s.skillName,
      mastery: s.overallMastery,
      levelLabel: profile.skills.find(sk => sk.id === s.skillId)?.levelLabel || "beginner",
    })),
    strengths: profile.mastery.filter(m => m.overallMastery > 60).map(m => m.skillName).slice(0, 5),
    weaknesses: profile.mastery.filter(m => m.overallMastery < 30).map(m => m.skillName).slice(0, 5),
    todayMission: profile.learningState.dailyMission,
    nextAction: profile.learningState.nextAction,
    recentActivity: profile.learningState.recentLessons.slice(0, 3).map(l => `${l.title} (${l.quizScore}%)`).join("; ") || "No recent activity",
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// ANALYTICS COMPUTER
// ============================================================================

export function computeAnalytics(profile: LearnerProfile): LearnerAnalytics {
  const daysSinceJoin = Math.max(1, (Date.now() - new Date(profile.createdAt).getTime()) / (86400000));
  const weeksActive = Math.max(1, daysSinceJoin / 7);

  return {
    weeklyXp: Math.round(profile.xp / weeksActive),
    dailyAverage: Math.round((profile.analytics?.totalHoursLearned || 0) / daysSinceJoin * 60),
    totalHoursLearned: profile.analytics?.totalHoursLearned || 0,
    skillsAssessed: profile.mastery.filter(m => m.assessmentHistory.length > 0).length,
    skillsAboveThreshold: profile.mastery.filter(m => m.overallMastery > 40).length,
    activeGoals: profile.goals.filter(g => g.status === "active").length,
    completedGoals: profile.goals.filter(g => g.status === "completed").length,
    projectsCompleted: profile.projects.filter(p => p.status === "completed").length,
    learningVelocity: Math.round(profile.xp / daysSinceJoin),
    streakHistory: profile.analytics?.streakHistory || [],
    focusAreas: profile.skills.slice(0, 5).map(s => s.name),
    recentImprovements: profile.learningState?.recentAchievements?.slice(0, 3) || [],
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// FULL PIPELINE: Profile → Everything
// ============================================================================

export function runIntelligencePipeline(profile: LearnerProfile & { progress?: any }): Partial<LearnerProfile> {
  const skills = diagnoseSkills(profile);
  const mastery = computeMastery(skills, profile.mastery || []);
  const na = computeNextAction(skills, mastery, profile.goals, profile.learningState?.recentMistakes || []);
  const dailyMission = generateDailyMission(profile.goals, na, profile);
  const mentorContext = buildMentorContext({
    ...profile,
    skills,
    mastery,
    learningState: { ...(profile.learningState || {} as any), nextAction: na, dailyMission },
  });
  const analytics = computeAnalytics({
    ...profile,
    skills,
    mastery,
    learningState: { ...(profile.learningState || {} as any), nextAction: na, dailyMission },
  });

  return {
    skills,
    mastery,
    learningState: {
      ...(profile.learningState || {} as any),
      dailyMission,
      nextAction: na,
      updatedAt: new Date().toISOString(),
    },
    mentorContext,
    analytics,
    growthScore: computeGrowthScore(mastery, analytics),
    updatedAt: new Date().toISOString(),
  };
}

function computeGrowthScore(mastery: SkillMastery[], analytics: LearnerAnalytics): number {
  const skillScore = Math.min(400, mastery.reduce((sum, m) => sum + m.overallMastery, 0));
  const momentumScore = Math.min(200, analytics.weeklyXp / 5);
  const goalScore = Math.min(150, analytics.completedGoals * 30 + analytics.activeGoals * 15);
  const projectScore = Math.min(150, analytics.projectsCompleted * 25);
  const retentionScore = Math.min(100, mastery.reduce((sum, m) => sum + m.retentionRate, 0) / Math.max(1, mastery.length));
  return Math.min(1000, skillScore + momentumScore + goalScore + projectScore + retentionScore);
}
