import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn();

vi.mock("../../utils/aiClient", () => ({
  getAIClient: () => ({ models: { generateContent: mockGenerateContent } }),
  TEXT_MODEL: "gemini-test-model",
  TTS_MODEL: "gemini-tts-test-model",
}));

// withRetry only retries on quota-classified errors; for these tests we want
// immediate pass-through, so we import the real helpers (isQuotaError logic
// is exercised implicitly — a plain thrown Error is NOT a quota error, so
// withRetry rethrows immediately without delay).

const VALID_LESSON_JSON = JSON.stringify({
  title: "Ներածություն",
  introduction: "...",
  keyConcepts: ["Concept"],
  detailedExplanation: "...",
  examples: ["ex"],
  exercises: ["ex"],
  miniSummary: "...",
  recommendedReading: [],
  quiz: [{ question: "Q", options: ["A", "B"], correctAnswer: 0 }],
});

describe("generateLessonContent (service, mocked Gemini)", () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it("Gemini valid response -> success:true with validated payload", async () => {
    mockGenerateContent.mockResolvedValue({ text: VALID_LESSON_JSON });
    const { generateLessonContent } = await import("../../services/gemini/learning");
    const result = await generateLessonContent({ category: "business", subfield: "entrepreneurship", level: 1 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBeTruthy();
      expect(Array.isArray(result.data.quiz)).toBe(true);
    }
  });

  it("malformed JSON from Gemini -> falls back to the existing (validated) fallback lesson, not a raw crash", async () => {
    mockGenerateContent.mockResolvedValue({ text: "{ not valid json at all" });
    const { generateLessonContent } = await import("../../services/gemini/learning");
    const result = await generateLessonContent({ category: "business", subfield: "entrepreneurship", level: 1, currentTopic: "Test Topic" });
    // Deliberate design choice (documented in learning.ts): parse failures preserve
    // the existing getFallbackLesson() behavior, re-validated before being trusted.
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBeTruthy();
    }
  });

  it("schema-invalid JSON (parses fine, wrong shape) -> controlled AI_VALIDATION_ERROR, no silent pass-through", async () => {
    mockGenerateContent.mockResolvedValue({ text: JSON.stringify({ hello: "world", not: "a lesson" }) });
    const { generateLessonContent } = await import("../../services/gemini/learning");
    const result = await generateLessonContent({ category: "business", subfield: "entrepreneurship", level: 1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorType).toBe("AI_VALIDATION_ERROR");
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });

  it("Gemini API error (non-quota) -> propagates, existing error classification untouched", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Internal server error"));
    const { generateLessonContent } = await import("../../services/gemini/learning");
    await expect(generateLessonContent({ category: "business", subfield: "entrepreneurship", level: 1 })).rejects.toThrow("Internal server error");
  });
});
