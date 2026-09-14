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

async function generateContent(prompt, mimeType, responseSchema) {
  const ai = getClient();
  const config = {};
  if (mimeType) config.responseMimeType = mimeType;
  if (responseSchema) config.responseSchema = responseSchema;
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: Object.keys(config).length ? config : undefined,
  });
  return resp.text || "";
}

const LESSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    introduction: { type: "string" },
    keyConcepts: { type: "array", items: { type: "string" } },
    detailedExplanation: { type: "string" },
    examples: { type: "array", items: { type: "string" } },
    exercises: { type: "array", items: { type: "string" } },
    miniSummary: { type: "string" },
    recommendedReading: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          author: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "author", "description"],
      },
    },
    quiz: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correctAnswer: { type: "integer" },
        },
        required: ["question", "options", "correctAnswer"],
      },
    },
  },
  required: ["title", "introduction", "keyConcepts", "detailedExplanation", "examples", "exercises", "miniSummary", "quiz"],
};

// Pick the literature tier matching the lesson's difficulty level.
function pickLiterature(literature, level) {
  if (!literature) return [];
  const tier = level <= 2 ? "beginner" : level <= 4 ? "intermediate" : "advanced";
  const order = tier === "beginner" ? ["beginner", "intermediate", "advanced"]
    : tier === "intermediate" ? ["intermediate", "beginner", "advanced"]
    : ["advanced", "intermediate", "beginner"];
  for (const t of order) {
    if (Array.isArray(literature[t]) && literature[t].length) return literature[t];
  }
  return [];
}

// Guarantee every field the front-end Lesson type expects is present,
// even if the model's response is incomplete — prevents blank/"hanging" sections.
function normalizeLesson(raw, { subfield, books }) {
  const safe = raw && typeof raw === "object" ? raw : {};
  const fallbackReading = books.slice(0, 2).map(b => ({ title: b.title, author: b.author, description: b.description }));
  return {
    title: safe.title || subfield,
    introduction: safe.introduction || "",
    keyConcepts: Array.isArray(safe.keyConcepts) && safe.keyConcepts.length ? safe.keyConcepts : [],
    detailedExplanation: safe.detailedExplanation || safe.introduction || "",
    examples: Array.isArray(safe.examples) ? safe.examples : [],
    exercises: Array.isArray(safe.exercises) ? safe.exercises : [],
    miniSummary: safe.miniSummary || "",
    recommendedReading: Array.isArray(safe.recommendedReading) && safe.recommendedReading.length ? safe.recommendedReading : fallbackReading,
    quiz: Array.isArray(safe.quiz) && safe.quiz.length ? safe.quiz : [
      {
        question: `Ի՞նչն է ամենակարևորը «${safe.title || subfield}» թեմայում:`,
        options: (safe.keyConcepts && safe.keyConcepts.length >= 4 ? safe.keyConcepts.slice(0, 4) : ["Ա տարբերակ", "Բ տարբերակ", "Գ տարբերակ", "Դ տարբերակ"]),
        correctAnswer: 0,
      },
    ],
  };
}

const PRACTICE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    scenario: { type: "string" },
    role: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          description: { type: "string" },
          question: { type: "string" },
          type: { type: "string" },
          hint: { type: "string" },
          expectedOutcome: { type: "string" },
        },
        required: ["id", "description", "question"],
      },
    },
    xpReward: { type: "integer" },
  },
  required: ["title", "scenario", "role", "steps", "xpReward"],
};

function normalizePractice(raw, { category, subfieldId, subfieldTitle, level }) {
  const safe = raw && typeof raw === "object" ? raw : {};
  const steps = Array.isArray(safe.steps) && safe.steps.length ? safe.steps.map((s, i) => ({
    id: s.id || `s${i + 1}`,
    description: s.description || "",
    question: s.question || "",
    type: s.type || "text",
    hint: s.hint || "",
    expectedOutcome: s.expectedOutcome || "",
  })) : [{
    id: "s1",
    description: `Կիրառեք «${subfieldTitle}» թեմայի հիմնական սկզբունքները գործնական իրավիճակում:`,
    question: "Նկարագրեք ձեր լուծումը:",
    type: "text",
    hint: "",
    expectedOutcome: "",
  }];
  return {
    id: safe.id || `lab-${Date.now()}`,
    title: safe.title || subfieldTitle,
    category: category || "",
    subfieldId: subfieldId || "",
    subfieldTitle: subfieldTitle || "",
    level: level || 1,
    scenario: safe.scenario || `${subfieldTitle} թեմայի շրջանակներում ձեզ հանձնարարված է կատարել գործնական աշխատանք:`,
    role: safe.role || "Մասնագետ",
    steps,
    xpReward: typeof safe.xpReward === "number" ? safe.xpReward : 100,
  };
}

