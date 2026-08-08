/**
 * KrtLab Personal & Professional Growth OS
 * Unified Domain Model — TypeScript Types
 * 
 * These types replace/expand the original types.ts.
 * Backward compatible with existing UserProfile for gradual migration.
 */

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

export type ISO8601 = string;
export type UserId = string;
export type UUID = string;

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type GoalStatus = 'active' | 'completed' | 'abandoned' | 'paused';
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'archived';
export type Mood = 'great' | 'good' | 'okay' | 'struggling' | 'bad';

// ============================================================================
// GROWTH PROFILE (top-level user document)
// ============================================================================

export interface GrowthProfile {
  // Identity
  uid: string;
  name: string;
  email: string | null;
  bio?: string;
  avatar?: string;
  location?: string;

  // Gamification
  xp: number;
  level: number;
  streak: number;
  points: number;
  lastStreakUpdate: ISO8601 | null;

  // Discovery
  discovery?: DiscoveryAnswers;

  // Settings
  role: 'admin' | 'teacher' | 'student';
  preferredLanguage: 'hy' | 'en';
  isDemoMode: boolean;
  migrationVersion: number;

  // Denormalized summaries (computed from subcollections)
  activeGoals: number;
  skillsCount: number;
  projectsCompleted: number;
  certificatesEarned: number;
  portfolioItems: number;

  // AI context snapshot
  strengths: string[];
  weaknesses: string[];
  recommendedFocus: string[];
  growthScore: number; // 0-1000

  // Timestamps
  createdAt: ISO8601;
  lastActive: ISO8601;
  updatedAt: ISO8601;

  // Legacy backward compatibility
  school?: string;
  flashcards?: Flashcard[];
  gameHighScores?: Record<string, number>;
  gameAdaptiveStats?: Record<string, GameAdaptiveState>;
  discipline?: DisciplineState;
  completedProjects?: string[];
  completedPractices?: Record<string, number>;
}

export interface DiscoveryAnswers {
  goal: 'programmer' | 'marketing' | 'english' | 'other';
  skillLevel: SkillLevel;
  dailyTime: '10' | '30' | '60';
  style: 'reading' | 'video' | 'practice';
}

// ============================================================================
// GOALS
// ============================================================================

export interface Goal {
  id: UUID;
  title: string;
  description: string;
  category: 'career' | 'skill' | 'project' | 'habit' | 'education' | 'personal';
  status: GoalStatus;
  priority: Priority;

  // Progress
  progress: number; // 0-100
  targetDate?: ISO8601;
  completedAt?: ISO8601;

  // Connections
  linkedSkillIds: string[];
  linkedProjectIds: string[];
  linkedHabitIds: string[];

  // AI
  aiRecommendation?: string;
  difficulty: SkillLevel;
  estimatedHours: number;

  // Tasks
  tasks: GoalTask[];

  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface GoalTask {
  id: UUID;
  title: string;
  completed: boolean;
  type: 'lesson' | 'project' | 'habit' | 'practice' | 'certificate';
  refId?: string;
  deadline?: ISO8601;
  completedAt?: ISO8601;
}

// ============================================================================
// SKILLS
// ============================================================================

export interface UserSkill {
  id: UUID;
  name: string;
  category: string; // 'programming', 'design', 'business', 'language', etc.

  // Level
  currentLevel: number; // 0-100
  targetLevel: number;
  levelLabel: SkillLevel;

  // Evidence — how did they prove this skill?
  evidence: SkillEvidence[];

  // Connections
  requiredFor: string[]; // career path IDs
  gainedFrom: string[]; // course/lesson IDs
  endorsedBy: string[]; // mentor/user IDs

  // Analytics
  hoursInvested: number;
  lastPracticed: ISO8601;
  growthRate: number; // points gained per week

  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface SkillEvidence {
  source: 'lesson' | 'project' | 'certificate' | 'assessment' | 'practice_lab' | 'game';
  sourceId: string;
  description: string;
  points: number;
  timestamp: ISO8601;
}

export interface SkillMap {
  [skillName: string]: string[]; // skillName → related subfield IDs
}

// ============================================================================
// COURSES
// ============================================================================

export interface EnrolledCourse {
  id: UUID;
  title: string;
  provider: string; // 'KrtLab' | external
  category: string;

  // Progress
  totalLessons: number;
  completedLessons: number;
  progress: number; // 0-100

  // Skill mapping
  skillsGained: SkillPoints[];

