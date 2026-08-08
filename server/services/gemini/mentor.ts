import { getAIClient, TEXT_MODEL } from "../../utils/aiClient";
import { withRetry, safeParseJSON } from "../../utils/helpers";

const ai = () => getAIClient();

export async function chatWithMentor(messages: { role: string; text: string }[], userName: string, context?: string): Promise<string> {
  const systemPrompt = `Դու KrtLab-ի ԱԲ մենթորն ես: Խոսում ես ${userName}-ի հետ: Պատասխանիր հայերեն, ընկերական: ${context ? `\nՕԳՏԱՏԵՐԻ ՀԱՄԱՏԵՔՍՏ:\n${context}` : ""}`;
  const fullPrompt = `${systemPrompt}\n\n${messages.map(m => `${m.role === 'user' ? 'Օգտատեր' : 'Մենթոր'}: ${m.text}`).join("\n")}\nՄենթոր:`;
  const response = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: fullPrompt }));
  return response.text || "Ներողություն, չհաջողվեց:";
}

export async function generateProgressionFeedback(input: any) {
  const prompt = `Վերլուծիր: Դաս ${input.lessonId}, Թեստ ${input.quizScore}%, Ժամանակ ${input.timeSpent}, Մակարդակ ${input.currentLevel}/${input.maxLevel}. JSON: {status:"level-up"|"same-level"|"repeat-lesson",newLevel:number,messageText:string}. ՄԻԱՅՆ JSON:`;
  const response = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: prompt, config: { responseMimeType: "application/json" } }));
  const result = safeParseJSON(response.text || "{}", { status: input.quizScore >= 80 ? 'level-up' : 'same-level', newLevel: input.currentLevel, messageText: "Շարունակեք:" });
  return { userId: input.userId, lessonId: input.lessonId, newLevel: Math.min(result.newLevel, input.maxLevel), status: result.status, messageText: result.messageText };
}

export async function explainQuizMistake(question: string, userAnswer: string, correctAnswer: string, context?: string): Promise<string> {
  const prompt = `Բացատրիր սխալը հայերեն:\nՀարց: ${question}\nՊատասխան: ${userAnswer}\nՃիշտ: ${correctAnswer}\n${context ? `Համատեքստ: ${context}` : ""}`;
  const response = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: prompt }));
  return response.text || "Ճիշտ պատասխանը տարբերվում է:";
}
