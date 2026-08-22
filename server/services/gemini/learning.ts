/**
 * Gemini Learning Service
 */
import { getAIClient, TEXT_MODEL, TTS_MODEL } from "../../utils/aiClient";
import { withRetry, safeParseJSON } from "../../utils/helpers";
import { validateAIResponse, AIValidationResult } from "../../utils/validateAIResponse";
import { LessonContentSchema, AnalyzeProgressSchema } from "../../schemas/aiResponses";
import { Modality } from "@google/genai";
import { z } from "zod";

const ai = () => getAIClient();

export async function generateLessonAudio(lessonText: string): Promise<{ audio: string; text: string }> {
  const textResponse = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Դու KrtLab-ի ուսումնական օգնականն ես: Կարդա հետևյալ դասը հստակ հայերեն:\n\n${lessonText}` }));
  const explanationText = textResponse.text || lessonText;
  const audioResponse = await withRetry(() => ai().models.generateContent({ model: TTS_MODEL, contents: [{ parts: [{ text: explanationText }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } }));
  const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  return { audio: base64Audio, text: explanationText };
}

export async function generateSimplerExplanation(lessonText: string): Promise<{ audio: string; text: string }> {
  const textResponse = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Բացատրիր ԱՎԵԼԻ ՊԱՐԶ հայերեն:\n${lessonText}` }));
  const explanationText = textResponse.text || lessonText;
  const audioResponse = await withRetry(() => ai().models.generateContent({ model: TTS_MODEL, contents: [{ parts: [{ text: explanationText }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } }));
  return { audio: audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "", text: explanationText };
}

export async function askTutorQuestion(lessonText: string, question: string, history: { role: string; text: string }[]): Promise<{ audio: string; text: string }> {
  const textResponse = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Դու ուսուցիչ ես: Պատասխանիր հարցին հայերեն:\n\nՀամատեքստ: ${lessonText}\n\nՊատմություն: ${JSON.stringify(history)}\n\nՀարց: ${question}` }));
  const answerText = textResponse.text || "Չհաջողվեց պատասխանել:";
  const audioResponse = await withRetry(() => ai().models.generateContent({ model: TTS_MODEL, contents: [{ parts: [{ text: answerText }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } }));
  return { audio: audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "", text: answerText };
}

export async function analyzeProgress(params: { lessonId: string; quizScore: number; mistakes: string[]; questionsAsked: number }) {
  const response = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Վերլուծիր: Դաս ${params.lessonId}, Թեստ ${params.quizScore}%, Սխալներ ${params.mistakes.join(",")}, Հարցեր ${params.questionsAsked}. JSON: {level,weakPoints:[],recommendation,nextLessonType}. ՄԻԱՅՆ JSON:`, config: { responseMimeType: "application/json" } }));
  const fallback = { level: "medium", weakPoints: [], recommendation: "Շարունակեք:", nextLessonType: "same" };
  const result = validateAIResponse(response.text, AnalyzeProgressSchema);
  if (!result.success) {
    console.warn(`[analyzeProgress] ${result.errorType}: ${result.message}`);
    return fallback;
  }
  return result.data;
}

/** Documentation/reference shape only — see the no-explicit-annotation note on
 * validateAIResponse() in server/utils/validateAIResponse.ts for why. */
export type GenerateLessonContentResult =
  | { success: true; data: z.infer<typeof LessonContentSchema> }
  | { success: false; errorType: "AI_VALIDATION_ERROR"; message: string; issues: z.ZodIssue[] };

export async function generateLessonContent(params: any) {
  const { category, subfield, level, literature, previousLessons, currentTopic, topicIndex } = params;
  const sources = getSourceMap()[subfield] || "Academic standards";
  const prompt = `You are the KrtLab Learning Engine. Generate Level #${level} of a 20-level course. Category: ${category}, Subfield: ${subfield}. Sources: ${sources}. ${currentTopic ? `Topic: "${currentTopic}"` : ""}. Return JSON with: title, topicId, topicName, orderIndex, introduction, keyConcepts[], detailedExplanation, examples[], exercises[], miniSummary, recommendedReading[], quiz[{question,options[],correctAnswer,explanation}], practicalTask:{title,scenario,instructions,deliverable,evaluationCriteria}, game:{title,scenario,player_role,steps[]}, completion:{message,total_xp}, requiredScore. All in Armenian. ONLY JSON.`;
  const response = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: prompt, config: { responseMimeType: "application/json" } }));

  const result = validateAIResponse(response.text, LessonContentSchema);

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  if (result.errorType === "AI_GENERATION_ERROR") {
    // Malformed JSON entirely — preserve the existing fallback-lesson behavior,
    // but validate the fallback itself before trusting it (defense in depth).
    const fallback = getFallbackLesson(category, subfield, level, currentTopic, topicIndex);
    const fallbackResult = validateAIResponse(JSON.stringify(fallback), LessonContentSchema);
    if (fallbackResult.success) {
      console.warn(`[generateLessonContent] AI_GENERATION_ERROR (invalid JSON) — using fallback lesson. ${result.message}`);
      return { success: true as const, data: fallbackResult.data };
    }
    // Even the fallback doesn't validate — this should never happen, but don't lie about success.
    console.error("[generateLessonContent] Fallback lesson itself failed schema validation:", fallbackResult);
    return { success: false as const, errorType: "AI_VALIDATION_ERROR" as const, message: "AI response was malformed and the fallback lesson also failed validation.", issues: fallbackResult.issues };
  }

  // Valid JSON, but it doesn't match the expected lesson schema — do NOT silently
  // accept structurally invalid data. Surface a controlled error to the route.
  console.error(`[generateLessonContent] AI_VALIDATION_ERROR: ${result.message}`, result.issues);
  return { success: false as const, errorType: "AI_VALIDATION_ERROR" as const, message: result.message, issues: result.issues };
}

function getSourceMap(): Record<string, string> {
  return { entrepreneurship: "Y Combinator, HBR, Lean Startup", marketing: "HubSpot, Google Digital Garage, Kotler", sales: "SPIN Selling, Dale Carnegie", python: "Python Docs, fast.ai", javascript: "MDN, freeCodeCamp", ai: "Andrew Ng, fast.ai, HuggingFace", cybersecurity: "OWASP, NIST", finance: "Investopedia, CFI", crypto: "Ethereum.org, Binance Academy" };
}

function getFallbackLesson(cat: string, sub: string, lvl: number, topic?: string, idx?: number) {
  return { title: topic || `${sub} - Level ${lvl}`, topicId: topic?.toLowerCase().replace(/\s+/g,"-") || `topic-${lvl}`, topicName: topic || `Topic ${lvl}`, orderIndex: idx || lvl, introduction: `Բարի գալուստ:`, keyConcepts: ["Հիմունքներ"], detailedExplanation: `Սա ${sub} թեմայի դաս է:`, examples: ["Օրինակ 1"], exercises: ["Վարժություն 1"], miniSummary: "Ամփոփում:", recommendedReading: [], quiz: [{ question: "Հարց", options: ["A","B","C","D"], correctAnswer: 0 }], practicalTask: { title: "Առաջադրանք", scenario: "", instructions: "", deliverable: "", evaluationCriteria: "" }, game: { title: "Խաղ", scenario: "", player_role: "", steps: [] }, completion: { message: "Շնորհավոր:", total_xp: 100 }, requiredScore: 100 };
}
