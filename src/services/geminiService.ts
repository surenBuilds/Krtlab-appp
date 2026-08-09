import { RecommendedLiterature, PracticeLabTask } from "../types";
import { getCachedAudio, cacheAudio } from "../lib/audioCache";
import { pcmToWav } from "../lib/audioUtils";

const GEMINI_KEY = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_GEMINI_API_KEY) || "";
const GEMINI_MODEL = "gemini-2.5-flash";

async function callGeminiApi(prompt: string, responseMimeType?: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const body: any = { contents: [{ parts: [{ text: prompt }] }] };
  if (responseMimeType) body.generationConfig = { responseMimeType };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.error?.message || `API ${res.status}`); }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export function isQuotaError(error: any): boolean {
  if (!error) return false;
  const msg = String(error?.message || "").toLowerCase();
  return msg.includes("429") || msg.includes("quota") || msg.includes("rate limit");
}

export async function generateLessonAudio(lessonText: string) {
  return callGeminiApi(`Convert to spoken Armenian JSON.\n${lessonText}`, "application/json");
}
export async function generateSimplerExplanation(lessonText: string) {
  const text = await callGeminiApi(`Բացատրիր պարզ հայերենով:\n${lessonText}`);
  return { text };
}
export async function askTutorQuestion(lessonText: string, question: string, history: { role: string; text: string }[]) {
  return callGeminiApi(`Դաստիարակ: Պատասխանիր:\nԴաս:${lessonText}\n${history.map(m=>`${m.role}:${m.text}`).join("\n")}\nՀարց:${question}`);
}
export async function analyzeProgress(lessonId: string, quizScore: number, mistakes: string[], questionsAsked: number) {
  return { lessonId, quizScore, status: quizScore >= 80 ? "pass" : "retry" };
}
export async function generatePracticeLabTask(category: string, subfieldId: string, subfieldTitle: string, level: number, topic?: string): Promise<PracticeLabTask | null> {
  try {
    const text = await callGeminiApi(`Armenian lab task for ${subfieldTitle} Lv${level}. JSON:{"id":"...","title":"...","steps":[{"id":"s1","description":"...","question":"...","type":"text","hint":"...","expectedOutcome":"..."}],"xpReward":100} ONLY JSON:`, "application/json");
    return JSON.parse(text);
  } catch {
    return { id:"lab-"+Date.now(),title:"Գործնական",category,subfieldId,subfieldTitle,level,scenario:"",role:"",steps:[{id:"s1",description:"Կատարել",question:"",type:"text",hint:"",expectedOutcome:""}],xpReward:100 };
  }
}
export async function generateLessonContent(category: string, subfield: string, level: number, literature?: RecommendedLiterature, previousLessons: string[]=[], currentTopic?: string, topicIndex?: number) {
  try {
    const text = await callGeminiApi(`Armenian lesson "${subfield}" Lv${level} on "${currentTopic||subfield}". JSON:{"title":"...","introduction":"...","keyConcepts":["..."],"miniSummary":"..."} ONLY JSON:`, "application/json");
    return JSON.parse(text);
  } catch { return { title:subfield, introduction:"", keyConcepts:[], miniSummary:"" }; }
}
export async function extractTermsFromLesson(lessonContent: string) { return callGeminiApi(`Extract 5 key terms:\n${lessonContent}`); }
export async function generateProgressionFeedback(input: { userId:string;userName:string;lessonId:string;lessonCompleted:boolean;quizScore:number;timeSpent:string;mistakes:string[];currentLevel:number;maxLevel:number }) {
  const { userId, lessonId } = input;
  const cacheKey = `progression_${userId}_${lessonId}`;
  try { const cached = await getCachedAudio(cacheKey); if (cached) return cached; } catch {}
  return { userId, lessonId, newLevel: input.quizScore>=80?Math.min(input.currentLevel+1,input.maxLevel):input.currentLevel, status: input.quizScore>=80?"level-up":"same-level", messageText:"Շարունակեք:", audioUrl:"" };
}
export async function chatWithMentor(messages: { role:string; text:string }[], userName:string, context?:string) {
  const system = `Դու KrtLab AI մենթոր: Խոսում ես ${userName}-ի հետ: Պատասխանիր հայերեն, ընկերական:\n${context||""}`;
  const conv = messages.map(m=>`${m.role==="user"?"Օգտատեր":"Մենթոր"}: ${m.text}`).join("\n");
  const text = await callGeminiApi(`${system}\n\n${conv}\nՄենթոր:`);
  return text || "Ներողություն:";
}
export async function generateLanguagePlacementTest(language:string) { return callGeminiApi(`Placement test for ${language}`); }
export async function generateLanguageVocabulary(language:string, level:string, count:number=20) {
  try { const text = await callGeminiApi(`Generate ${count} words for ${language} ${level}. JSON:[{"word":"...","translation":"..."}] ONLY JSON:`, "application/json"); return JSON.parse(text); } catch { return []; }
}
export async function generateStandaloneGame(topic:string, level:string, domain:string, content:string) { return callGeminiApi(`Game for ${topic} (${domain})`); }
export async function generateLanguageGrammar(language:string, level:string) { return callGeminiApi(`Grammar: ${language} ${level}`); }
export async function explainQuizMistake(question:string, userAnswer:string, correctAnswer:string, context?:string) {
  return callGeminiApi(`Բացատրիր սխալը:\nՀարց:${question}\nՊատ:${userAnswer}\nՃիշտ:${correctAnswer}`);
}
export async function generateCertificateOutcomes(courseName:string, levelName:string) {
  return callGeminiApi(`Professional outcomes in Armenian for "${courseName}" (${levelName}). 3-4 sentences.`);
}