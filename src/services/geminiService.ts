import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CATEGORIES } from "../data/categories";
import { RecommendedLiterature, PracticeLabTask } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export function isQuotaError(error: any): boolean {
  if (!error) return false;
  
  const errorStr = JSON.stringify(error).toLowerCase();
  const message = String(error?.message || error?.error?.message || "").toLowerCase();
  const status = String(error?.status || error?.error?.status || "").toLowerCase();
  const code = error?.code || error?.error?.code || error?.error?.error?.code;

  return (
    status === "resource_exhausted" || 
    status === "429" ||
    status === "unknown" ||
    status === "internal" ||
    status === "unavailable" ||
    code === 429 ||
    code === 500 ||
    code === 503 ||
    code === 504 ||
    message.includes("429") ||
    message.includes("500") ||
    message.includes("quota") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit") ||
    message.includes("xhr error") ||
    message.includes("internal error") ||
    errorStr.includes("429") ||
    errorStr.includes("500") ||
    errorStr.includes("resource_exhausted") ||
    errorStr.includes("quota exceeded") ||
    errorStr.includes("xhr error") ||
    errorStr.includes("error code: 6")
  );
}

export async function generateLessonAudio(lessonText: string) {
  const explanationPrompt = `Դու KirtLab-ի ուսումնական օգնական ԱԲ-ն ես: Քո խնդիրն է կարդալ դասը հստակ, ամբողջական և հաստատուն տեմպով:
  
  Կանոններ:
  - Կարդա դասը ԱՄԲՈՂՋՈՒԹՅԱՄԲ, առանց որևէ հատված բաց թողնելու:
  - Խոսիր հստակ և հասկանալի:
  - Պահպանիր հաստատուն տեմպ՝ առանց ընդհատումների կամ սխալների:
  - Կատարիր կարճ դադարներ միայն նախադասությունների բնական ավարտին, խուսափիր երկար դադարներից:
  - Ապահովիր ճիշտ արտասանություն և ինտոնացիա, որպեսզի դասը հեշտ լինի ընկալել:
  - Ոճը պետք է լինի պրոֆեսիոնալ, բայց ընկերական:
  
  Դասի տեքստ:
  ${lessonText}`;

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      // 1. Generate the spoken explanation text in Armenian
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: explanationPrompt,
      });

      const explanationText = textResponse.text;
      if (!explanationText) throw new Error("Failed to generate explanation text");

      // 2. Convert text to audio using TTS
      const audioResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: explanationText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("Failed to generate audio data");

      return { audio: base64Audio, text: explanationText };
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in generateLessonAudio. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error in generateLessonAudio:", error);
      throw error;
    }
  }
  throw new Error("Failed to generate audio after retries");
}

export async function generateSimplerExplanation(lessonText: string) {
  const prompt = `Դու հմուտ և ընկերական ուսուցիչ ես: Բացատրիր հետևյալ թեման ԱՎԵԼԻ ՊԱՐԶ, քան նախորդ անգամ:
  Օգտագործիր շատ պարզ բառեր, կարճ նախադասություններ և շատ հասկանալի օրինակ:
  
  Թեմա:
  ${lessonText}`;

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const explanationText = textResponse.text;
      if (!explanationText) throw new Error("Failed to generate explanation text");

      const audioResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: explanationText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return { audio: base64Audio, text: explanationText };
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in generateSimplerExplanation. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error in generateSimplerExplanation:", error);
      throw error;
    }
  }
  throw new Error("Failed to generate simpler explanation after retries");
}

export async function askTutorQuestion(lessonText: string, question: string, history: {role: string, text: string}[]) {
  const prompt = `Դու օգնող և ընկերական ուսուցիչ ես, ով պատասխանում է ուսանողի հարցին:
  
  Կանոններ:
  - Պարզ բացատրություն
  - Կարճ նախադասություններ
  - Խոսակցական տոն
  - Եթե հարցը բարդ է, պարզեցրու
  - Տուր 1 օրինակ
  
  Համատեքստ (Դասի տեքստ):
  ${lessonText}
  
  Խոսակցության պատմություն:
  ${JSON.stringify(history)}
  
  Հարց:
  ${question}`;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const answerText = textResponse.text;
      if (!answerText) throw new Error("Failed to generate answer text");

      const audioResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: answerText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return { audio: base64Audio, text: answerText };
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in askTutorQuestion. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error in askTutorQuestion:", error);
      throw error;
    }
  }
  throw new Error("Failed to get answer after retries");
}

export async function analyzeProgress(lessonId: string, quizScore: number, mistakes: string[], questionsAsked: number) {
  const prompt = `Դու ԱԲ ուսումնական համակարգ ես: Վերլուծիր ուսանողի կատարողականը և որոշիր հաջորդ քայլերը:
  
  Տվյալներ:
  - Դասի ID: ${lessonId}
  - Թեստի արդյունք: ${quizScore}%
  - Սխալներ: ${mistakes.join(', ')}
  - Տրված հարցերի քանակ: ${questionsAsked}
  
  Վերադարձրու JSON հետևյալ դաշտերով:
  - level: "low" | "medium" | "high" (ըմբռնման մակարդակ)
  - weakPoints: string[] (թույլ կողմեր)
  - recommendation: string (խորհուրդ հայերենով)
  - nextLessonType: "easy" | "same" | "harder" (հաջորդ դասի տեսակը)
  
  Վերադարձրու ՄԻԱՅՆ JSON:`;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      let text = response.text || "{}";
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }
      
      return JSON.parse(text);
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in analyzeProgress. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error analyzing progress:", error);
      return null;
    }
  }
  return null;
}

