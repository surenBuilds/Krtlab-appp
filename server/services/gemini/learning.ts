import { LEARNING_SOURCE_CATALOG, getLearningSources } from "../../../src/data/learningSources";
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
  const {
    category, subfield, level, literature, previousLessons = [], currentTopic, topicIndex, curriculum = []
  } = params;

  const sources = getLearningSources(category, subfield);
  const phase = level <= 4 ? "Foundation" : level <= 8 ? "Core concepts" : level <= 12 ? "Applied practice" : level <= 16 ? "Advanced application" : "Integration and capstone";
  const curriculumText = curriculum.length ? curriculum.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n") : currentTopic || subfield;
  const previousText = previousLessons.slice(-4).map((x: string, i: number) => `${i + 1}. ${x}`).join("\n");

  const prompt = `You are KrtLab's professional curriculum engine. Design a rigorous, skill-based lesson, not generic motivational content.

DOMAIN: ${category}
SUBFIELD: ${subfield}
LEVEL: ${level}/20
PHASE: ${phase}
CURRENT TOPIC: ${currentTopic || subfield}
TOPIC INDEX: ${topicIndex ?? level - 1}

COURSE CURRICULUM:
${curriculumText}

RECOMMENDED SOURCES:
${sources}

RECOMMENDED LITERATURE:
${JSON.stringify(literature || {})}

RECENT LESSONS:
${previousText || "None"}

QUALITY RULES:
1. Teach one clearly bounded learning objective at this level.
2. Progress from prerequisite knowledge to application; never assume mastery of later concepts.
3. Use precise terminology and concrete examples appropriate to the domain.
4. Do not invent facts, statistics, standards, laws, citations, URLs, book details, or named frameworks. If a claim cannot be supported by the supplied sources or established knowledge, omit it or mark it as an example/assumption.
5. Do not repeat previous lessons except for deliberate prerequisite review.
6. Exercises must test the stated objective. Practical work must produce a verifiable deliverable.
7. Quiz must test understanding and application, not only recall. Include exactly 5 questions with 4 options each and one correct answer index.
8. Include an evaluation rubric with observable criteria.
9. Set requiredScore between 70 and 85; do not mark a learner as mastered from lesson completion alone.
10. All learner-facing content must be in Armenian. Technical terms may include their standard English term in parentheses.
11. Return valid JSON only.

Return this exact structure:
{
  "title": "...",
  "topicId": "...",
  "topicName": "...",
  "orderIndex": ${level},
  "phase": "${phase}",
  "learningObjectives": ["..."],
  "prerequisites": ["..."],
  "introduction": "...",
  "keyConcepts": ["..."],
  "detailedExplanation": "...",
  "examples": ["..."],
  "exercises": ["..."],
  "miniSummary": "...",
  "recommendedReading": [],
  "quiz": [{"question":"...","options":["...","...","...","..."],"correctAnswer":0,"explanation":"..."}],
  "practicalTask": {"title":"...","scenario":"...","instructions":["..."],"deliverable":"...","evaluationCriteria":["..."]},
  "assessmentRubric": [{"criterion":"...","weight":25,"masteryEvidence":"..."}],
  "commonMistakes": ["..."],
  "completion": {"message":"...","total_xp":100},
  "requiredScore": 80
}`;

  const response = await withRetry(() => ai().models.generateContent({
    model: TEXT_MODEL,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  }));

  try {
    const parsed = JSON.parse(response.text || "{}");
    return normalizeLesson(parsed, category, subfield, level, currentTopic, topicIndex);
  } catch {
    return getFallbackLesson(category, subfield, level, currentTopic, topicIndex);
  }
}

function normalizeLesson(lesson: any, category: string, subfield: string, level: number, topic?: string, idx?: number) {
  const quiz = Array.isArray(lesson.quiz) ? lesson.quiz.filter((q: any) =>
    q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4 &&
    Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < 4
  ).slice(0, 5) : [];

  return {
    ...lesson,
    title: lesson.title || topic || `${subfield} — Level ${level}`,
    topicId: lesson.topicId || `${subfield}-${level}`,
    topicName: lesson.topicName || topic || subfield,
    orderIndex: level,
    phase: lesson.phase || (level <= 4 ? "Foundation" : level <= 8 ? "Core concepts" : level <= 12 ? "Applied practice" : level <= 16 ? "Advanced application" : "Integration and capstone"),
    learningObjectives: Array.isArray(lesson.learningObjectives) ? lesson.learningObjectives.slice(0, 4) : [],
    prerequisites: Array.isArray(lesson.prerequisites) ? lesson.prerequisites : [],
    keyConcepts: Array.isArray(lesson.keyConcepts) ? lesson.keyConcepts : [],
    examples: Array.isArray(lesson.examples) ? lesson.examples : [],
    exercises: Array.isArray(lesson.exercises) ? lesson.exercises : [],
    recommendedReading: Array.isArray(lesson.recommendedReading) ? lesson.recommendedReading : [],
    quiz,
    practicalTask: lesson.practicalTask || { title: "Գործնական առաջադրանք", scenario: "", instructions: [], deliverable: "", evaluationCriteria: [] },
    assessmentRubric: Array.isArray(lesson.assessmentRubric) ? lesson.assessmentRubric : [],
    commonMistakes: Array.isArray(lesson.commonMistakes) ? lesson.commonMistakes : [],
    requiredScore: Math.min(85, Math.max(70, Number(lesson.requiredScore) || 80)),
  };
}

function getSourceMap(): Record<string, string> {
  return { entrepreneurship: "Y Combinator, HBR, Lean Startup", marketing: "HubSpot, Google Digital Garage, Kotler", sales: "SPIN Selling, Dale Carnegie", python: "Python Docs, fast.ai", javascript: "MDN, freeCodeCamp", ai: "Andrew Ng, fast.ai, HuggingFace", cybersecurity: "OWASP, NIST", finance: "Investopedia, CFI", crypto: "Ethereum.org, Binance Academy" };
}

function getFallbackLesson(cat: string, sub: string, lvl: number, topic?: string, idx?: number) {
  return { title: topic || `${sub} - Level ${lvl}`, topicId: topic?.toLowerCase().replace(/\s+/g,"-") || `topic-${lvl}`, topicName: topic || `Topic ${lvl}`, orderIndex: idx || lvl, introduction: `Բարի գալուստ:`, keyConcepts: ["Հիմունքներ"], detailedExplanation: `Սա ${sub} թեմայի դաս է:`, examples: ["Օրինակ 1"], exercises: ["Վարժություն 1"], miniSummary: "Ամփոփում:", recommendedReading: [], quiz: [{ question: "Հարց", options: ["A","B","C","D"], correctAnswer: 0 }], practicalTask: { title: "Առաջադրանք", scenario: "", instructions: "", deliverable: "", evaluationCriteria: "" }, game: { title: "Խաղ", scenario: "", player_role: "", steps: [] }, completion: { message: "Շնորհավոր:", total_xp: 100 }, requiredScore: 100 };
}
