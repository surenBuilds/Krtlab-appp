import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function isQuotaError(error: any): boolean {
  if (!error) return false;
  const errorStr = JSON.stringify(error).toLowerCase();
  const message = String(error?.message || "").toLowerCase();
  return message.includes("429") || message.includes("quota") || message.includes("rate limit") || errorStr.includes("429") || errorStr.includes("quota exceeded");
}

app.post("/api/gemini/generateLessonAudio", async (req, res) => { if (!req.body.lessonText) return res.status(400).json({ message: "lessonText required" }); try { const tr = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: `Read this in Armenian:\n${req.body.lessonText}` }); const et = tr.text || req.body.lessonText; const ar = await ai.models.generateContent({ model: "gemini-3.1-flash-tts-preview", contents: [{ parts: [{ text: et }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } }); const audio = ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || ""; return res.json({ audio, text: et }); } catch (e: any) { return res.status(500).json({ message: e.message }); } });

app.post("/api/gemini/generateSimplerExplanation", async (req, res) => { if (!req.body.lessonText) return res.status(400).json({ message: "lessonText required" }); try { const tr = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: `Explain in simpler Armenian:\n${req.body.lessonText}` }); const et = tr.text || req.body.lessonText; const ar = await ai.models.generateContent({ model: "gemini-3.1-flash-tts-preview", contents: [{ parts: [{ text: et }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } }); const audio = ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || ""; return res.json({ audio, text: et }); } catch (e: any) { return res.status(500).json({ message: e.message }); } });

app.post("/api/gemini/askTutorQuestion", async (req, res) => { const { lessonText, question, history } = req.body; if (!lessonText || !question) return res.status(400).json({ message: "required" }); try { const tr = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: `Answer in Armenian:\nLesson: ${lessonText}\nHistory: ${JSON.stringify(history||[])}\nQuestion: ${question}` }); const et = tr.text || ""; const ar = await ai.models.generateContent({ model: "gemini-3.1-flash-tts-preview", contents: [{ parts: [{ text: et }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } }); const audio = ar.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || ""; return res.json({ audio, text: et }); } catch (e: any) { return res.status(500).json({ message: e.message }); } });

app.post("/api/gemini/analyzeProgress", async (req, res) => { const { lessonId, quizScore, mistakes, questionsAsked } = req.body; try { const r = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: `Analyze: lesson ${lessonId}, quiz ${quizScore}%, mistakes: ${(mistakes||[]).join(", ")}, questions: ${questionsAsked||0}. Return JSON: {level,weakPoints:[],recommendation,nextLessonType}. ONLY JSON.`, config: { responseMimeType: "application/json" } }); let t = r.text||"{}"; const f=t.indexOf("{"),l=t.lastIndexOf("}");if(f!==-1&&l!==-1)t=t.substring(f,l+1); return res.json(JSON.parse(t)); } catch { return res.json({ level:"medium",weakPoints:[],recommendation:"Continue",nextLessonType:"same" }); } });

const SOURCE_MAP: Record<string,string> = { entrepreneurship:"Y Combinator, HBR, Lean Startup",marketing:"HubSpot, Google Digital Garage",sales:"SPIN Selling, Dale Carnegie",python:"Python Docs, fast.ai",javascript:"MDN, freeCodeCamp",ai:"Andrew Ng, fast.ai, HuggingFace",cybersecurity:"OWASP, NIST" };

app.post("/api/gemini/generatePracticeLabTask", async (req, res) => { const { category, subfieldId, subfieldTitle, level, topic } = req.body; try { const r = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: `Generate practice lab task. Category: ${category}, Subfield: ${subfieldTitle}, Level: ${level}. JSON: {id,title,scenario,role,steps[{id,description,question,type,options,hint,expectedOutcome}],xpReward}. Armenian. ONLY JSON.`, config: { responseMimeType: "application/json" } }); let t=r.text||"{}"; const f=t.indexOf("{"),l=t.lastIndexOf("}");if(f!==-1&&l!==-1)t=t.substring(f,l+1); return res.json(JSON.parse(t)); } catch { return res.json({ id:"lab-"+Date.now(),title:"Task",steps:[],xpReward:25+level*5 }); } });

app.post("/api/gemini/generateLessonContent", async (req, res) => { const { category, subfield, level, literature, previousLessons, currentTopic, topicIndex } = req.body; const sources = SOURCE_MAP[subfield] || "Academic standards"; const p = `Generate Level ${level}/20 course. Category: ${category}, Subfield: ${subfield}. Sources: ${sources}. ${currentTopic?`Topic: ${currentTopic}`:""}. JSON with: title,topicId,topicName,orderIndex,introduction,keyConcepts[],detailedExplanation,examples[],exercises[],miniSummary,recommendedReading[],quiz[{question,options[],correctAnswer,explanation}],practicalTask:{title,scenario,instructions,deliverable,evaluationCriteria},game:{title,scenario,player_role,steps[]},completion:{message,total_xp},requiredScore. Armenian. ONLY JSON.`; try { const r = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: p, config: { responseMimeType: "application/json" } }); let t=r.text||"{}"; const f=t.indexOf("{"),l=t.lastIndexOf("}");if(f!==-1&&l!==-1)t=t.substring(f,l+1); return res.json(JSON.parse(t)); } catch { return res.json({ title:currentTopic||`${subfield} Level ${level}`,introduction:"Welcome",keyConcepts:["Basics"],detailedExplanation:"This is a lesson.",examples:["Example 1"],exercises:["Exercise 1"],miniSummary:"Summary",recommendedReading:[],quiz:[{question:"Question",options:["A","B","C","D"],correctAnswer:0}],practicalTask:{title:"Task",scenario:"",instructions:"",deliverable:"",evaluationCriteria:""},game:{title:"Game",scenario:"",player_role:"",steps:[]},completion:{message:"Done",total_xp:100},requiredScore:100 }); } });

if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(import.meta.dirname || __dirname, "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  app.listen(PORT, () => { console.log(`KrtLab on http://localhost:${PORT} (production)`); });
} else {
  const startDevServer = async () => {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    app.listen(PORT, () => { console.log(`KrtLab dev on http://localhost:${PORT}`); });
  };
  startDevServer();
}