const SOURCE_MAP: Record<string, string> = {
  "entrepreneurship": "Y Combinator Startup School, Harvard Business Review (HBR), Paul Graham Essays, 'The Lean Startup' by Eric Ries",
  "marketing": "HubSpot Academy, Google Digital Garage, Philip Kotler's Marketing Principles, Neil Patel",
  "sales": "Neil Rackham (SPIN Selling), Dale Carnegie, HubSpot Sales Blog",
  "strategy": "McKinsey Insights, Harvard Business Review Strategy section",
  "finance": "Investopedia, Corporate Finance Institute (CFI), Khan Academy Finance",
  "crypto": "Ethereum.org documentation, Binance Academy, Bitcoin Whitepaper (Satoshi Nakamoto)",
  "python": "Python Official Docs, fast.ai, Real Python",
  "javascript": "JavaScript.info, MDN Web Docs, freeCodeCamp",
  "web-development": "MDN Web Docs, freeCodeCamp, W3C Standards",
  "ai": "Andrew Ng's Machine Learning (Coursera), fast.ai, HuggingFace Documentation",
  "cybersecurity": "OWASP Top 10, Cisco Networking Academy, NIST Cybersecurity Framework",
  "math": "Khan Academy, MIT OpenCourseWare, Paul's Online Math Notes",
  "physics": "HyperPhysics, MIT OpenCourseWare Physics, Khan Academy Physics",
  "chemistry": "LibreTexts Chemistry, Khan Academy Chemistry",
  "biology": "OpenStax Biology, Nature Education",
  "history": "Britannica, CrashCourse History, Stanford History Resources",
  "psychology": "APA resources, VeryWellMind, Psychology Today",
  "law": "Cornell Legal Information Institute, UN Legal Resources, European Court of Human Rights documentation",
  "creative": "Adobe Learn, Behance, Blender Documentation",
  "languages": "Duolingo Methodologies, BBC Languages, Cambridge English Resources"
};

