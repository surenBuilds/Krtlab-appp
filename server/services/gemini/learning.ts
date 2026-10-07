import { LEARNING_SOURCE_CATALOG, getLearningSources } from "../../../src/data/learningSources";
import { getAcademicLiterature, mergeAcademicLiterature } from "../../../src/data/academicLiteratureOverrides";
import { buildSourceGrounding } from "../../../src/data/academicSourceMaterials";
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

  const academicLiterature = getAcademicLiterature(String(category), String(subfield), String(currentTopic || subfield));
  const mergedLiterature = mergeAcademicLiterature(
    String(category),
    String(subfield),
    String(currentTopic || subfield),
    literature
  );
  const sources = getLearningSources(category, subfield);
  const sourceGrounding = buildSourceGrounding(category, subfield, String(currentTopic || subfield), mergedLiterature);
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

ACADEMIC LITERATURE — PRIORITIZE THESE:
${JSON.stringify(academicLiterature)}

MERGED LITERATURE CATALOG:
${JSON.stringify(mergedLiterature)}

RECOMMENDED UNIVERSITY / PROFESSIONAL SOURCES:
${sources}

RECENT LESSONS:
${previousText || "None"}

QUALITY RULES:
1. Teach one clearly bounded learning objective at this level.
2. Progress from prerequisite knowledge to application; never assume mastery of later concepts.
3. Use precise terminology and concrete examples appropriate to the domain.
4. Treat the supplied academic literature as the knowledge foundation. Do not invent book titles, authors, universities, citations, statistics, standards, laws, URLs, or named frameworks.
5. Prefer works written by established university researchers/professors and primary academic sources where appropriate. Do not imply a professor affiliation unless it is explicitly supplied in the catalog.\n6. The lesson must be constructed from the supplied source materials and their grounding notes, not merely mention the books. Use the academic books as the scholarly reference layer and the open/official materials as the accessible evidence layer.\n7. Do not fabricate chapter numbers or pretend to have read a copyrighted book whose text is not supplied. For each core concept, provide a sourceReference pointing to the supplied source material.
8. Do not repeat previous lessons except for deliberate prerequisite review.
9. Exercises must test the stated objective. Practical work must produce a verifiable deliverable.
10. Quiz must test understanding and application, not only recall. Include exactly 5 questions with 4 options each and one correct answer index.
11. Include an evaluation rubric with observable criteria.
12. Set requiredScore between 70 and 85; do not mark a learner as mastered from lesson completion alone.
13. All learner-facing content must be in Armenian. Technical terms may include their standard English term in parentheses.
14. recommendedReading MUST contain 3–6 books from the supplied academic literature, matched to this lesson's topic. Do not invent additional books.
15. Return valid JSON only.

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
  "knowledgeFoundation": [{"sourceId":"...","title":"...","provider":"...","url":"...","basis":"open-material","sections":[]}],
  "sourceReferences": [{"sourceId":"...","title":"...","provider":"...","url":"...","basis":"open-material","sections":[]}],
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
    return normalizeLesson(parsed, category, subfield, level, currentTopic, topicIndex, mergedLiterature);
  } catch {
    return getFallbackLesson(category, subfield, level, currentTopic, topicIndex, mergedLiterature);
  }
}

