export type Category = {
  id: string;
  title: string;
  icon: string;
  subfields: Subfield[];
};

export type BookReference = {
  title: string;
  author: string;
  description: string;
};

export type RecommendedLiterature = {
  beginner: BookReference[];
  intermediate: BookReference[];
  advanced: BookReference[];
};

export type Subfield = {
  id: string;
  title: string;
  levels: Level[];
  courseTopics?: string[]; // Sequential list of topics for this subfield
  maxLevels?: number;
  recommendedLiterature?: RecommendedLiterature;
};

export interface PracticalTask {
  id?: string;
  title: string;
  scenario: string;
  context: string;
  role: string;
  mission: string;
  constraints: string[];
  instructions: string; // Map to "Steps to Complete"
  deliverable: string;  // Map to "Expected Output"
  evaluationCriteria: string; // Map to "Success Criteria"
  bonusChallenge?: string;
}

export interface ScenarioChoice {
  text: string;
  is_correct: boolean;
  reason: string;
  xp_change: number;
  result: string;
}

export interface ScenarioStep {
  step_id: number;
  situation: string;
  choices: ScenarioChoice[];
}

export interface PracticalScenario {
  title: string;
  scenario: string;
  player_role: string;
  steps: ScenarioStep[];
  win_condition: string;
  lose_condition: string;
}

export type GameType = 'memory' | 'quiz' | 'speed' | 'application' | 'sorting' | 'simulation';

export interface UniversalGame {
  id: string;
  title: string;
  type: GameType;
  instructions: string;
  dataset: any; // Game-specific data (questions, items to match, etc.)
  scoringSystem: {
    basePoints: number;
    bonusMultiplier: number;
  };
  difficulty: number;
  adaptiveParams?: {
    internalLevel: number;
    showDistractors: boolean;
    timeLimit?: number;
    itemCount: number;
  };
}

export interface GameSessionResult {
  accuracy: number;
  reactionTime: number; // in ms
  completionTime: number; // in seconds
  errorCount: number;
  timestamp: string;
  difficultyLevel: number;
}

export interface GameAdaptiveState {
  currentInternalLevel: number;
  bestAccuracy: number;
  averageReactionTime: number;
  consecutiveSuccesses: number;
  history: GameSessionResult[];
}

