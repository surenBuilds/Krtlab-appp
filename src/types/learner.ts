/**
 * KrtLab Unified Learner Model — Canonical Data Model
 * 
 * This is the SINGLE source of truth for all learner data.
 * It extends and replaces the scattered UserProfile / GrowthProfile / IntelligenceState.
 * 
 * Architecture:
 *   LearnerProfile (root)
 *     ├── identity
 *     ├── goals[]
 *     ├── skills[]
 *     ├── mastery[]
 *     ├── knowledgeGraph[]
 *     ├── learningState
 *     ├── projects[]
 *     ├── assessments[]
 *     ├── portfolio[]
 *     ├── mentorContext
 *     └── analytics
 */

// ============================================================================
// ENUMS
// ============================================================================

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type GoalStatus = 'active' | 'completed' | 'abandoned' | 'paused';
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type MasteryDimension = 'comprehension' | 'recall' | 'application' | 'transfer' | 'creation' | 'retention';
export type ActionType = 'teach' | 'practice' | 'project' | 'assess' | 'review' | 'advance';
export type LearningFormat = 'text' | 'visual' | 'interactive' | 'video' | 'audio' | 'dialogue' | 'exercise' | 'simulation' | 'project';

// ============================================================================
// LEARNER PROFILE (Root Document)
// ============================================================================

export interface LearnerProfile {
  // ── Identity ──
  uid?: string;
  name: string;
  email?: string | null;
  bio?: string;
  avatar?: string;
  location?: string;
  preferredLanguage: string; // 'hy' | 'en' | 'ru' | ...
  role: 'admin' | 'teacher' | 'student';
  isDemoMode: boolean;

  // ── Goal Discovery ──
  discovery?: {
    goal: string;
    skillLevel: SkillLevel;
    dailyTime: string; // '10' | '30' | '60'
    style: string; // 'reading' | 'video' | 'practice'
  };

  // ── Gamification ──
  xp: number;
  level: number;
  streak: number;
  points: number;
  lastStreakUpdate: string | null;
  growthScore: number; // 0-1000 composite

  // ── Intelligence Core ──
  goals: LearnerGoal[];
  skills: LearnerSkill[];
  mastery: SkillMastery[];
  knowledgeGraph: KnowledgeNode[];

  // ── Learning State ──
  learningState: LearningState;
  
  // ── Projects ──
  projects: LearnerProject[];

  // ── Portfolio ──
  portfolio: PortfolioItem[];

  // ── Career ──
  career?: CareerProfile;

  // ── Mentor Context (snapshot for AI) ──
  mentorContext: MentorContextSnapshot;

  // ── Analytics ──
  analytics: LearnerAnalytics;

  // ── Legacy (backward compatibility) ──
  progress?: any; // existing lesson progress
  discipline?: any;
  flashcards?: any[];
  achievements?: string[];
  gameHighScores?: Record<string, number>;
  completedProjects?: string[];

  // ── Timestamps ──
  createdAt: string;
  lastActive: string;
  updatedAt: string;
  migrationVersion?: number;
}

// ============================================================================
// GOALS
// ============================================================================

export interface LearnerGoal {
  id: string;
  title: string;
  description: string;
  category: string; // 'career' | 'skill' | 'project' | 'education' | 'personal'
  status: GoalStatus;
  priority: Priority;
  progress: number; // 0-100

  // Multi-goal support
  parentGoalId?: string;
  subGoals: string[]; // child goal IDs
  
  // Roadmap
  requiredSkills: { skillId: string; targetLevel: number; priority: Priority }[];
  requiredKnowledge: string[]; // concept IDs
  milestones: GoalMilestone[];
  learningPlan: WeeklyPlan[];

  // Meta
  targetDate?: string;
  estimatedHours: number;
  actualHours: number;
  difficulty: SkillLevel;

  // AI
  aiRecommendation?: string;
  aiGeneratedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  title: string;
  skills: string[];
  knowledge: string[];
  estimatedWeeks: number;
  order: number;
  completed: boolean;
  completedAt?: string;
}

export interface WeeklyPlan {
  week: number;
  focus: string;
  skills: string[];
  concepts: string[];
  tasks: string[];
  completed: boolean;
}

// ============================================================================
// SKILLS
// ============================================================================

export interface LearnerSkill {
  id: string; // stable slug, e.g. 'python-programming'
  name: string;
  category: string;
  description: string;
  icon: string;

  // Level
  currentLevel: number; // 0-100
  targetLevel: number;
  levelLabel: SkillLevel;

  // Connections
  prerequisites: string[]; // skill IDs needed before this one
  dependencies: string[]; // skills that depend on this one
  relatedKnowledge: string[]; // concept IDs
  
  // Evidence
  evidence: SkillEvidence[];
  
  // Progress
  hoursInvested: number;
  lastPracticed: string;
  growthRate: number; // points/week

  createdAt: string;
  updatedAt: string;
}

export interface SkillEvidence {
  source: 'lesson' | 'project' | 'assessment' | 'practice' | 'simulation' | 'certificate';
  sourceId: string;
  description: string;
  points: number;
  timestamp: string;
}

// ============================================================================
// MASTERY
// ============================================================================

export interface SkillMastery {
  skillId: string;
  skillName: string;
  
  // Multi-dimensional scores (0-100 each)
  dimensions: Record<MasteryDimension, number>;
  
  // Overall
  overallMastery: number; // weighted average
  
  // Retention
  lastPracticed: string;
  retentionRate: number; // % retained since last assessment
  nextReviewDue?: string;
  
  // Spaced Repetition (SM-2)
  interval: number; // days between reviews
  easeFactor: number; // 1.3-2.5
  repetitionCount: number;
  