function normalizeLesson(
  lesson: any,
  category: string,
  subfield: string,
  level: number,
  topic?: string,
  idx?: number,
  literature?: any
) {
  const rawQuiz = Array.isArray(lesson.quiz) ? lesson.quiz : [];
  const quiz = rawQuiz.map((q: any) => {
    if (!q || typeof q.question !== "string" || !Array.isArray(q.options) || q.options.length !== 4) return null;

    // Gemini can occasionally serialize the correct option as a string or under a
    // slightly different JSON key. Normalize it before the UI receives the lesson.
    let correctAnswer = Number.isInteger(q.correctAnswer) ? q.correctAnswer : null;
    if (correctAnswer === null && Number.isInteger(q.correct_answer)) correctAnswer = q.correct_answer;
    if (correctAnswer === null && Number.isInteger(q.answerIndex)) correctAnswer = q.answerIndex;

    if (correctAnswer === null && typeof q.correctAnswer === "string") {
      const numeric = Number(q.correctAnswer);
      if (Number.isInteger(numeric)) correctAnswer = numeric;
      else {
        const idx = q.options.findIndex((option: string) => option.trim() === q.correctAnswer.trim());
        if (idx >= 0) correctAnswer = idx;
      }
    }

    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= 4) return null;

    return {
      question: q.question.trim(),
      options: q.options.map((option: any) => String(option)),
      correctAnswer,
      ...(typeof q.explanation === "string" ? { explanation: q.explanation } : {})
    };
  }).filter(Boolean).slice(0, 5);

  const allowedBooks = [
    ...(literature?.beginner || []),
    ...(literature?.intermediate || []),
    ...(literature?.advanced || [])
  ];
  const allowedKeys = new Set(allowedBooks.map((b: any) => `${b.title}::${b.author}`.toLowerCase()));
  const aiReading = Array.isArray(lesson.recommendedReading)
    ? lesson.recommendedReading.filter((b: any) =>
        b && typeof b.title === "string" && typeof b.author === "string" &&
        allowedKeys.has(`${b.title}::${b.author}`.toLowerCase())
      )
    : [];
  // A generated lesson without a complete quiz is not considered valid.
  // The client cache layer will also invalidate such lessons and request a fresh one.
  const fallbackReading = allowedBooks.slice(0, 6);
  const recommendedReading = [...aiReading, ...fallbackReading].filter((book, index, arr) =>
    arr.findIndex(b => `${b.title}::${b.author}`.toLowerCase() === `${book.title}::${book.author}`.toLowerCase()) === index
  ).slice(0, 6);

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
    recommendedReading,
    knowledgeFoundation: Array.isArray(lesson.knowledgeFoundation) ? lesson.knowledgeFoundation : [],
    sourceReferences: Array.isArray(lesson.sourceReferences) ? lesson.sourceReferences : [],
    quiz,
    practicalTask: lesson.practicalTask || { title: "Գործնական առաջադրանք", scenario: "", instructions: [], deliverable: "", evaluationCriteria: [] },
    assessmentRubric: Array.isArray(lesson.assessmentRubric) ? lesson.assessmentRubric : [],
    commonMistakes: Array.isArray(lesson.commonMistakes) ? lesson.commonMistakes : [],
    requiredScore: Math.min(85, Math.max(70, Number(lesson.requiredScore) || 80)),
  };
}

function getFallbackLesson(cat: string, sub: string, lvl: number, topic?: string, idx?: number, literature?: any) {
  const books = [
    ...(literature?.beginner || []),
    ...(literature?.intermediate || []),
    ...(literature?.advanced || [])
  ].slice(0, 6);
  return {
    title: topic || `${sub} - Level ${lvl}`,
    topicId: topic?.toLowerCase().replace(/\s+/g,"-") || `topic-${lvl}`,
    topicName: topic || `Topic ${lvl}`,
    orderIndex: idx || lvl,
    introduction: `Բարի գալուստ ${sub} ոլորտի դասընթաց:`,
    keyConcepts: ["Հիմունքներ"],
    detailedExplanation: `Սա ${sub} թեմայի դաս է:`,
    examples: ["Օրինակ 1"],
    exercises: ["Վարժություն 1"],
    miniSummary: "Ամփոփում:",
    recommendedReading: books,
    knowledgeFoundation: [],
    sourceReferences: [],
    quiz: [{ question: "Հարց", options: ["A","B","C","D"], correctAnswer: 0 }],
    practicalTask: { title: "Առաջադրանք", scenario: "", instructions: "", deliverable: "", evaluationCriteria: "" },
    game: { title: "Խաղ", scenario: "", player_role: "", steps: [] },
    completion: { message: "Շնորհավոր:", total_xp: 100 },
    requiredScore: 100
  };
}
