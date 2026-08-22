import { z } from "zod";

/**
 * These schemas validate the ACTUAL response shapes produced by
 * server/services/gemini/*.ts today, cross-checked against how
 * src/types.ts and the React consumers (LearningModule.tsx,
 * PracticeLab.tsx, useLessonStore.ts) read the data.
 *
 * IMPORTANT DISCOVERED DISCREPANCY (documented, not silently "fixed"):
 * src/types.ts declares `PracticalTask` with REQUIRED `context`, `role`,
 * `mission`, `constraints` fields, and LearningModule.tsx reads
 * `level.practicalTask.constraints.map(...)` — which will throw at
 * runtime if `constraints` is undefined. However, the actual Gemini
 * prompt in server/services/gemini/learning.ts only ever asks for
 * `practicalTask:{title,scenario,instructions,deliverable,evaluationCriteria}`
 * — it never requests context/role/mission/constraints. Similarly,
 * `PracticalScenario` (game) declares required `win_condition` /
 * `lose_condition` and structured `ScenarioStep[]`, but the prompt only
 * asks for a bare `steps[]` with no inner shape.
 *
 * Per this task's explicit scope ("do NOT combine ... prompt redesign
 * ... into this task — handle separately"), these schemas validate the
 * CURRENT real contract (what Gemini is actually asked for and actually
 * returns), with the richer type-declared fields kept OPTIONAL rather
 * than required. This means validation will pass for today's real
 * responses. The prompt/type mismatch itself is a separate, confirmed
 * follow-up item — see the audit report, not fixed here.
 */

export const BookReferenceSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  description: z.string(),
});

export const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(8),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().optional(),
});

// Matches the actual generateLessonContent prompt contract. Richer fields
// declared on src/types.ts's PracticalTask (context/role/mission/constraints)
// are accepted if present but not required — see discrepancy note above.
// String sub-fields allow empty strings (not `.min(1)`): the app's own
// existing getFallbackLesson() populates these with "" as placeholders,
// and practicalTask is a supplementary interactive element, not core
// lesson content — an empty placeholder here should degrade gracefully
// in the UI rather than fail validation entirely.
export const PracticalTaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  scenario: z.string(),
  instructions: z.string(),
  deliverable: z.string(),
  evaluationCriteria: z.string(),
  context: z.string().optional(),
  role: z.string().optional(),
  mission: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  bonusChallenge: z.string().optional(),
});

// Matches the actual generateLessonContent prompt contract for `game`.
// win_condition/lose_condition and structured steps are declared on
// src/types.ts's PracticalScenario but not currently requested from
// Gemini — see discrepancy note above. `steps` is validated loosely
// (bounded array of objects) rather than the strict ScenarioStep shape.
// Same empty-string tolerance rationale as PracticalTaskSchema above.
export const GameSchema = z.object({
  title: z.string().min(1),
  scenario: z.string(),
  player_role: z.string(),
  steps: z.array(z.record(z.string(), z.any())).max(30),
  win_condition: z.string().optional(),
  lose_condition: z.string().optional(),
});

export const CompletionSchema = z.object({
  message: z.string().min(1),
  total_xp: z.number().nonnegative(),
});

/**
 * The core "Lesson"/Level content contract, matching
 * generateLessonContent()'s actual prompt + src/types.ts's `Level` type
 * for field names. Bounded array sizes are defensive limits — Gemini has
 * no hard cap today, so an adversarial or malformed response with an
 * enormous array should be rejected rather than passed through.
 */
export const LessonContentSchema = z.object({
  title: z.string().min(1).max(300),
  topicId: z.string().max(200).optional(),
  topicName: z.string().max(300).optional(),
  orderIndex: z.number().optional(),
  introduction: z.string().min(1).max(5000),
  keyConcepts: z.array(z.string().min(1)).min(1).max(30),
  detailedExplanation: z.string().min(1).max(20000),
  examples: z.array(z.string().min(1)).max(30),
  exercises: z.array(z.string().min(1)).max(30),
  miniSummary: z.string().min(1).max(3000),
  recommendedReading: z.array(BookReferenceSchema).max(20).default([]),
  quiz: z.array(QuizQuestionSchema).min(1).max(30),
  practicalTask: PracticalTaskSchema.optional(),
  game: GameSchema.optional(),
  completion: CompletionSchema.optional(),
  requiredScore: z.number().min(0).max(100).optional(),
});

/**
 * Matches PracticeLabTask / PracticeLabStep in src/types.ts. Unlike the
 * lesson schema, generatePracticeLabTask's current prompt
 * ("Generate practice lab", server/routes/gemini.ts) requests NO specific
 * shape at all — so this schema targets the full type the frontend
 * actually depends on (PracticeLab.tsx). Until the prompt is redesigned
 * (explicitly out of scope for this task), real responses will likely
 * fail this validation often; that is the correct, intended behavior —
 * a controlled AI_VALIDATION_ERROR beats silently shipping the previous
 * fallback of `{id, steps: []}`, which itself does not match
 * PracticeLabTask and would have caused undefined-field crashes in
 * PracticeLab.tsx (e.g. reading `.title`, `.role`, `.xpReward`).
 */
export const PracticeLabStepSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  question: z.string().min(1),
  type: z.enum(["text", "choice", "calculation"]),
  options: z.array(z.string()).optional(),
  hint: z.string(),
  expectedOutcome: z.string(),
});

export const PracticeLabTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  subfieldId: z.string().min(1),
  subfieldTitle: z.string().min(1),
  level: z.number(),
  scenario: z.string().min(1),
  role: z.string().min(1),
  steps: z.array(PracticeLabStepSchema).min(1).max(20),
  xpReward: z.number().nonnegative(),
});

/**
 * Matches analyzeProgress()'s prompt contract + its own existing fallback
 * shape in server/services/gemini/learning.ts.
 */
export const AnalyzeProgressSchema = z.object({
  level: z.string(),
  weakPoints: z.array(z.string()).max(20),
  recommendation: z.string(),
  nextLessonType: z.string(),
});

/**
 * Matches extractTermsFromLesson()'s prompt contract in
 * server/services/gemini/certificates.ts ("Extract 8-12 key terms...").
 * Bounded generously beyond 8-12 since Gemini doesn't hard-enforce the
 * count itself.
 */
export const ExtractedTermSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.string().min(1),
});

export const ExtractTermsResponseSchema = z.object({
  terms: z.array(ExtractedTermSchema).max(30),
});