export async function generatePracticeLabTask(
  category: string,
  subfieldId: string,
  subfieldTitle: string,
  level: number,
  topic?: string
): Promise<PracticeLabTask | null> {
  const prompt = `
Դու KertLab-ի Պրակտիկ Լաբորատորիայի Ճարտարապետն ես: Քո նպատակն է ստեղծել բարձրորակ, գործնական և ինտերակտիվ ուսումնական առաջադրանք:

Գեներացրու ԴԻՆԱՄԻԿ Պրակտիկ Առաջադրանք (Practice Lab Task) հետևյալի համար.
- Կատեգորիա: ${category}
- Ենթաոլորտ: ${subfieldTitle}
- Մակարդակ: ${level}/20
- Թեմա: ${topic || 'Ընդհանուր կիրառություն'}

ՄԱԿԱՐԴԱԿԻ ՈՒՆԵՑՎԱԾՔ:
- 1–5: Հիմնական հասկացությունների կիրառում
- 6–10: Կիրառական իրավիճակներ և դեպքերի ուսումնասիրություն
- 11–15: Առաջադեմ համակարգեր և կրիտիկական վերլուծություն
- 16–20: Փորձագիտական սիմուլյացիա և ռազմավարական վարպետություն

ԽԻՍՏ ԿԱՆՈՆՆԵՐ:
1. ՍՑԵՆԱՐ (Scenario): Պետք է լինի իրական կյանքից վերցված, աշխատանքային կամ բարձր պատասխանատվություն պահանջող գործնական իրավիճակ:
2. ԱՌԱՔԵԼՈՒԹՅՈՒՆ (Mission): Օգտատերը պետք է կառուցի, վերանորոգի կամ կայացնի որոշում կարևոր խնդրի շուրջ:
3. ԻՆՏԵՐԱԿՏԻՎ ՔԱՅԼԵՐ: Ստեղծիր 3-5 հաջորդական քայլեր:
4. ՀՈՒՇՈՒՄՆԵՐ: Յուրաքանչյուր քայլ ՊԵՏՔ Է ունենա մանկավարժական հուշում, որը կուղղորդի օգտատիրոջը՝ առանց պատասխանը բացահայտելու:
5. ՏԵՍԱԿՆԵՐ: Օգտագործիր 'choice' (ընտրություն), 'calculation' (հաշվարկ) կամ 'text' (ազատ տեքստ) քայլերի համար:
6. ԼԵԶՈՒ: ԲՈԼՈՐ դաշտերը (title, scenario, role, description, question, hint) պետք է լինեն բացառապես ՀԱՅԵՐԵՆ (Armenian):

JSON ԿԱՌՈՒՑՎԱԾՔ:
{
  "id": "lab-task-id",
  "title": "Պրոֆեսիոնալ առաջադրանքի վերնագիր",
  "category": "${category}",
  "subfieldId": "${subfieldId}",
  "subfieldTitle": "${subfieldTitle}",
  "level": ${level},
  "scenario": "Իրավիճակի խորը նկարագրություն",
  "role": "Օգտատիրոջ մասնագիտական դերը",
  "steps": [
    {
      "id": "step-1",
      "description": "Այս քայլի համատեքստը",
      "question": "Կոնկրետ ի՞նչ պետք է արվի կամ պատասխանվի",
      "type": "choice | text | calculation",
      "options": ["Եթե տեսակը choice է"],
      "hint": "Ուղղորդող հուշում",
      "expectedOutcome": "Ճիշտ պատասխանը կամ տրամաբանական ստուգումը"
    }
  ],
  "xpReward": ${25 + level * 5}
}
  `;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              subfieldId: { type: Type.STRING },
              subfieldTitle: { type: Type.STRING },
              level: { type: Type.INTEGER },
              scenario: { type: Type.STRING },
              role: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    description: { type: Type.STRING },
                    question: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["text", "choice", "calculation"] },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    hint: { type: Type.STRING },
                    expectedOutcome: { type: Type.STRING }
                  },
                  required: ["id", "description", "question", "type", "hint", "expectedOutcome"]
                }
              },
              xpReward: { type: Type.INTEGER }
            },
            required: ["id", "title", "category", "subfieldId", "subfieldTitle", "level", "scenario", "role", "steps", "xpReward"]
          }
        }
      });

      let text = response.text || "{}";
      return JSON.parse(text);
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          continue;
        }
      }
      console.error("Error generating lab task:", error);
      return null;
    }
  }
  return null;
}
export async function generateLessonContent(
  category: string, 
  subfield: string, 
  level: number, 
  literature?: RecommendedLiterature,
  previousLessons: string[] = [],
  currentTopic?: string,
  topicIndex?: number
) {
  const sources = SOURCE_MAP[subfield] || SOURCE_MAP[category.toLowerCase()] || "Academic standards and primary research papers";
  
  const litContext = literature ? `
  ACADEMIC CURRICULUM STANDARDS (Oxford, Cambridge, Harvard Level):
  - Beginner: ${literature.beginner.map(b => `${b.title} by ${b.author} - ${b.description}`).join('; ')}
  - Intermediate: ${literature.intermediate.map(b => `${b.title} by ${b.author} - ${b.description}`).join('; ')}
  - Advanced: ${literature.advanced.map(b => `${b.title} by ${b.author} - ${b.description}`).join('; ')}
  
  STRICT KNOWLEDGE SOURCES:
  Use insights and frameworks from: ${sources}.
  
  INSTRUCTIONS:
  - Base the lesson explanation on these foundational academic texts and specialized sources.
  - Maintain absolute academic accuracy while using simplified, student-friendly language.
  - Follow the structure of a professional educational unit.
  ` : '';

  const topicContext = currentTopic ? `
  STRICT TOPIC FOCUS:
  The specific topic for this lesson is: "${currentTopic}" (Level ${level}/20).
  - YOU MUST strictly teach this topic and only this topic.
  - Progression: Ensure this fits into a 20-level curriculum from Beginner to Expert.
  ` : '';

  const memoryContext = previousLessons.length > 0 ? `
  NON-REPETITIVE KNOWLEDGE MAP (Taught Topics & Concepts):
  ${previousLessons.join('\n')}
  
  RULES:
  - NEVER repeat lessons or concepts already covered.
  - Synthesize knowledge; do NOT copy text directly from sources.
  - Introduce 1–3 new concepts in this level.
  ` : '';

  const prompt = `
You are the KertLab Learning Engine, a professional Curriculum Designer and Learning Experience (LX) Architect.
Your task is to generate Level #${level} of a comprehensive 20-level course for the specified field.

CURRENT CONTEXT:
- Category: ${category}
- Subfield: ${subfield}
- Level: ${level} (Path: 1-5 Basic, 6-10 Application, 11-15 Advanced, 16-20 Expert)
- Topic: ${currentTopic || 'Sequential Progress'}

${litContext}
${topicContext}
${memoryContext}

STRICT CURRICULUM PROGRESSION RULE:
- Levels 1–5: Basic understanding and terminology.
- Levels 6–10: Application and case studies.
- Levels 11–15: Advanced systems and critical analysis.
- Levels 16–20: Expert simulation and strategic mastery.

SCENARIO PATTERN SYSTEM (Reference for Practical Tasks):
- BUSINESS: Startup launching, Marketing campaigns, Sales negotiations, Team hiring, Problem solving.
- FINANCE: Budget planning, Investment decisions, Risk analysis, Portfolio optimization, Crypto simulations.
- PROGRAMMING: Building modules, Bug fixing, API design, Performance optimization, Automation scripts.
- AI/DATA: Model training (conceptual), Dataset classification, Interpreting output, Accuracy improvement.
- MATH: Real-world calculations, Resource allocation, Statistical analysis, Logic puzzles.
- SCIENCE: Explaining experiments, Physics systems, Chemical reactions, Biological modeling.
- LAW: Case analysis, Contract interpretation, Rights vs Obligations, Conflict resolution.
- CREATIVE: Branding, Visual concepts, Media content plans, Storytelling.
- LANGUAGES: Real conversation, Business communication, Travel role-play, Professional messaging.

GENERATION REQUIREMENTS:
1. LANGUAGE: Armenian (Հայերեն).
2. DEDUP: Do NOT repeat core concepts taught in previous levels: ${previousLessons.slice(-5).join(', ')}.
3. SYNTHESIS: Distill expertise from ${sources}. Do not copy text.
4. TONE: Professional, pedagogical, and encouraging.
5. FLOW INTEGRITY:
   - PRACTICAL TASK: Must use ONLY concepts introduced in this specific lesson's theory. Must be a scenario-based mission using the patterns above where applicable.
   - GAME: Must reuse the EXACT SAME concepts. It is an application simulation. NO NEW THEORY allowed in the game. It must test applied understanding through real-world decision making.

COMPONENTS TO GENERATE:
1. LESSON (theory): explain 1-3 new concepts simply.
2. TEST (quiz): 5-8 assessment questions (MCQ).
3. PRACTICAL TASK: A real-world scenario requiring decision making/creation based on the theory above. 
   - Scenario: Context rich title
   - Context: Background information
   - Role: The user's professional persona
   - Mission: Direct objective
   - Constraints: Limits based on lesson theory
   - Steps to Complete: Step-by-step methodology
   - Expected Output: Result
   - Success Criteria: Metrics
4. INTERACTIVE EXERCISES: Generate 3 specific interactive challenges:
   - Level 1: Beginner (basic understanding)
   - Level 2: Intermediate (applied knowledge)
   - Level 3: Advanced (analytical/problem-solving)
   - Each must have a real-world scenario, clear question, and detailed feedback.
5. GAME (simulation): An interactive simulation based ONLY on the lesson concepts.
   - Purpose: Test applied understanding.
   - Logic: Decisions must reflect the core logic of the taught concepts.

JSON STRUCTURE:
{
  "title": "Level Title",
  "introduction": "Engaging hook",
  "keyConcepts": ["Concept 1", "Concept 2"],
  "detailedExplanation": "Professional pedagogical explanation",
  "examples": ["Case study or specific example"],
  "exercises": ["Thought provocations"],
  "miniSummary": "TL;DR summary",
  "recommendedReading": [{ "title": "Ref", "author": "Author", "description": "Why read" }],
  "interactiveExercises": [
    {
      "id": "ex-1",
      "scenario": "A beginner-level real-world situation",
      "difficulty": "Beginner",
      "question": "What should you do?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": "Option A",
      "explanation": "Detailed feedback with reasoning",
      "points": 10
    },
    {
      "id": "ex-2",
      "scenario": "An intermediate applied situation",
      "difficulty": "Intermediate",
      "question": "Calculate X or choose best action",
      "type": "calculation",
      "correctAnswer": 42,
      "explanation": "Breakdown of the solution",
      "points": 25
    },
    {
      "id": "ex-3",
      "scenario": "Advanced problem-solving scenario",
      "difficulty": "Advanced",
      "question": "Deep analytical question",
      "type": "short-answer",
      "correctAnswer": "The strategic reason",
      "explanation": "Critical thinking explanation",
      "points": 50
    }
  ],
  "quiz": [
    {
      "question": "Understanding-based question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why correct"
    }
  ],
  "practicalTask": {
    "title": "Task Title",
    "scenario": "Short catchy scenario name",
    "context": "Background/Setting details",
    "role": "User's role (e.g. Senior Architect)",
    "mission": "Direct objective",
    "constraints": ["Constraint 1", "Constraint 2"],
    "instructions": "Steps to complete (pedagogical methodology)",
    "deliverable": "Expected Output summary",
    "evaluationCriteria": "Success criteria description",
    "bonusChallenge": "Optional stretch goal"
  },
  "game": {
    "title": "Interactive Simulation",
    "scenario": "A high-stakes situation",
    "player_role": "Professional persona",
    "steps": [
      {
        "step_id": 1,
        "situation": "Initial problem",
        "choices": [
          {
            "text": "Action choice",
            "is_correct": true,
            "reason": "Effect on system/logic",
            "xp_change": 25,
            "result": "Direct outcome"
          }
        ]
      }
    ],
    "win_condition": "Goal reached",
    "lose_condition": "System failure"
  },
  "completion": {
    "message": "Final victory message in Armenian",
    "total_xp": 100
  },
  "requiredScore": 100
}
  `;
  const maxRetries = 4;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      console.log("Generating lesson content for topic:", currentTopic || `Level ${level}`);
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              topicId: { type: Type.STRING },
              topicName: { type: Type.STRING },
              orderIndex: { type: Type.INTEGER },
              introduction: { type: Type.STRING },
              keyConcepts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              detailedExplanation: { type: Type.STRING },
              examples: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              exercises: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              interactiveExercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    scenario: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ["Beginner", "Intermediate", "Advanced"] },
                    question: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["multiple-choice", "calculation", "short-answer"] },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    points: { type: Type.INTEGER }
                  },
                  required: ["id", "scenario", "difficulty", "question", "type", "correctAnswer", "explanation", "points"]
                }
              },
              miniSummary: { type: Type.STRING },
              recommendedReading: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    author: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "author", "description"]
                }
              },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctAnswer: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctAnswer", "explanation"]
                }
              },
                  practicalTask: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      scenario: { type: Type.STRING },
                      context: { type: Type.STRING },
                      role: { type: Type.STRING },
                      mission: { type: Type.STRING },
                      constraints: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      instructions: { type: Type.STRING },
                      deliverable: { type: Type.STRING },
                      evaluationCriteria: { type: Type.STRING },
                      bonusChallenge: { type: Type.STRING }
                    },
                    required: ["title", "scenario", "context", "role", "mission", "constraints", "instructions", "deliverable", "evaluationCriteria"]
                  },
              game: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  scenario: { type: Type.STRING },
                  player_role: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        step_id: { type: Type.INTEGER },
                        situation: { type: Type.STRING },
                        choices: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              text: { type: Type.STRING },
                              is_correct: { type: Type.BOOLEAN },
                              reason: { type: Type.STRING },
                              xp_change: { type: Type.INTEGER },
                              result: { type: Type.STRING }
                            },
                            required: ["text", "is_correct", "reason", "xp_change", "result"]
                          }
                        }
                      },
                      required: ["step_id", "situation", "choices"]
                    }
                  },
                  win_condition: { type: Type.STRING },
                  lose_condition: { type: Type.STRING }
                },
                required: ["title", "scenario", "player_role", "steps", "win_condition", "lose_condition"]
              },
              completion: {
                type: Type.OBJECT,
                properties: {
                  message: { type: Type.STRING },
                  total_xp: { type: Type.INTEGER }
                },
                required: ["message", "total_xp"]
              },
              requiredScore: { type: Type.INTEGER }
            },
            required: ["title", "topicId", "topicName", "orderIndex", "introduction", "keyConcepts", "detailedExplanation", "examples", "exercises", "miniSummary", "recommendedReading", "quiz", "game", "completion"]
          }
        },
      });
      
      let text = response.text || "";
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }
      
      try {
        const parsed = JSON.parse(text);
        if (!parsed.title || !parsed.detailedExplanation) {
          throw new Error("Invalid lesson structure");
        }
        
        // Ensure correctAnswer is always a string for schema compatibility in interactiveExercises
        if (parsed.interactiveExercises) {
          parsed.interactiveExercises = parsed.interactiveExercises.map((ex: any) => ({
            ...ex,
            correctAnswer: String(ex.correctAnswer)
          }));
        }
        
        return parsed;
      } catch (e) {
        console.error("JSON Parse Error:", e, "Text:", text);
        if (retryCount >= maxRetries) return getFallbackLesson(category, subfield, level, currentTopic, topicIndex);
        retryCount++;
      }
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 3000 + Math.random() * 1000;
          console.warn(`Transient error. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      console.error("Error generating lesson:", error);
      if (retryCount >= maxRetries) return getFallbackLesson(category, subfield, level, currentTopic, topicIndex);
      retryCount++;
    }
  }
  return getFallbackLesson(category, subfield, level, currentTopic, topicIndex);
}

function getFallbackLesson(category: string, subfield: string, level: number, currentTopic?: string, topicIndex?: number) {
  // Find the subfield in CATEGORIES to get its recommended literature
  let literature: any[] = [];
  const cat = CATEGORIES.find(c => c.title === category || c.id === category);
  if (cat) {
    const sub = cat.subfields.find(s => s.title === subfield || s.id === subfield);
    if (sub && sub.recommendedLiterature) {
      const levelKey = level === 1 ? 'beginner' : level === 2 ? 'intermediate' : 'advanced';
      literature = sub.recommendedLiterature[levelKey] || sub.recommendedLiterature.beginner || [];
    }
  }

  // Fallback literature if none found
  if (literature.length === 0) {
    literature = [
      {
        title: "Principles of Economics",
        author: "N. Gregory Mankiw",
        description: "Widely used introductory economics textbook."
      }
    ];
  }

  return {
    title: currentTopic || `${subfield} - Ներածություն (Մակարդակ ${level})`,
    topicId: currentTopic ? currentTopic.toLowerCase().replace(/\s+/g, '-') : `topic-${level}`,
    topicName: currentTopic || `Topic ${level}`,
    orderIndex: topicIndex || level,
    introduction: `Բարի գալուստ ${currentTopic || subfield} թեմայի ուսումնասիրությանը: Այս դասը նախատեսված է հիմնարար գիտելիքներ տրամադրելու համար:`,
    keyConcepts: [
      "Հիմնարար սկզբունքներ",
      "Տեսական հիմքեր",
      "Գործնական կիրառություն"
    ],
    detailedExplanation: `Սա ${currentTopic || subfield} թեմայի վերաբերյալ հիմնարար դաս է: Այս ոլորտը կարևոր դեր ունի ժամանակակից աշխարհում և պահանջում է խորը վերլուծական մոտեցում: Դասի ընթացքում մենք կուսումնասիրենք հիմնական տեսությունները և դրանց կիրառությունը:

Այս մակարդակում մենք կենտրոնանում ենք հիմնական գաղափարների վրա, որոնք հիմք են հանդիսանում ավելի բարդ թեմաների համար: Կարևոր է հասկանալ տրամաբանական կապերը և գործնական նշանակությունը:`,
    examples: [
      "Օրինակ 1: Հիմնական սկզբունքի կիրառումը իրական իրավիճակում:",
      "Օրինակ 2: Տեսական մոդելի աշխատանքը գործնականում:"
    ],
    exercises: [
      "Վարժություն 1: Վերլուծեք տրված իրավիճակը՝ օգտագործելով նոր սովորած սկզբունքները:",
      "Վարժություն 2: Կազմեք փոքրիկ պլան թեմայի կիրառման վերաբերյալ:"
    ],
    miniSummary: "Այս դասը տրամադրեց հիմնարար պատկերացում թեմայի վերաբերյալ:",
    recommendedReading: literature,
    interactiveExercises: [
      {
        id: 'fallback-1',
        scenario: 'Ներածական իրավիճակ',
        difficulty: 'Beginner',
        question: 'Ինչպե՞ս է պետք վերաբերվել նոր թեմային:',
        type: 'multiple-choice',
        options: ['Հետաքրքրությամբ', 'Անտարբերությամբ', 'Վախով'],
        correctAnswer: 'Հետաքրքրությամբ',
        explanation: 'Նոր թեմաները միշտ պահանջում են դրական և հետաքրքրասեր մոտեցում:',
        points: 10
      }
    ],
    quiz: [
      {
        question: "Ո՞րն է այս թեմայի հիմնական նպատակը:",
        options: ["Գիտելիքի ձեռքբերում", "Գործնական կիրառում", "Վերլուծություն", "Բոլորը"],
        correctAnswer: 3,
        explanation: "Բոլոր նշված գործոնները հավասարապես կարևոր են համապարփակ ուսուցման համար:"
      },
      {
        question: "Արդյո՞ք այս թեման կարևոր է:",
        options: ["Այո", "Ոչ", "Մասամբ", "Չգիտեմ"],
        correctAnswer: 0,
        explanation: "Այս թեման հիմնարար նշանակություն ունի ոլորտի հետագա ուսումնասիրության համար:"
      },
      {
        question: "Ի՞նչ է պահանջվում հաջողության համար:",
        options: ["Աշխատասիրություն", "Տաղանդ", "Հետևողականություն", "Բոլորը"],
        correctAnswer: 3,
        explanation: "Հաջողությունը պահանջում է բազմակողմանի մոտեցում և տարբեր որակների համադրում:"
      }
    ],
    practicalTask: {
      title: 'Գործնական վերլուծություն',
      scenario: 'Դուք պետք է վերլուծեք ստացված տեղեկատվությունը:',
      instructions: '1. Կարդացեք դասը հիմնավոր:\n2. Գտեք առանցքային կետերը:\n3. Կազմեք գործողությունների պլան:',
      deliverable: 'Գործողությունների պլանի սևագիր:',
      evaluationCriteria: 'Հստակություն և կիրառելիություն:'
    },
    game: {
      title: 'Գործնական Սցենար',
      scenario: 'Դուք նոր եք սկսում ձեր գործունեությունը այս ոլորտում և պետք է կատարեք ձեր առաջին որոշումները:',
      player_role: 'Սկսնակ մասնագետ',
      steps: [
        {
          step_id: 1,
          situation: 'Ինչպե՞ս կսկսեք ձեր աշխատանքային օրը:',
          choices: [
            {
              text: 'Պլանավորել օրը',
              is_correct: true,
              reason: 'Ժամանակի ճիշտ կառավարումը հաջողության գրավականն է:',
              xp_change: 20,
              result: 'Դուք ունեք հստակ պատկերացում ձեր անելիքների մասին:'
            },
            {
              text: 'Անմիջապես սկսել գործը',
              is_correct: false,
              reason: 'Առանց պլանավորման հնարավոր են բացթողումներ:',
              xp_change: 5,
              result: 'Դուք սկսեցիք աշխատել, բայց որոշ ժամանակ անց քաոս առաջացավ:'
            }
          ]
        }
      ],
      win_condition: 'Դուք հաջողությամբ կատարեցիք առաջին քայլերը:',
      lose_condition: 'Դուք ձախողեցիք պլանավորումը:'
    },
    completion: {
      message: 'Շնորհավորում ենք: Դուք հաջողությամբ ավարտեցիք այս մակարդակի ուսումնական փաթեթը:',
      total_xp: 100
    }
  };
}

export async function extractTermsFromLesson(lessonContent: string) {
  const prompt = `Վերլուծիր հետևյալ դասի տեքստը և առանձնացրու բոլոր կարևոր տերմինները կամ նոր բառերը, որոնք օգտատերը պետք է սովորի:
  
  Դասի տեքստ:
  ${lessonContent}
  
  Վերադարձրու JSON զանգված, որտեղ յուրաքանչյուր տարր ունի 'term' և 'definition' դաշտերը:
  Բացատրությունները պետք է լինեն պարզ և հակիրճ հայերենով:
  
  Վերադարձրու ՄԻԱՅՆ JSON:`;

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      let text = response.text || "[]";
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        text = text.substring(firstBracket, lastBracket + 1);
      }
      
      return JSON.parse(text);
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        console.error("JSON Parse Error in extractTerms:", error, "Text:", response?.text);
      }
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2500;
          console.warn(`Transient error in extractTerms. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error extracting terms:", error);
      return [];
    }
  }
  return [];
}

