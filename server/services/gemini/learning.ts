/**
 * Gemini Learning Service
 */
import { getAIClient, TEXT_MODEL, TTS_MODEL } from "../../utils/aiClient";
import { withRetry, safeParseJSON } from "../../utils/helpers";
import { Modality } from "@google/genai";

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
  return safeParseJSON(response.text || "{}", { level: "medium", weakPoints: [], recommendation: "Շարունակեք:", nextLessonType: "same" });
}

export async function generateLessonContent(params: any): Promise<any> {
  const { category, subfield, level, literature, previousLessons, currentTopic, topicIndex } = params;
  const sources = getSourceMap()[subfield] || "Academic standards";
  const prompt = `You are the KrtLab Learning Engine. Generate Level #${level} of a 20-level course. Category: ${category}, Subfield: ${subfield}. Sources: ${sources}. ${currentTopic ? `Topic: "${currentTopic}"` : ""}. Return JSON with: title, topicId, topicName, orderIndex, introduction, keyConcepts[], detailedExplanation, examples[], exercises[], miniSummary, recommendedReading[], quiz[{question,options[],correctAnswer,explanation}], practicalTask:{title,scenario,instructions,deliverable,evaluationCriteria}, game:{title,scenario,player_role,steps[]}, completion:{message,total_xp}, requiredScore. All in Armenian. ONLY JSON.`;
  const response = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: prompt, config: { responseMimeType: "application/json" } }));
  try { return JSON.parse(response.text || "{}"); } catch { return getFallbackLesson(category, subfield, level, currentTopic, topicIndex); }
}

function getSourceMap(): Record<string, string> {
  return { entrepreneurship: "Y Combinator, HBR, Lean Startup", marketing: "HubSpot, Google Digital Garage, Kotler", sales: "SPIN Selling, Dale Carnegie", python: "Python Docs, fast.ai", javascript: "MDN, freeCodeCamp", ai: "Andrew Ng, fast.ai, HuggingFace", cybersecurity: "OWASP, NIST", finance: "Investopedia, CFI", crypto: "Ethereum.org, Binance Academy" };
}

function getFallbackLesson(cat: string, sub: string, lvl: number, topic?: string, idx?: number) {
  return { title: topic || `${sub} - Level ${lvl}`, topicId: topic?.toLowerCase().replace(/\s+/g,"-") || `topic-${lvl}`, topicName: topic || `Topic ${lvl}`, orderIndex: idx || lvl, introduction: `Բարի գալուստ:`, keyConcepts: ["Հիմունքներ"], detailedExplanation: `Սա ${sub} թեմայի դաս է:`, examples: ["Օրինակ 1"], exercises: ["Վարժություն 1"], miniSummary: "Ամփոփում:", recommendedReading: [], quiz: [{ question: "Հարց", options: ["A","B","C","D"], correctAnswer: 0 }], practicalTask: { title: "Առաջադրանք", scenario: "", instructions: "", deliverable: "", evaluationCriteria: "" }, game: { title: "Խաղ", scenario: "", player_role: "", steps: [] }, completion: { message: "Շնորհավոր:", total_xp: 100 }, requiredScore: 100 };
}