export interface InteractiveExercise {
  id: string;
  scenario: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  type: 'multiple-choice' | 'calculation' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

export type Level = {
  id: number;
  title: string;
  topicId?: string;
  topicName?: string;
  orderIndex?: number;
  type?: 'lesson' | 'revision';
  introduction: string;
  keyConcepts: string[];
  detailedExplanation: string;
  examples: string[];
  exercises: string[];
  interactiveExercises?: InteractiveExercise[];
  miniSummary: string;
  recommendedReading: BookReference[];
  quiz: QuizQuestion[];
  practiceTask?: PracticalTask;
  game?: PracticalScenario;
  completion?: {
    message: string;
    total_xp: number;
  };
  games?: UniversalGame[];
  requiredScore?: number; // Defaults to 100 if not set
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

export type Flashcard = {
  id: string;
  term: string;
  definition: string;
  categoryId: string;
  subcategoryId: string;
  createdAt: string;
  // SRS fields
  nextReview?: string;
  interval?: number;
  easeFactor?: number;
  repetitionCount?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
};

export type LanguageLevel = 'beginner' | 'intermediate' | 'advanced';

export type LanguageVocabulary = {
  word: string;
  definition: string;
  example: string;
  level: LanguageLevel;
};

export interface PracticeLabStep {
  id: string;
  description: string;
  question: string;
  type: 'text' | 'choice' | 'calculation';
  options?: string[];
  hint: string;
  expectedOutcome: string;
}

export interface PracticeLabTask {
  id: string;
  title: string;
  category: string;
  subfieldId: string;
  subfieldTitle: string;
  level: number;
  scenario: string;
  role: string;
  steps: PracticeLabStep[];
  xpReward: number;
}

export type UserProfile = {
  uid?: string;
  email?: string;
  name: string;
  school?: string;
  createdAt: string;
  lastActive: string;
  role: 'admin' | 'teacher' | 'student';
  isDemoMode?: boolean;
  migrationVersion?: number;
  languageLevels?: Record<string, LanguageLevel>; // languageId -> level
  progress: {
    categories: Record<string, {
      subfields: Record<string, {
        level: number;
        completedLessons: number[]; 
        completedQuizzes: number[];
        completedPractices: number[];
        completedGames: number[];
        score: number;
        accuracy: number;
        stageStatus?: Record<number, {
          lesson: boolean;
          quiz: boolean;
          practice: boolean;
          game: boolean;
          quizScore: number;
          needsLessonRestart?: boolean;
          practicePassed?: boolean;
          isFullyCompleted?: boolean;
        }>;
      }>;
    }>;
  };
  xp: number;
  level: number; // Overall level
  streak: number;
  activityHistory?: string[];
  achievements: string[];
  flashcards?: Flashcard[];
  adaptiveProgress?: Record<string, ProgressAnalysis>; // lessonId -> analysis
  points: number;
  lastStreakUpdate?: string | null;
  // NEW FIELDS
  discovery?: {
    goal: 'programmer' | 'marketing' | 'english' | 'other';
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    dailyTime: '10' | '30' | '60';
    style: 'reading' | 'video' | 'practice';
  };
  customGoal?: string;
  gameHighScores?: Record<string, number>;
  gameAdaptiveStats?: Record<string, GameAdaptiveState>;
  discipline: {
    daysCount: number;
    startDate: string;
    completedToday: boolean;
    dailyTasks: DailyTask[];
  };
  completedProjects: string[]; // IDs of completed Practice Lab projects
  practiceProgress?: Record<string, number>; // subfieldId -> currentLevel (1-20)
  labXp?: number;
  labStreak?: number;
}

export type PracticeSubmission = {
  projectId: string;
  subfieldId: string;
  level: number;
  content: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt: string;
  evaluation?: {
    score: number;
    feedback: string;
    passed: boolean;
  };
};

export interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  type: 'lesson' | 'quiz' | 'flashcard' | 'project';
  refId?: string; // ID of the lesson/project
}

export interface PracticeProject {
  id: string;
  title: string;
  instructions: string;
  expectedResult: string;
  categoryId: string;
  xpReward: number;
}

export type CommunityMessage = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  lessonId?: string;
  likes: number;
}

export type ProgressAnalysis = {
  level: 'low' | 'medium' | 'high';
  weakPoints: string[];
  recommendation: string;
  nextLessonType: 'easy' | 'same' | 'harder';
  timestamp: string;
}

export type TutorMessage = {
  role: 'user' | 'model';
  text: string;
  audio?: string; // Base64 audio if available
};

export type Message = {
  role: 'user' | 'model';
  text: string;
};

export type OptimizationIssueType = 'UX issue' | 'content issue' | 'difficulty imbalance' | 'repetition issue';
export type OptimizationImpact = 'low' | 'medium' | 'high';

export interface OptimizationAudit {
  id: string;
  type: OptimizationIssueType;
  impact: OptimizationImpact;
  issueDetected: string;
  fixApplied: string;
  improvedComponent: 'lesson' | 'quiz' | 'task' | 'game';
  originalDataSnapshot: any;
  improvedData: any;
  timestamp: string;
}

// ===============================================================
// SKILLS PASSPORT / PORTFOLIO / OPPORTUNITIES / ORGANIZATIONS
// Foundation layer for the global platform expansion.
// Skill mastery is DERIVED from existing progress data (categories/
// subfields/levels) — no separate fake tracking system.
// ===============================================================

export type SkillMasteryLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillMastery {
  skillId: string;        // maps to a subfield id in categories.ts (e.g. 'python')
  skillTitle: string;
  categoryId: string;     // parent category id (e.g. 'tech')
  masteryPercent: number; // 0-100, derived from progress.categories[categoryId].subfields[skillId]
  masteryLevel: SkillMasteryLevel;
  levelsCompleted: number;
  totalLevels: number;
  avgQuizAccuracy: number; // 0-100
  lastActivityAt: string | null;
  verified: boolean;       // true only if a real Certificate exists for this skill
}

