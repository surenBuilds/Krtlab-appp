import { getAIClient, TEXT_MODEL } from "../../utils/aiClient";
import { withRetry, safeParseJSON } from "../../utils/helpers";
const ai = () => getAIClient();

export async function generateLanguagePlacementTest(language: string) {
  const r = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Create 10-question ${language} placement test. JSON: {language,title,description,questions[{id,question,options[],correctAnswer,difficulty,topic}]}. ONLY JSON.`, config: { responseMimeType: "application/json" } }));
  return safeParseJSON(r.text||"{}", { language, title: `${language} Test`, description: "", questions: [] });
}

export async function generateLanguageVocabulary(language: string, level: string, count: number = 20) {
  const r = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Generate ${count} ${language} vocabulary words at ${level} level. JSON: {language,level,words[{id,word,translation,definition,example,exampleTranslation,partOfSpeech,difficulty}]}. ONLY JSON.`, config: { responseMimeType: "application/json" } }));
  return safeParseJSON(r.text||"{}", { language, level, words: [] });
}

export async function generateLanguageGrammar(language: string, level: string) {
  const r = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Generate ${language} grammar lesson at ${level} level. JSON: {language,level,topic,explanation,rules[],examples[{sentence,translation}],commonMistakes[{mistake,correction,explanation}],practiceExercises[{sentence,answer,hint}]}. ONLY JSON.`, config: { responseMimeType: "application/json" } }));
  return safeParseJSON(r.text||"{}", { language, level, topic: "", explanation: "", rules: [], examples: [], commonMistakes: [], practiceExercises: [] });
}