import { getCachedAudio, cacheAudio } from "../lib/audioCache";
import { pcmToWav } from "../lib/audioUtils";

export async function generateProgressionFeedback(input: {
  userId: string;
  userName: string;
  lessonId: string;
  lessonCompleted: boolean;
  quizScore: number;
  timeSpent: string;
  mistakes: string[];
  currentLevel: number;
  maxLevel: number;
}) {
  const { quizScore, currentLevel, maxLevel, userName, lessonId, userId, mistakes } = input;
  
  const cacheKey = `progression_${userId}_${lessonId}`;
  const cached = await getCachedAudio(cacheKey);
  if (cached) return cached;

  let newLevel = currentLevel;
  let status: 'level-up' | 'same-level' | 'repeat-lesson' = 'same-level';
  
  if (quizScore >= 80) {
    status = 'level-up';
    if (currentLevel < maxLevel) {
      newLevel = currentLevel + 1;
    }
  } else if (quizScore >= 50) {
    status = 'same-level';
  } else {
    status = 'repeat-lesson';
  }

  const prompt = `Դու Learnix-ի ԱԲ համակարգն ես: Գեներացրու կարճ, ոգևորող հաղորդագրություն ${userName}-ի համար:
  
  Տվյալներ:
  - Թեստի արդյունք: ${quizScore}%
  - Նախկին մակարդակ: ${currentLevel}
  - Նոր մակարդակ: ${newLevel}
  - Կարգավիճակ: ${status}
  - Սխալներ: ${mistakes.join(', ')}
  
  Կանոններ:
  - Ներառիր օգտատիրոջ անունը
  - Եթե մակարդակը բարձրացել է, շնորհավորիր
  - Եթե նույնն է մնացել, քաջալերիր
  - Եթե պետք է կրկնել, տուր մոտիվացիա
  - Եթե կան սխալներ, նրբանկատորեն նշիր դրանք
  - Կարճ նախադասություններ
  - Ավելացրու դադարներ '...' նշանով
  - Խոսիր ընկերական և բնական
  
  Վերադարձրու ՄԻԱՅՆ տեքստը հայերենով:`;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const messageText = textResponse.text || "Ապրես, լավ աշխատանք:";

      const audioResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: messageText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const audioUrl = base64Audio ? pcmToWav(base64Audio) : "";

      const result = {
        userId,
        lessonId,
        newLevel,
        status,
        messageText,
        audioUrl
      };

      await cacheAudio(cacheKey, result);
      return result;
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in generateProgressionFeedback. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error in generateProgressionFeedback:", error);
      return {
        userId,
        lessonId,
        newLevel,
        status,
        messageText: "Լավ աշխատանք, շարունակիր սովորել:",
        audioUrl: ""
      };
    }
  }
  return {
    userId,
    lessonId,
    newLevel,
    status,
    messageText: "Լավ աշխատանք, շարունակիր սովորել:",
    audioUrl: ""
  };
}