export interface SkillsPassportProfile {
  uid: string;
  isPublic: boolean;           // user-controlled visibility toggle (section 24: user manages public/private)
  publicSlug?: string;         // e.g. krtlab.app/p/{slug}, generated once, unique
  displayName: string;
  bio?: string;
  location?: string;
  languages?: string[];
  photoUrl?: string;
  skills: SkillMastery[];      // computed, cached snapshot — always recomputable from progress
  updatedAt: string;
}

// ---------------- Certificates (section 7) ----------------

export interface Certificate {
  id: string;               // unique certificate ID, also used in verification URL
  uid: string;
  skillId: string;
  skillTitle: string;
  issueDate: string;
  masteryPercentAtIssue: number;
  verificationUrl: string;  // public verification page, no auth required
  status: 'pending_payment' | 'issued' | 'revoked';
  paymentId?: string;       // reference to Payment doc — never store card data here
}

// ---------------- Portfolio (section 8) ----------------

export type PortfolioItemType = 'project' | 'experience' | 'certificate' | 'link';

export interface PortfolioItem {
  id: string;
  uid: string;
  type: PortfolioItemType;
  title: string;
  description: string;
  skillIds: string[];
  url?: string;
  organization?: string;    // for experience items
  startDate?: string;
  endDate?: string;
  isPublic: boolean;
  source: 'manual' | 'auto_project' | 'auto_certificate' | 'auto_opportunity';
  createdAt: string;
}

// ---------------- Opportunities (section 9) ----------------

export type OpportunityType =
  | 'volunteer' | 'internship' | 'job' | 'freelance'
  | 'project' | 'competition' | 'scholarship' | 'mentorship' | 'youth';

export interface Opportunity {
  id: string;
  organizationId: string;
  title: string;
  type: OpportunityType;
  description: string;
  location: string;
  isRemote: boolean;
  requiredSkillIds: string[];
  preferredSkillIds: string[];
  deadline: string | null;
  applicationUrl?: string;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
}

export interface SkillMatchResult {
  opportunityId: string;
  matchPercent: number;
  matchedRequired: string[];
  missingRequired: string[];
  matchedPreferred: string[];
}

export interface OpportunityApplication {
  id: string;
  opportunityId: string;
  uid: string;
  status: 'submitted' | 'viewed' | 'accepted' | 'rejected';
  submittedAt: string;
  matchPercentAtApply: number;
}

// ---------------- Organizations / B2B (sections 19-20) ----------------

export type OrgRole = 'admin' | 'teacher' | 'member';

export interface Organization {
  id: string;
  name: string;
  type: 'school' | 'university' | 'ngo' | 'company' | 'training_center' | 'youth_org';
  createdBy: string; // uid
  createdAt: string;
}

export interface OrganizationMember {
  uid: string;
  organizationId: string;
  role: OrgRole;
  joinedAt: string;
}

// ---------------- Analytics (section 23) ----------------

export type AnalyticsEventName =
  | 'signup' | 'onboarding_completed' | 'goal_created' | 'assessment_completed'
  | 'lesson_started' | 'lesson_completed' | 'quiz_completed' | 'skill_updated'
  | 'project_completed' | 'certificate_purchased' | 'certificate_issued'
  | 'portfolio_updated' | 'opportunity_viewed' | 'opportunity_applied'
  | 'course_created' | 'course_published' | 'course_purchased'
  | 'subscription_started' | 'subscription_cancelled';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  uid: string | null;
  organizationId?: string;
  metadata?: Record<string, string | number | boolean>;
  timestamp: string;
}

export type LessonProgression = {
  userId: string;
  lessonId: string;
  newLevel: number;
  status: 'level-up' | 'same-level' | 'repeat-lesson';
  messageText: string;
  audioUrl: string;
};
