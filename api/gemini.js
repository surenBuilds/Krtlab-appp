// Vercel Serverless Function — Gemini API proxy
// All /api/gemini/* requests rewrite here: /api/gemini?endpoint=chatWithMentor
// GEMINI_API_KEY is read from server-side environment only

import { GoogleGenAI } from "@google/genai";
import firebaseConfig from "../firebase-applet-config.json" with { type: "json" };

const MODEL = "gemini-2.5-flash";

async function verifyFirebaseUser(req) {
  const authorization = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) return null;
  const idToken = authorization.slice(7).trim();
  if (!idToken || idToken.length > 10_000) return null;

  const apiKey = process.env.FIREBASE_API_KEY || firebaseConfig.apiKey;
  if (typeof apiKey !== "string" || !apiKey.trim()) return null;

  let response;
  try {
    response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    // Authentication provider timeout/network failure should fail closed.
    return null;
  }
  if (!response.ok) return null;
  const data = await response.json();
  const user = Array.isArray(data.users) ? data.users[0] : null;
  return user && typeof user.localId === "string" ? user.localId : null;
}

function getClient() {
  const key = process.env.GEMINI_API_KEY || "";
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenAI({ apiKey: key });
}

async function generateContent(prompt, mimeType) {
  const ai = getClient();
  const config = {};
  if (mimeType) config.responseMimeType = mimeType;
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: Object.keys(config).length ? config : undefined,
  });
  return resp.text || "";
}

