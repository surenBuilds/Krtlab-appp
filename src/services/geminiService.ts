import { RecommendedLiterature, PracticeLabTask } from "../types";
import { getCachedAudio, cacheAudio } from "../lib/audioCache";
import { pcmToWav } from "../lib/audioUtils";

// Secure API proxy — calls Vercel serverless /api/gemini/*
// GEMINI_API_KEY is NEVER exposed to browser — it lives only on server

async function callApi(endpoint: string, body: any): Promise<any> {
  const url = `/api/gemini/${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API ${res.status}`);
  }
  return res.json();
}

export function isQuotaError(error: any): boolean {
  if (!error) return false;
  const msg = String(error?.message || "").toLowerCase();
  return msg.includes("429") || msg.includes("quota") || msg.includes("rate limit");
}

export async function generateLessonAudio(lessonText: string) { return callApi("generateLessonAudio", { lessonText }); }
export async function generateSimplerExplanation(lessonText: string) { return callApi("generateSimplerExplanation", { lessonText }); }
export async function askTutorQuestion(lessonText: string, question: string, history: { role: string; text: string }[]) { return callApi("askTutorQuestion", { lessonText, question, history }); }
export async function analyzeProgress(lessonId: string, quizScore: number, mistakes: string[], questionsAsked: number) { return callApi("analyzeProgress", { lessonId, quizScore, mistakes, questionsAsked }); }
export async function generatePracticeLabTask(category: string, subfieldId: string, subfieldTitle: string, level: number, topic?: string): Promise<PracticeLabTask | null> { return callApi("generatePracticeLabTask", { category, subfieldId, subfieldTitle, level, topic }); }
export async function generateLessonContent(category: string, subfield: string, level: number, literature?: RecommendedLiterature, previousLessons: string[] = [], currentTopic?: string, topicIndex?: number) { return callApi("generateLessonContent", { category, subfield, level, currentTopic, topicIndex }); }
export async function extractTermsFromLesson(lessonContent: string) { return callApi("extractTermsFromLesson", { lessonContent }); }

export async function generateProgressionFeedback(input: { userId: string; userName: string; lessonId: string; lessonCompleted: boolean; quizScore: number; timeSpent: string; mistakes: string[]; currentLevel: number; maxLevel: number; }) {
  const { userId, lessonId } = input;
  const cacheKey = `progression_${userId}_${lessonId}`;
  try { const cached = await getCachedAudio(cacheKey); if (cached) return cached; } catch {}
  const result = await callApi("generateProgressionFeedback", { input });
  try { await cacheAudio(cacheKey, result); } catch {}
  return result;
}

export async function chatWithMentor(messages: { role: string; text: string }[], userName: string, context?: string) {
  const res = await callApi("chatWithMentor", { messages, userName, context });
  return res.text;
}

export async function generateLanguagePlacementTest(language: string) { return callApi("generateLanguagePlacementTest", { language }); }
export async function generateLanguageVocabulary(language: string, level: string, count: number = 20) { return callApi("generateLanguageVocabulary", { language, level, count }); }
export async function generateStandaloneGame(topic: string, level: string, domain: string, content: string) { return callApi("generateStandaloneGame", { topic, level, domain, content }); }
export async function generateLanguageGrammar(language: string, level: string) { return callApi("generateLanguageGrammar", { language, level }); }

export async function explainQuizMistake(question: string, userAnswer: string, correctAnswer: string, context?: string) {
  const res = await callApi("explainQuizMistake", { question, userAnswer, correctAnswer, context });
  return res.text;
}

export async function generateCertificateOutcomes(courseName: string, levelName: string) {
  const res = await callApi("generateCertificateOutcomes", { courseName, levelName });
  return res.text;
}