  // Timeline
  startedAt: ISO8601;
  completedAt?: ISO8601;
  lastActivityAt: ISO8601;

  // Meta
  aiSummary?: string;
  difficulty: SkillLevel;
}

export interface SkillPoints {
  skillId: string;
  points: number;
}

// ============================================================================
// HABITS
// ============================================================================

export interface Habit {
  id: UUID;
  title: string;
  category: 'health' | 'learning' | 'productivity' | 'mindfulness' | 'social';
  frequency: 'daily' | 'weekly' | 'custom';

  // Tracking
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completionRate: number; // last 30 days

  // Goal connection
  linkedGoalIds: string[];

  // Schedule
  targetDays: string[];
  reminderTime?: string;

  createdAt: ISO8601;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
}

// ============================================================================
// PROJECTS
// ============================================================================

export interface Project {
  id: UUID;
  title: string;
  description: string;
  category: string;

  // Status
  status: ProjectStatus;
  progress: number; // 0-100

  // Skills demonstrated
  skillsUsed: string[];
  technologies: string[];

  // Links
  repoUrl?: string;
  liveUrl?: string;
  portfolioItemId?: string;

  // Impact
  xpReward: number;
  hoursInvested: number;
  complexity: SkillLevel;

  // Tasks
  tasks: ProjectTask[];

  createdAt: ISO8601;
  completedAt?: ISO8601;
  updatedAt: ISO8601;
}

export interface ProjectTask {
  id: UUID;
  title: string;
  completed: boolean;
  completedAt?: ISO8601;
}

// ============================================================================
// CERTIFICATES
// ============================================================================

export interface Certificate {
  id: UUID;
  title: string;
  issuer: string; // 'KrtLab' | external
  courseName: string;
  levelName: string;

  // Verification
  certificateUrl?: string;
  verificationCode?: string;

  // Skills validated
  skillsValidated: string[];

  earnedAt: ISO8601;
  expiresAt?: ISO8601;
}

// ============================================================================
// CAREER
// ============================================================================

export interface CareerItem {
  id: UUID;
  type: 'profile' | 'path' | 'application' | 'interview';

  // Career Profile
  targetRoles: string[];
  targetIndustries: string[];
  targetSalary?: MonetaryRange;
  preferredLocation: string;
  remotePreference: 'remote' | 'hybrid' | 'onsite';

  // Career Path
  currentStage?: string;
  nextMilestones?: CareerMilestone[];

  // Applications
  applications?: JobApplication[];

  // Skill gap analysis
  skillGaps: SkillGap[];

  updatedAt: ISO8601;
}

export interface MonetaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface CareerMilestone {
  title: string;
  skillsRequired: string[];
  eta: string;
}

export interface JobApplication {
  id: UUID;
  company: string;
  role: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected';
  appliedAt: ISO8601;
  notes?: string;
}

export interface SkillGap {
  skillId: string;
  current: number;
  required: number;
  priority: Priority;
}

// ============================================================================
// PORTFOLIO
// ============================================================================

export interface PortfolioItem {
  id: UUID;
  title: string;
  description: string;
  type: 'project' | 'certificate' | 'article' | 'talk' | 'open_source';

  // Content
  body?: string; // markdown
  imageUrl?: string;
  links: ResourceLink[];

  // Skills showcased
  skillsHighlighted: string[];

  // Visibility
  isPublished: boolean;
  featuredOrder?: number;

  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface ResourceLink {
  label: string;
  url: string;
}

// ============================================================================
// AI CONVERSATIONS
// ============================================================================

export interface AIConversation {
  id: UUID;
  title: string; // auto-generated summary
  startedAt: ISO8601;
  lastMessageAt: ISO8601;

  // Context snapshot at conversation start
  contextSnapshot: ConversationContext;

  // Messages stored in subcollection
}

export interface ConversationContext {
  activeGoals: string[];
  topSkills: string[];
  recentActivity: string;
  currentStreak: number;
}

export interface AIConversationMessage {
  id: UUID;
  role: 'user' | 'assistant';
  text: string;
  timestamp: ISO8601;
  actions?: AIAction[];
}

export interface AIAction {
  type: 'learning' | 'project' | 'habit' | 'goal' | 'career' | 'reflection' | 'portfolio';
  title: string;
  priority: Priority;
  description?: string;
  linkPath?: string;
}

// ============================================================================
// REFLECTIONS
// ============================================================================

export interface Reflection {
  id: UUID;
  title: string;
  content: string; // markdown

