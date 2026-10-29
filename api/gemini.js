// Vercel Serverless Function — Gemini API proxy
// All /api/gemini/* requests rewrite here: /api/gemini?endpoint=chatWithMentor
// GEMINI_API_KEY is read from server-side environment only

import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

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
    const { category, subfield, level, currentTopic } = body;
    const prompt = `Ստեղծիր հայերեն դաս "${subfield}" (մակ.${level}): Թեմա: ${currentTopic || subfield}. JSON: {"title":"...","introduction":"...","keyConcepts":["..."],"miniSummary":"..."}. ՄԻԱՅՆ JSON:`;
    const text = await generateContent(prompt, "application/json");
    try { return JSON.parse(text); }
    catch { return { title: subfield, introduction: "", keyConcepts: [], miniSummary: "" }; }
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
    return { userId: input.userId, lessonId: input.lessonId, newLevel: input.quizScore >= 80 ? Math.min(input.currentLevel + 1, input.maxLevel) : input.currentLevel, status: input.quizScore >= 80 ? "level-up" : "same-level", messageText: "Շարունակեք:", audioUrl: "" };
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
  async extractTermsFromLesson(body) { return await generateContent(`Extract 5 key terms from this lesson content`); },
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
        !["user", "assistant", "model"].includes(message.role) ||
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