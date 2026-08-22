import { describe, it, expect } from "vitest";
import { validateAIResponse } from "../utils/validateAIResponse";
import { LessonContentSchema, PracticeLabTaskSchema } from "../schemas/aiResponses";

const VALID_LESSON = {
  title: "Ներածություն Ձեռներեցության մեջ",
  introduction: "Այս դասում կծանոթանանք հիմունքներին։",
  keyConcepts: ["Ձեռներեցություն", "Ռիսկ"],
  detailedExplanation: "Ձեռներեցությունը ...",
  examples: ["Օրինակ 1"],
  exercises: ["Վարժություն 1"],
  miniSummary: "Ամփոփում",
  recommendedReading: [{ title: "Lean Startup", author: "Eric Ries", description: "..." }],
  quiz: [{ question: "Ի՞նչ է ձեռներեցությունը", options: ["Ա", "Բ", "Գ", "Դ"], correctAnswer: 0, explanation: "..." }],
  practicalTask: { title: "Առաջադրանք", scenario: "...", instructions: "...", deliverable: "...", evaluationCriteria: "..." },
  game: { title: "Խաղ", scenario: "...", player_role: "Ընկերության հիմնադիր", steps: [{ step: 1 }] },
  completion: { message: "Շնորհավոր", total_xp: 100 },
  requiredScore: 80,
};

describe("LessonContentSchema — valid data", () => {
  it("1. valid lesson response -> PASS", () => {
    const result = validateAIResponse(JSON.stringify(VALID_LESSON), LessonContentSchema);
    expect(result.success).toBe(true);
  });

  it("11. valid response with optional fields omitted -> PASS", () => {
    const { practicalTask, game, completion, requiredScore, topicId, topicName, orderIndex, ...minimal } = VALID_LESSON as any;
    const result = validateAIResponse(JSON.stringify(minimal), LessonContentSchema);
    expect(result.success).toBe(true);
  });
});

describe("LessonContentSchema — invalid data", () => {
  it("2. missing title -> FAIL", () => {
    const { title, ...withoutTitle } = VALID_LESSON as any;
    const result = validateAIResponse(JSON.stringify(withoutTitle), LessonContentSchema);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errorType).toBe("AI_VALIDATION_ERROR");
  });

  it("3. missing sections-equivalent (keyConcepts) -> FAIL", () => {
    const { keyConcepts, ...withoutSections } = VALID_LESSON as any;
    const result = validateAIResponse(JSON.stringify(withoutSections), LessonContentSchema);
    expect(result.success).toBe(false);
  });

  it("4. empty sections-equivalent (empty keyConcepts array) -> FAIL", () => {
    const bad = { ...VALID_LESSON, keyConcepts: [] };
    const result = validateAIResponse(JSON.stringify(bad), LessonContentSchema);
    expect(result.success).toBe(false);
  });

  it("5. invalid flashcard-equivalent structure (bad recommendedReading entry) -> FAIL", () => {
    const bad = { ...VALID_LESSON, recommendedReading: [{ title: "Missing author and description" }] };
    const result = validateAIResponse(JSON.stringify(bad), LessonContentSchema);
    expect(result.success).toBe(false);
  });

  it("6. invalid quiz structure (missing options) -> FAIL", () => {
    const bad = { ...VALID_LESSON, quiz: [{ question: "Q", correctAnswer: 0 }] };
    const result = validateAIResponse(JSON.stringify(bad), LessonContentSchema);
    expect(result.success).toBe(false);
  });

  it("7. too many quiz questions -> FAIL (bounded array)", () => {
    const bad = { ...VALID_LESSON, quiz: Array.from({ length: 50 }, () => VALID_LESSON.quiz[0]) };
    const result = validateAIResponse(JSON.stringify(bad), LessonContentSchema);
    expect(result.success).toBe(false);
  });

  it("8. excessively large content -> FAIL (bounded string length)", () => {
    const bad = { ...VALID_LESSON, detailedExplanation: "x".repeat(50000) };
    const result = validateAIResponse(JSON.stringify(bad), LessonContentSchema);
    expect(result.success).toBe(false);
  });

  it("9. malformed JSON -> controlled AI_GENERATION_ERROR failure", () => {
    const result = validateAIResponse("{ this is not valid JSON ", LessonContentSchema);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errorType).toBe("AI_GENERATION_ERROR");
  });

  it("10. markdown ```json fenced valid response -> successfully parsed", () => {
    const fenced = "```json\n" + JSON.stringify(VALID_LESSON) + "\n```";
    const result = validateAIResponse(fenced, LessonContentSchema);
    expect(result.success).toBe(true);
  });
});

describe("PracticeLabTaskSchema", () => {
  const validLab = {
    id: "lab-1",
    title: "Practice Lab",
    category: "business",
    subfieldId: "entrepreneurship",
    subfieldTitle: "Entrepreneurship",
    level: 1,
    scenario: "You are launching a startup.",
    role: "Founder",
    steps: [{ id: "s1", description: "d", question: "q?", type: "text", hint: "h", expectedOutcome: "o" }],
    xpReward: 50,
  };

  it("accepts a fully-shaped valid practice lab task", () => {
    const result = validateAIResponse(JSON.stringify(validLab), PracticeLabTaskSchema);
    expect(result.success).toBe(true);
  });

  it("rejects the OLD fallback shape {id, steps: []} — it is not structurally valid", () => {
    const oldFallback = { id: "lab-123", steps: [] };
    const result = validateAIResponse(JSON.stringify(oldFallback), PracticeLabTaskSchema);
    expect(result.success).toBe(false);
  });

  it("rejects a generic unstructured Gemini response like 'Generate practice lab' would plausibly produce", () => {
    const genericJunk = { message: "Here is your practice lab", content: "some text" };
    const result = validateAIResponse(JSON.stringify(genericJunk), PracticeLabTaskSchema);
    expect(result.success).toBe(false);
  });
});
