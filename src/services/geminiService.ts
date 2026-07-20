import { RecommendedLiterature, PracticeLabTask } from "../types";
import { getCachedAudio, cacheAudio } from "../lib/audioCache";
import { pcmToWav } from "../lib/audioUtils";

export function isQuotaError(error: any): boolean {
  if (!error) return false;
  const errorStr = JSON.stringify(error).toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    errorStr.includes("429") ||
    errorStr.includes("quota exceeded")
  );
}

// Helper to communicate with the Express server API
async function callServerApi(endpoint: string, body: any) {
  try {
    const response = await fetch(`/api/gemini/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error(`Error calling API endpoint /api/gemini/${endpoint}:`, err);
    throw err;
  }
}

export async function generateLessonAudio(lessonText: string) {
  return callServerApi("generateLessonAudio", { lessonText });
}

export async function generateSimplerExplanation(lessonText: string) {
  return callServerApi("generateSimplerExplanation", { lessonText });
}

export async function askTutorQuestion(lessonText: string, question: string, history: { role: string; text: string }[]) {
  return callServerApi("askTutorQuestion", { lessonText, question, history });
}

export async function analyzeProgress(lessonId: string, quizScore: number, mistakes: string[], questionsAsked: number) {
  return callServerApi("analyzeProgress", { lessonId, quizScore, mistakes, questionsAsked });
}

export async function generatePracticeLabTask(
  category: string,
  subfieldId: string,
  subfieldTitle: string,
  level: number,
  topic?: string
): Promise<PracticeLabTask | null> {
  return callServerApi("generatePracticeLabTask", { category, subfieldId, subfieldTitle, level, topic });
}

export async function generateLessonContent(
  category: string,
  subfield: string,
  level: number,
  literature?: RecommendedLiterature,
  previousLessons: string[] = [],
  currentTopic?: string,
  topicIndex?: number
) {
  return callServerApi("generateLessonContent", {
    category,
    subfield,
    level,
    literature,
    previousLessons,
    currentTopic,
    topicIndex,
  });
}

export async function extractTermsFromLesson(lessonContent: string) {
  return callServerApi("extractTermsFromLesson", { lessonContent });
}

export async function generateProgressionFeedback(input: {
  userId: string;
  userName: string;
  lessonId: string;
  lessonCompleted: boolean;
  quizScore: number;
  timeSpent: string;
  mistakes: string[];
  currentLevel: number;
  maxLevel: number;
}) {
  const { userId, lessonId } = input;
  const cacheKey = `progression_${userId}_${lessonId}`;

  try {
    const cached = await getCachedAudio(cacheKey);
    if (cached) return cached;
  } catch (e) {
    console.warn("Audio cache read failed, falling back to network:", e);
  }

  const data = await callServerApi("generateProgressionFeedback", { input });
  const audioUrl = data.base64Audio ? pcmToWav(data.base64Audio) : "";

  const result = {
    userId: data.userId,
    lessonId: data.lessonId,
    newLevel: data.newLevel,
    status: data.status,
    messageText: data.messageText,
    audioUrl,
  };

  try {
    await cacheAudio(cacheKey, result);
  } catch (e) {
    console.warn("Audio cache write failed:", e);
  }

  return result;
}

export async function chatWithMentor(messages: { role: string; text: string }[], userName: string) {
  const response = await callServerApi("chatWithMentor", { messages, userName });
  return response.text;
}

export async function generateLanguagePlacementTest(language: string) {
  return callServerApi("generateLanguagePlacementTest", { language });
}

export async function generateLanguageVocabulary(language: string, level: string, count: number = 20) {
  return callServerApi("generateLanguageVocabulary", { language, level, count });
}

export async function generateStandaloneGame(topic: string, level: string, domain: string, content: string) {
  return callServerApi("generateStandaloneGame", { topic, level, domain, content });
}

export async function generateLanguageGrammar(language: string, level: string) {
  return callServerApi("generateLanguageGrammar", { language, level });
}

export async function explainQuizMistake(question: string, userAnswer: string, correctAnswer: string, context?: string) {
  const response = await callServerApi("explainQuizMistake", { question, userAnswer, correctAnswer, context });
  return response.text;
}

export async function generateCertificateOutcomes(courseName: string, levelName: string) {
  const response = await callServerApi("generateCertificateOutcomes", { courseName, levelName });
  return response.text;
}