  // Mood/metrics
  mood?: Mood;
  energyLevel?: number; // 1-10
  productivityLevel?: number; // 1-10

  // Tags
  tags: string[];

  // Connections
  relatedGoals: string[];
  relatedProjects: string[];

  createdAt: ISO8601;
}

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export interface AnalyticsEvent {
  id: UUID;
  type: AnalyticsEventType;

  // Event data (varies by type)
  data: Record<string, unknown>;

  // Impact
  xpGained: number;
  skillsAffected: SkillPoints[];

  timestamp: ISO8601;
}

export type AnalyticsEventType =
  | 'lesson_completed'
  | 'quiz_passed'
  | 'skill_leveled_up'
  | 'goal_milestone'
  | 'project_completed'
  | 'streak_extended'
  | 'certificate_earned'
  | 'habit_completed'
  | 'ai_conversation'
  | 'practice_completed'
  | 'game_completed'
  | 'reflection_written';

// ============================================================================
// LEARNING PROGRESS (promoted from embedded to subcollection)
// ============================================================================

export interface LearningProgressRecord {
  id: UUID;
  categoryId: string;
  subfieldId: string;
  levelId: number;

  // Stage completion
  lessonCompleted: boolean;
  quizCompleted: boolean;
  quizScore: number;
  practiceCompleted: boolean;
  practiceScore: number;
  gameCompleted: boolean;
  gameScore: number;

  // Analytics
  timeSpent: number; // seconds
  mistakes: string[];
  questionsAsked: number;

  // AI analysis
  aiLevel?: 'low' | 'medium' | 'high';
  aiWeakPoints?: string[];
  aiRecommendation?: string;

  // Skill mapping
  skillsGained: SkillPoints[];

  completedAt?: ISO8601;
  updatedAt: ISO8601;
}

// ============================================================================
// LEGACY TYPES (preserved for backward compatibility)
// ============================================================================

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  categoryId: string;
  subcategoryId: string;
  createdAt: string;
  nextReview?: string;
  interval?: number;
  easeFactor?: number;
  repetitionCount?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
}

export interface GameAdaptiveState {
  currentInternalLevel: number;
  bestAccuracy: number;
  averageReactionTime: number;
  consecutiveSuccesses: number;
  history: GameSessionResult[];
}

export interface GameSessionResult {
  accuracy: number;
  reactionTime: number;
  completionTime: number;
  errorCount: number;
  timestamp: string;
  difficultyLevel: number;
}

export interface DisciplineState {
  daysCount: number;
  startDate: string;
  completedToday: boolean;
  dailyTasks: DailyTask[];
}

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  type: 'lesson' | 'quiz' | 'flashcard' | 'project';
  refId?: string;
}

// ============================================================================
// COMPUTED/AGGREGATE TYPES
// ============================================================================

/** Summary view for dashboard — computed from GrowthProfile + subcollections */
export interface GrowthSummary {
  whereAmI: {
    skills: { name: string; level: number; label: SkillLevel }[];
    currentStreak: number;
    projectsCompleted: number;
    certificatesEarned: number;
    habitsActive: number;
  };
  whereAmIGoing: {
    activeGoals: { title: string; progress: number; priority: Priority }[];
    targetCareer: { roles: string[]; skillGaps: SkillGap[] };
    nextMilestones: CareerMilestone[];
  };
  whatShouldIDoNext: AIAction[];
  analytics: {
    growthScore: number;
    strengths: string[];
    weaknesses: string[];
    weeklyXp: number;
    learningVelocity: number; // points per day
  };
}

/** Snapshot used for AI Mentor context injection */
export interface MentorContext {
  profile: Pick<GrowthProfile, 'name' | 'xp' | 'level' | 'streak' | 'strengths' | 'weaknesses'>;
  activeGoals: Pick<Goal, 'title' | 'progress' | 'priority' | 'category'>[];
  topSkills: Pick<UserSkill, 'name' | 'currentLevel' | 'levelLabel'>[];
  recentLearning: Pick<LearningProgressRecord, 'subfieldId' | 'levelId' | 'quizScore' | 'aiLevel'>[];
  activeProjects: Pick<Project, 'title' | 'status' | 'progress' | 'skillsUsed'>[];
  habits: Pick<Habit, 'title' | 'currentStreak' | 'frequency'>[];
  careerGaps: SkillGap[];
}

// ============================================================================
// API CONTRACT TYPES
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    duration: number;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}