const handlers = {
  async chatWithMentor(body) {
    const { messages, userName, context } = body;
    const system = `Դու KrtLab-ի ԱԲ մենթորն ես: Խոսում ես ${userName}-ի հետ: Պատասխանիր հայերեն, ընկերական, օգտակար:\n${context || ""}`;
    const conv = messages.map(m => `${m.role === "user" ? "Օգտատեր" : "Մենթոր"}: ${m.text}`).join("\n");
    const text = await generateContent(`${system}\n\n${conv}\nՄենթոր:`);
    return { text };
  },

  async explainQuizMistake(body) {
    const { question, userAnswer, correctAnswer, context } = body;
    const text = await generateContent(`Բացատրիր սխալը հայերեն:\nՀարց:${question}\nՊատ:${userAnswer}\nՃիշտ:${correctAnswer}\n${context || ""}`);
    return { text };
  },

  async generateCertificateOutcomes(body) {
    const { courseName, levelName } = body;
    const text = await generateContent(`Professional learning outcomes in Armenian for "${courseName}" (${levelName}). 3-4 sentences about skills gained.`);
    return { text };
  },

  async generateLessonContent(body) {
    const { category, subfield, level, currentTopic, previousLessons = [], curriculum = [], literature } = body;
    if (typeof subfield !== "string" || !subfield.trim()) {
      throw new Error("A course subject is required");
    }
    const topic = typeof currentTopic === "string" && currentTopic.trim() ? currentTopic.trim() : subfield;
    const previous = Array.isArray(previousLessons) ? previousLessons.filter(item => typeof item === "string").slice(-10) : [];
    const curriculumItems = Array.isArray(curriculum) ? curriculum.filter(item => typeof item === "string").slice(0, 20) : [];
    const prompt = `Դու KrtLab-ի փորձառու ուսումնական ծրագրերի նախագծողն ես։ Ստեղծիր ամբողջական, գործնական և մանկավարժորեն ճիշտ հայերեն դաս։
Ուղղություն՝ ${String(category || "ընդհանուր")}
Դասընթաց՝ ${subfield}
Մակարդակ՝ ${Math.max(1, Math.min(20, Number(level) || 1))}
Թեմա՝ ${topic}
Ուսումնական պլան՝ ${curriculumItems.join("; ") || "Կառուցիր թեմային համապատասխան հաջորդականություն"}
Նախորդ թեմաներ՝ ${previous.join("; ") || "Չկան"}
Առաջարկվող աղբյուրներ՝ ${literature ? JSON.stringify(literature).slice(0, 2500) : "Օգտագործիր հաստատված ընդհանուր գիտելիք, մի հորինիր աղբյուրներ"}
Մի կրկնիր նախորդ թեմաները։ Տեսական մասը պետք է հասկանալի լինի սկսնակին և ներառի իրական կիրառություն։
Վերադարձիր ՄԻԱՅՆ վավեր JSON՝ այս կառուցվածքով.
{
"title":"կարճ և հստակ վերնագիր",
"introduction":"2-4 նախադասությամբ ներածություն և սովորելու նպատակը",
"keyConcepts":["3-6 հիմնական հասկացություն"],
"detailedExplanation":"առնվազն 3 բովանդակալից պարբերություն՝ բացատրություններով և օրինակով",
"examples":["2 կիրառական օրինակ"],
"exercises":["2 ինքնուրույն վարժություն"],
"miniSummary":"կարճ ամփոփում",
"recommendedReading":[{"title":"աղբյուրի վերնագիր","author":"հեղինակ","description":"ինչու է օգտակար"}],
"quiz":[{"question":"հարց","options":["տարբերակ A","տարբերակ B","տարբերակ C","տարբերակ D"],"correctAnswer":0,"explanation":"ճիշտ պատասխանի բացատրություն"}],
"practiceTask":{"id":"practice-1","title":"առաջադրանքի վերնագիր","scenario":"իրատեսական իրավիճակ","context":"համատեքստ","role":"սովորողի դերը","mission":"առաքելություն","constraints":["սահմանափակում"],"instructions":"քայլ առ քայլ հրահանգ","deliverable":"ինչ պետք է ներկայացնել","evaluationCriteria":"գնահատման չափանիշներ"},
"requiredScore":80
}
Ստուգիր, որ correctAnswer-ը options զանգվածի վավեր ինդեքս լինի, և quiz-ը պարունակի առնվազն 3 հարց։ Մի գրիր Markdown code fences։`;
    const text = await generateContent(prompt, "application/json");
    try {
      const lesson = JSON.parse(text);
      if (!lesson || typeof lesson !== "object" || typeof lesson.title !== "string" ||
          typeof lesson.introduction !== "string" || !Array.isArray(lesson.keyConcepts) ||
          typeof lesson.detailedExplanation !== "string" || !Array.isArray(lesson.quiz) ||
          lesson.quiz.length < 3 || !Array.isArray(lesson.examples) || !Array.isArray(lesson.exercises)) {
        throw new Error("Generated lesson did not match the required schema");
      }
      return lesson;
    } catch (error) {
      console.error("[gemini] Invalid lesson response:", error instanceof Error ? error.message : String(error));
      throw new Error("Could not generate a valid lesson. Please try again.");
    }
  },

  async generateLessonAudio(body) {
    const { lessonText } = body;
    return await generateContent(`Convert to spoken Armenian. JSON:{"audioText":"..."}\n${lessonText}`, "application/json");
  },

  async generateSimplerExplanation(body) {
    const { lessonText } = body;
    const text = await generateContent(`Բացատրիր ավելի պարզ հայերենով (5-7 նախադաս.):\n${lessonText}`);
    return { text };
  },

  async askTutorQuestion(body) {
    const { lessonText, question, history } = body;
    const hist = (history || []).map(m => `${m.role}: ${m.text}`).join("\n");
    return await generateContent(`Դաստիարակ: Պատասխանիր հայերեն:\nԴաս:${lessonText}\n${hist}\nՀարց:${question}`);
  },

  async analyzeProgress(body) {
    const { quizScore } = body;
    return { status: quizScore >= 80 ? "pass" : "retry", quizScore };
  },

  async generatePracticeLabTask(body) {
    const { subfieldTitle, level } = body;
    const prompt = `Armenian practice lab task for ${subfieldTitle} (level ${level}). JSON with: id, title, steps (array of {id,description,question,type:"text",hint,expectedOutcome}), xpReward. ONLY JSON:`;
    try {
      const text = await generateContent(prompt, "application/json");
      return JSON.parse(text);
    } catch {
      return { id: "lab-" + Date.now(), title: subfieldTitle, steps: [{ id: "s1", description: "Կատարել", question: "", type: "text", hint: "", expectedOutcome: "" }], xpReward: 100 };
    }
  },

  async generateProgressionFeedback(body) {
    const { input } = body;
    const passed = input.quizScore >= 80;
    const newLevel = passed ? Math.min(input.currentLevel + 1, input.maxLevel) : input.currentLevel;
    const feedbackPrompt = `Դու KrtLab-ի անհատական ուսումնական մենթորն ես։ Գրիր հայերեն 2-4 կարճ նախադասությամբ կոնկրետ և խրախուսող հետադարձ կապ։
Սովորող՝ ${input.userName || "սովորող"}
Դաս՝ ${input.lessonId}
Թեստի արդյունք՝ ${input.quizScore}%
Ժամանակ՝ ${input.timeSpent || "նշված չէ"}
Սխալների թեմաներ՝ ${input.mistakes.join("; ") || "նշված չեն"}
Արդյունք՝ ${passed ? "անցել է շեմը" : "պետք է կրկնի նյութը"}
Ընթացիկ մակարդակ՝ ${input.currentLevel}/${input.maxLevel}
Տուր մեկ կոնկրետ հաջորդ քայլ։ Մի հորինիր արդյունքներ։`;
    const messageText = await generateContent(feedbackPrompt);
    return {
      userId: input.userId,
      lessonId: input.lessonId,
      newLevel,
      status: passed ? (newLevel > input.currentLevel ? "level-up" : "completed") : "same-level",
      messageText,
      audioUrl: "",
    };
  },

  async generateLanguagePlacementTest(body) { return await generateContent(`Placement test for ${body.language}`); },
  async generateLanguageVocabulary(body) {
    try {
      const text = await generateContent(`Generate ${body.count || 20} words for ${body.language} ${body.level}. JSON: [{"word":"...","translation":"..."}] ONLY JSON:`, "application/json");
      return JSON.parse(text);
    } catch { return []; }
  },
  async generateLanguageGrammar(body) { return await generateContent(`Grammar lesson: ${body.language} ${body.level}`); },
  async generateStandaloneGame(body) { return await generateContent(`Educational game for ${body.topic} (${body.domain})`); },
  async extractTermsFromLesson(body) { const lessonContent = typeof body.lessonContent === "string" ? body.lessonContent.slice(0, 12_000) : ""; if (!lessonContent.trim()) throw new Error("Lesson content is required"); return await generateContent(`Extract 5 key terms from this lesson content. Return concise terms with short definitions in Armenian.\\nLESSON:\\n${lessonContent}`, "application/json"); },
};