  // History
  assessmentHistory: MasteryAssessment[];
  
  // Status
  confidence: 'low' | 'medium' | 'high';
  lastAssessed: string;
  evidence: SkillEvidence[];
}

export interface MasteryAssessment {
  type: 'quiz' | 'project' | 'simulation' | 'oral' | 'written';
  score: number;
  dimensions: Partial<Record<MasteryDimension, number>>;
  mistakes: string[];
  feedback: string;
  timestamp: string;
}

// ============================================================================
// KNOWLEDGE GRAPH
// ============================================================================

export interface KnowledgeNode {
  id: string; // concept identifier
  name: string;
  domain: string;
  description: string;
  
  // Relationships
  prerequisites: string[];
  relatedTo: string[];
  applications: string[];
  examples: string[];
  
  // Learner-specific
  exposure: number; // 0-100 (have they encountered it?)
  comprehension: number; // 0-100
  lastReviewed: string;
  nextReview?: string;
  
  // Resources
  lessons: string[];
  projects: string[];
  assessments: string[];
}

// ============================================================================
// LEARNING STATE
// ============================================================================

export interface LearningState {
  // Current daily mission
  dailyMission: DailyMission;
  missionHistory: DailyMission[];
  
  // Current focus
  currentFocus: {
    skillId: string;
    skillName: string;
    conceptId?: string;
  } | null;
  
  // Next action (computed by intelligence engine)
  nextAction: NextAction;
  nextActionHistory: NextAction[];
  
  // Recent activity
  recentLessons: RecentLesson[];
  recentMistakes: string[];
  recentAchievements: string[];
  
  // Schedule
  preferredTimes: string[];
  todayCompleted: boolean;
  
  updatedAt: string;
}

export interface DailyMission {
  date: string;
  goalTitle: string;
  tasks: MissionTask[];
  quote: string;
  completed: boolean;
}

export interface MissionTask {
  id: string;
  title: string;
  type: 'learn' | 'practice' | 'build' | 'review' | 'assess';
  skillId: string;
  conceptId?: string;
  completed: boolean;
  xpReward: number;
  completedAt?: string;
}

export interface NextAction {
  type: ActionType;
  skillId: string;
  skillName: string;
  conceptId?: string;
  reason: string;
  suggestedTask: string;
  priority: Priority;
  urgency: 'now' | 'today' | 'this_week' | 'next_week';
  format: LearningFormat;
}

export interface RecentLesson {
  id: string;
  title: string;
  skillId: string;
  quizScore: number;
  timeSpent: number;
  completedAt: string;
}

// ============================================================================
// PROJECTS
// ============================================================================

export interface LearnerProject {
  id: string;
  title: string;
  description: string;
  type: 'build' | 'research' | 'analysis' | 'creative' | 'simulation';
  status: ProjectStatus;
  progress: number;
  
  // Skills demonstrated
  skillsUsed: string[];
  knowledgeApplied: string[];
  
  // Deliverables
  tasks: ProjectTask[];
  deliverables: ProjectDeliverable[];
  
  // Evaluation
  evaluation?: ProjectEvaluation;
  
  // Links
  repoUrl?: string;
  liveUrl?: string;
  
  xpReward: number;
  hoursInvested: number;
  complexity: SkillLevel;
  
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  type: 'code' | 'document' | 'presentation' | 'design' | 'other';
  url?: string;
  description: string;
  submittedAt: string;
}

export interface ProjectEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  dimensions: Partial<Record<MasteryDimension, number>>;
}

// ============================================================================
// PORTFOLIO
// ============================================================================

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'certificate' | 'research' | 'achievement' | 'publication';
  
  content?: string; // markdown
  links: { label: string; url: string }[];
  
  skillsHighlighted: string[];
  
  isPublished: boolean;
  featuredOrder?: number;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CAREER
// ============================================================================

export interface CareerProfile {
  targetRoles: string[];
  targetIndustries: string[];
  preferredLocation: string;
  remotePreference: 'remote' | 'hybrid' | 'onsite';
  
  skillGaps: CareerSkillGap[];
  careerPath: CareerMilestone[];
  applications: CareerApplication[];
  
  updatedAt: string;
}

export interface CareerSkillGap {
  skillId: string;
  currentLevel: number;
  requiredLevel: number;
  priority: Priority;
}

export interface CareerMilestone {
  title: string;
  skillsRequired: string[];
  eta: string; // e.g. "6 months"
  completed: boolean;
}

export interface CareerApplication {
  id: string;
  company: string;
  role: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  appliedAt?: string;
  notes?: string;
}

// ============================================================================
// MENTOR CONTEXT (What the AI sees)
// ============================================================================

export interface MentorContextSnapshot {
  profile: {
    name: string;
    xp: number;
    level: number;
    streak: number;
    growthScore: number;
  };
  activeGoals: {
    title: string;
    progress: number;
    priority: Priority;
    nextMilestone?: string;
  }[];
  skillSummary: {
    name: string;
    mastery: number;
    levelLabel: SkillLevel;
  }[];
  strengths: string[];
  weaknesses: string[];
  todayMission: DailyMission | null;
  nextAction: NextAction | null;
  recentActivity: string; // summary of last 24h
  updatedAt: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface LearnerAnalytics {
  weeklyXp: number;
  dailyAverage: number; // minutes
  totalHoursLearned: number;
  skillsAssessed: number;
  skillsAboveThreshold: number;
  activeGoals: number;
  completedGoals: number;
  projectsCompleted: number;
  
  learningVelocity: number; // points/day gained
  streakHistory: number[]; // last 30 days
  focusAreas: string[]; // most studied skills
  recentImprovements: string[];
  
  updatedAt: string;
}