export async function chatWithMentor(messages: {role: string, text: string}[], userName: string) {
  const systemInstruction = `Դու Learnix հարթակի ԱԲ մենթորն ես: Օգնիր ${userName}-ին սովորել, բացատրիր բարդ թեմաները պարզ լեզվով, տուր մոտիվացիա և խորհուրդ տուր ինչ սովորել հաջորդիվ: Խոսիր միայն հայերենով:`;
  
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.map(m => ({ parts: [{ text: m.text }], role: m.role })),
        config: {
          systemInstruction,
        },
      });
      return response.text;
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in mentor chat. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error in mentor chat:", error);
      return "Ցավոք, կապի խնդիր առաջացավ: Խնդրում եմ փորձեք մի փոքր ուշ:";
    }
  }
  return "Ցավոք, կապի խնդիր առաջացավ: Խնդրում եմ փորձեք մի փոքր ուշ:";
}

export async function generateLanguagePlacementTest(language: string) {
  const prompt = `Ստեղծիր լեզվի մակարդակի ստուգման թեստ ${language} լեզվի համար:
  Թեստը պետք է ներառի 10 հարց, որոնք աստիճանաբար բարդանում են (Beginner-ից մինչև Advanced):
  
  Վերադարձրու JSON զանգված, որտեղ յուրաքանչյուր տարր ունի (բոլոր տեքստային դաշտերը պետք է լինեն STRING, ոչ օբյեկտ):
  - question: հարցը (string)
  - options: 4 տարբերակ (array of strings)
  - correctAnswer: ճիշտ պատասխանի ինդեքսը (number)
  - level: 'beginner' | 'intermediate' | 'advanced' (string)
  
  Վերադարձրու ՄԻԱՅՆ JSON:`;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      let text = response.text || "[]";
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        text = text.substring(firstBracket, lastBracket + 1);
      }
      
      return JSON.parse(text);
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in placement test. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error generating placement test:", error);
      return [];
    }
  }
  return [];
}