const MAX_REQUEST_BYTES = 100_000;
const MAX_MENTOR_MESSAGES = 40;
const MAX_MENTOR_MESSAGE_CHARS = 4_000;

export default async function handler(req, res) {
  // The app and API are served from the same origin. Do not enable arbitrary
  // cross-origin browser access to a paid AI endpoint.
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const firebaseUid = await verifyFirebaseUser(req);
    if (!firebaseUid) {
      return res.status(401).json({ error: "Please sign in to use AI features" });
    }

    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ error: "A JSON object body is required" });
    }

    const serializedBody = JSON.stringify(body);
    if (Buffer.byteLength(serializedBody, "utf8") > MAX_REQUEST_BYTES) {
      return res.status(413).json({ error: "Request body is too large" });
    }

    const endpoint = typeof req.query.endpoint === "string" ? req.query.endpoint : "chatWithMentor";
    const selectedHandler = handlers[endpoint];
    if (!selectedHandler) return res.status(404).json({ error: "Unknown endpoint" });

    if (endpoint === "generateProgressionFeedback") {
      const input = body.input;
      if (!input || typeof input !== "object" || Array.isArray(input) || input.userId !== firebaseUid) {
        return res.status(403).json({ error: "Progress feedback must belong to the signed-in user" });
      }
      if (typeof input.lessonId !== "string" || input.lessonId.length < 1 || input.lessonId.length > 200 ||
          typeof input.quizScore !== "number" || !Number.isFinite(input.quizScore) || input.quizScore < 0 || input.quizScore > 100 ||
          typeof input.currentLevel !== "number" || !Number.isInteger(input.currentLevel) || input.currentLevel < 1 || input.currentLevel > 100 ||
          typeof input.maxLevel !== "number" || !Number.isInteger(input.maxLevel) || input.maxLevel < input.currentLevel || input.maxLevel > 100 ||
          (input.userName !== undefined && (typeof input.userName !== "string" || input.userName.length > 80)) ||
          (input.timeSpent !== undefined && (typeof input.timeSpent !== "string" || input.timeSpent.length > 100)) ||
          (input.mistakes !== undefined && (!Array.isArray(input.mistakes) || input.mistakes.length > 20 || input.mistakes.some(item => typeof item !== "string" || item.length > 300)))) {
        return res.status(400).json({ error: "Invalid progression feedback input" });
      }
    }

    if (endpoint === "extractTermsFromLesson" &&
        (typeof body.lessonContent !== "string" || body.lessonContent.trim().length === 0 || body.lessonContent.length > 12_000)) {
      return res.status(400).json({ error: "lessonContent must be a non-empty string of at most 12000 characters" });
    }

    if (endpoint === "chatWithMentor") {
      if (!Array.isArray(body.messages) || body.messages.length > MAX_MENTOR_MESSAGES) {
        return res.status(400).json({ error: `messages must be an array with at most ${MAX_MENTOR_MESSAGES} items` });
      }
      if (typeof body.userName !== "string" || body.userName.trim().length === 0 || body.userName.length > 80) {
        return res.status(400).json({ error: "userName must be a non-empty string of at most 80 characters" });
      }
      const hasInvalidMessage = body.messages.some((message) =>
        !message ||
        typeof message !== "object" ||
        !["user", "ai", "assistant", "model"].includes(message.role) ||
        typeof message.text !== "string" ||
        message.text.length > MAX_MENTOR_MESSAGE_CHARS
      );
      if (hasInvalidMessage) {
        return res.status(400).json({ error: "Each message must have a valid role and text of at most 4000 characters" });
      }
    }

    console.log(`[gemini] Endpoint=${endpoint}`);
    const result = await selectedHandler(body);
    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[gemini] Error:", message);
    return res.status(500).json({ error: "AI request failed" });
  }
}