const PROGRESSION_SCHEMA = {
  type: "object",
  properties: {
    messageText: { type: "string" },
  },
  required: ["messageText"],
};

const GOAL_MATCH_SCHEMA = {
  type: "object",
  properties: {
    categoryId: { type: "string" },
    topPathIds: { type: "array", items: { type: "string" } },
    rationale: { type: "string" },
    gapNote: { type: "string" },
  },
  required: ["categoryId", "topPathIds", "rationale"],
};

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
    const { category, subfield, level, currentTopic, literature } = body;
    const books = pickLiterature(literature, level || 1);
    const bookList = books.length
      ? books.map((b, i) => `${i + 1}. «${b.title}» — ${b.author}. ${b.description}`).join("\n")
      : "(հատուկ գրականություն նշված չէ՝ օգտագործիր ոլորտի ամենահեղինակավոր հայտնի աղբյուրները)";

    const prompt = `Դու փորձառու հայ մանկավարժ ես, ստեղծում ես դասընթացի հատված KrtLab կրթական հավելվածի համար։

Ոլորտ: ${category}
Ենթաոլորտ: ${subfield}
Մակարդակ: ${level}
Թեմա: ${currentTopic || subfield}

Հենվիր հետևյալ գրքերի հիմնական գաղափարների վրա (իրական բովանդակություն, ոչ ընդհանրական խոսքեր).
${bookList}

Գրիր ամբողջական, գրագետ, բնական հայերենով (արևելահայերեն) դաս, որը պարունակում է.
- title. կարճ վերնագիր
- introduction. 2-3 նախադասությամբ ներածություն
- keyConcepts. 3-5 հիմնական հասկացություն (կարճ արտահայտություններ)
- detailedExplanation. 4-6 պարբերությամբ մանրամասն, կիրառական բացատրություն, որը փաստացիորեն հենվում է վերևի գրքերի գաղափարների վրա (հիշատակիր գրքի կամ հեղինակի անունը գոնե մեկ անգամ)
- examples. 2-3 կոնկրետ իրական օրինակ
- exercises. 2-3 գործնական վարժություն, որ ուսանողը կարող է անել ինքնուրույն
- miniSummary. 1 նախադասությամբ ամփոփում
- recommendedReading. 1-2 գիրք վերևի ցանկից (title, author, description)
- quiz. ուղիղ 4 բազմակի ընտրանքով հարց (question, options՝ 4 տարբերակ, correctAnswer՝ ճիշտ պատասխանի ինդեքսը 0-3), որոնք ստուգում են հենվածքային նյութի յուրացումը

ՄԻԱՅՆ JSON, ոչ մի այլ տեքստ:`;

    let parsed = null;
    try {
      const text = await generateContent(prompt, "application/json", LESSON_SCHEMA);
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("[generateLessonContent] AI/parse failed:", e.message);
    }
    return normalizeLesson(parsed, { subfield, books });
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
    const { category, subfieldId, subfieldTitle, level, topic } = body;
    const prompt = `Ստեղծիր հայերեն գործնական («practice lab») առաջադրանք KrtLab հավելվածի համար։

Ոլորտ: ${category}
Ենթաոլորտ: ${subfieldTitle}
Մակարդակ: ${level}
Թեմա: ${topic || subfieldTitle}

Պատրաստիր իրական աշխատանքային սցենար, որտեղ սովորողը կիրառում է այս թեմայի գիտելիքները։ Վերադարձրու.
- title. առաջադրանքի կարճ վերնագիր
- scenario. 3-4 նախադասությամբ իրավիճակի նկարագրություն (կոնկրետ, ոչ ընդհանրական)
- role. ինչ դեր ունի սովորողը այս սցենարում (օր. "Մարքեթինգի մասնագետ")
- steps. 2-4 քայլ, յուրաքանչյուրը՝ id, description (ինչ պետք է անել), question (կոնկրետ հարց, որին սովորողը պատասխանում է), type:"text", hint (հուշում), expectedOutcome (ինչ պատասխան է սպասվում)
- xpReward. թիվ 80-150 միջակայքում

ՄԻԱՅՆ JSON:`;
    let parsed = null;
    try {
      const text = await generateContent(prompt, "application/json", PRACTICE_SCHEMA);
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("[generatePracticeLabTask] AI/parse failed:", e.message);
    }
    return normalizePractice(parsed, { category, subfieldId, subfieldTitle, level });
  },

  async generateProgressionFeedback(body) {
    const { input } = body;
    const {
      userName, lessonId, quizScore = 0, practiceScore = 100, mistakes = [],
      currentLevel = 1, maxLevel = 20, topic,
    } = input;

    // Deterministic decision — combines quiz + practice, computed in code so it's always reliable.
    const combinedScore = Math.round((quizScore + practiceScore) / 2);
    const passed = combinedScore >= 80;
    const status = passed ? "level-up" : "same-level";
    const newLevel = passed ? Math.min(currentLevel + 1, maxLevel) : currentLevel;

    const mistakesList = mistakes.length ? mistakes.slice(0, 3).join("; ") : "";
    const prompt = `Դու KrtLab-ի ԱԲ մենթորն ես: ${userName}-ը հենվարժ ավարտել է «${topic || lessonId}» դասը:
Թեստի արդյունք: ${quizScore}%: Գործնական աշխատանքի արդյունք: ${practiceScore}%: Ընդհանուր՝ ${combinedScore}%:
${mistakesList ? `Սխալները եղել են այս հարցերում. ${mistakesList}:` : "Սխալներ գործնականում չեն եղել:"}
Որոշում: ${passed ? "անցնում է հաջորդ մակարդակին" : "մնում է նույն մակարդակում և պետք է կրկնի"}:

Գրիր 2-3 նախադասությամբ ջերմ, կոնկրետ, մոտիվացնող ամփոփում հայերենով՝ ${userName}-ին ուղղված (երկրորդ դեմքով), որը հստակ նշում է վերջնական որոշումը (հաջորդ մակարդակ, թե կրկնություն) և պատճառը: Առանց JSON, պարզ տեքստ:`;

    let messageText = "";
    try {
      messageText = (await generateContent(prompt)).trim();
    } catch (e) {
      console.error("[generateProgressionFeedback] AI failed:", e.message);
    }
    if (!messageText) {
      messageText = passed
        ? `Հիանալի աշխատանք։ Դուք ${combinedScore}% արդյունքով ցուցադրեցիք լավ տիրապետում թեմային և անցնում եք հաջորդ մակարդակին։`
        : `Ընդհանուր արդյունքը ${combinedScore}% է, ինչը դեռ բավարար չէ հաջորդ մակարդակին անցնելու համար։ Խորհուրդ ենք տալիս կրկնել այս դասը և փորձել նորից։`;
    }

    return { userId: input.userId, lessonId, newLevel, status, messageText, audioUrl: "" };
  },

  async analyzeGoalText(body) {
    const { goalText, catalog } = body;
    const list = (catalog || []).map(c => `- pathId:"${c.pathId}" category:"${c.categoryId}" (${c.categoryTitle}) — "${c.pathTitle}": ${c.description} [${c.difficulty}]`).join("\n");

    const prompt = `Դու KrtLab-ի ուսումնական խորհրդատուն ես: Օգտատերը գրել է իր նպատակը իր խոսքերով.
"${goalText}"

Ահա հասանելի ուսումնական ուղիների ԻՐԱԿԱՆ ցանկը (ընտրիր ՄԻԱՅՆ այս ցանկից, երբեք մի հորինիր նոր id).
${list}

Վերադարձրու.
- categoryId. ամենահամապատասխան category-ի id-ն վերևի ցանկից
- topPathIds. 1-3 pathId վերևի ցանկից, որոնք լավագույնս համընկնում են նպատակին, կարևորության կարգով
- rationale. 2-3 նախադասությամբ բացատրիր հայերենով, թե ինչու ընտրեցիր հենց այս ուղին, հենվելով հենվածքային նպատակի ձևակերպման վրա (ոչ ընդհանրական)
- gapNote. եթե ոչ մի ուղի իրականում լավ չի համընկնում նպատակին, մի նախադասությամբ նշիր դա (այլապես թող դատարկ լինի)

ՄԻԱՅՆ JSON:`;

    let parsed = null;
    try {
      const text = await generateContent(prompt, "application/json", GOAL_MATCH_SCHEMA);
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("[analyzeGoalText] AI/parse failed:", e.message);
    }

    // Deterministic guardrail: never trust the model's ids blindly — only accept
    // categoryId/pathIds that actually exist in the catalog we sent it.
    const validCategoryIds = new Set((catalog || []).map(c => c.categoryId));
    const validPathIds = new Set((catalog || []).map(c => c.pathId));
    const categoryId = parsed?.categoryId && validCategoryIds.has(parsed.categoryId) ? parsed.categoryId : null;
    const topPathIds = Array.isArray(parsed?.topPathIds) ? parsed.topPathIds.filter(id => validPathIds.has(id)) : [];

    if (!categoryId) {
      // AI failed or hallucinated — signal the client to fall back to local keyword matching.
      return { categoryId: null, topPathIds: [], rationale: "", gapNote: parsed?.gapNote || "", fallback: true };
    }
    return { categoryId, topPathIds, rationale: parsed?.rationale || "", gapNote: parsed?.gapNote || "", fallback: false };
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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    console.log(`[gemini] Endpoint=${req.query.endpoint}`);
    const endpoint = req.query.endpoint || "chatWithMentor";
    const handler = handlers[endpoint];
    if (!handler) return res.status(404).json({ error: `Unknown endpoint: ${endpoint}` });
    const result = await handler(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[gemini] Error:", err.message);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}