export async function generateLanguageVocabulary(language: string, level: string, count: number = 20) {
  const prompt = `Գեներացրու ${count} բառ ${language} լեզվով ${level} մակարդակի համար:
  Յուրաքանչյուր բառի համար տուր (բոլոր արժեքները պետք է լինեն STRING, ոչ օբյեկտ):
  - word: բառը (string)
  - definition: պարզ բացատրություն հայերենով (string)
  - example: օրինակ նախադասություն ${language} լեզվով (string)
  
  Վերադարձրու JSON զանգված:
  Վերադարձրու ՄԻԱՅՆ JSON:`;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      let text = response.text || "[]";
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      if (firstBracket !== -1 && lastBracket !== -1) {
        text = text.substring(firstBracket, lastBracket + 1);
      }
      
      return JSON.parse(text);
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in vocabulary generation. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error generating vocabulary:", error);
      return [];
    }
  }
  return [];
}

export async function generateStandaloneGame(topic: string, level: string, domain: string, content: string) {
  const prompt = `
You are a Senior Game Designer and Educational Systems Architect.
Your task is to generate a COMPLETE, FUNCTIONAL, and STABLE learning game based strictly on the provided lesson content.

The output MUST be structured, deterministic, and directly usable in a web/app environment. 
Avoid vague descriptions. Everything must be explicit and playable.

-------------------------------------
INPUT:
Topic: ${topic}
Level: ${level}
Domain: ${domain}
Lesson Content:
${content}

-------------------------------------
STEP 1 — EXTRACT CORE KNOWLEDGE
Identify:
- "concepts": [3–6 key concepts from lesson]
- "applications": [2–3 real use cases from lesson]

-------------------------------------
STEP 2 — GENERATE GAME (STRICT JSON FORMAT)
Return a JSON object that strictly follows this structure (return ONLY valid JSON, no explanations):

{
  "title": "Short, clear, and engaging title",
  "gameType": "scenario | decision | problem-solving",
  "learningObjective": "What exact skill or concept this game reinforces",
  "keyConcepts": ["List the extracted concepts"],
  "realApplications": ["List the extracted applications"],
  
  "scenario": {
    "context": "Context-rich situation related to the domain",
    "player_role": "Who the player is in this scenario",
    "goal": "The primary objective of the player"
  },

  "dataset": {
    "scenario": "Unified scenario description for the engine",
    "objectives": ["Specific mission goal 1", "Specific mission goal 2"],
    "rules": ["Instruction 1", "Constraint 2"],
    "challenges": [
      {
        "question": "A situation/decision point concise question",
        "options": ["Option A text", "Option B text", "Option C text"],
        "impacts": [
          { 
            "score": 10, 
            "feedback": "Why this choice is correct/incorrect based on lesson",
            "metrics": { "performance": 10 }
          },
          { 
            "score": -5, 
            "feedback": "Feedback for choice B",
            "metrics": { "performance": -5 }
          },
          { 
            "score": 0, 
            "feedback": "Feedback for choice C",
            "metrics": { "performance": 0 }
          }
        ],
        "correctAnswer": 0
      }
    ],
    "successCriteria": "Summary of win condition",
    "metrics": [
      { "label": "Performance", "icon": "zap", "initialValue": 50 }
    ]
  },

  "winLoseConditions": {
    "win": "What happens on success",
    "lose": "What happens on failure"
  },

  "alignmentCheck": "Brief evidence that game logic uses lesson concepts",
  
  "validation": {
    "content_based": true,
    "uses_all_concepts": true,
    "playable": true
  }
}

-------------------------------------
ANTI-CRASH RULES:
- Max 5 challenges in dataset.
- Max 3 options per challenge.
- No long texts.
- JSON must be perfectly valid.
- The player should NOT be able to win without understanding the lesson.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating standalone game:", error);
    throw error;
  }
}

export async function generateLanguageGrammar(language: string, level: string) {
  const prompt = `Ստեղծիր քերականական դաս ${language} լեզվի համար ${level} մակարդակի համար:
  Ներառիր (բոլոր տեքստային դաշտերը պետք է լինեն STRING, ոչ օբյեկտ):
  - title: դասի վերնագիրը (string)
  - explanation: մանրամասն բացատրություն հայերենով (string)
  - rules: հիմնական կանոնները (array of strings)
  - examples: օրինակներ (array of strings)
  - quiz: 3 հարցից բաղկացած թեստ
  
  Վերադարձրու JSON:
  Վերադարձրու ՄԻԱՅՆ JSON:`;

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      let text = response.text || "{}";
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }
      
      return JSON.parse(text);
    } catch (error: any) {
      if (isQuotaError(error)) {
        retryCount++;
        if (retryCount <= maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          console.warn(`Transient error in grammar generation. Retrying in ${waitTime}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      console.error("Error generating grammar:", error);
      return null;
    }
  }
  return null;
}
