import { getAIClient, TEXT_MODEL } from "../../utils/aiClient";
import { withRetry } from "../../utils/helpers";
import { validateAIResponse } from "../../utils/validateAIResponse";
import { ExtractTermsResponseSchema } from "../../schemas/aiResponses";
const ai = () => getAIClient();

export async function generateCertificateOutcomes(courseName: string, levelName: string): Promise<string> {
  const r = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Generate professional learning outcomes summary in Armenian for certificate: Course="${courseName}", Level="${levelName}". 3-5 sentences. Text only, no JSON.` }));
  return r.text || `Շնորհավորում ենք ${courseName}-ի ${levelName} մակարդակը ավարտելու կապակցությամբ:`;
}

export async function extractTermsFromLesson(lessonContent: string) {
  const r = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Extract 8-12 key terms from: ${lessonContent.slice(0,5000)}. JSON: {terms:[{term,definition,category,difficulty}]}. Armenian. ONLY JSON.`, config: { responseMimeType: "application/json" } }));
  const fallback = { terms: [] };
  const result = validateAIResponse(r.text, ExtractTermsResponseSchema);
  if (!result.success) {
    console.warn(`[extractTermsFromLesson] ${result.errorType}: ${result.message}`);
    return fallback;
  }
  return result.data;
}
