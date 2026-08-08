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

// Payment webhooks must receive the raw body (for signature verification) and
// therefore must be registered BEFORE the global JSON body parser below.
import { getAdminDb as __getAdminDbForWebhook, isAdminConfigured as __isAdminConfiguredForWebhook } from "./src/lib/firebaseAdmin";
import { getPaymentProvider as __getPaymentProviderForWebhook } from "./src/services/paymentProviders.server";

app.post("/api/certificates/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  try {
    if (!__isAdminConfiguredForWebhook()) return res.status(503).json({ message: "Server not configured" });
    const event = __getPaymentProviderForWebhook().parseWebhook(req.body?.toString?.() ?? "", req.headers["x-signature"] as string | undefined);
    if (!event || event.status !== "succeeded" || event.itemType !== "certificate") {
      return res.status(400).json({ message: "Invalid or unhandled webhook event" });
    }
    const db = __getAdminDbForWebhook();
    const certRef = db.collection("certificates").doc(event.itemId);
    const certSnap = await certRef.get();
    if (!certSnap.exists) return res.status(404).json({ message: "Certificate not found" });

    await certRef.update({ status: "issued", paymentId: event.providerSessionId });
    const cert = { ...certSnap.data(), status: "issued" } as any;

    const portId = `port_cert_${cert.id}`;
    await db.collection("portfolioItems").doc(portId).set({
      id: portId,
      uid: cert.uid,
      type: "certificate",
      title: `Verified: ${cert.skillTitle}`,
      description: `KrtLab Verified Certificate, issued ${String(cert.issueDate).slice(0, 10)}.`,
      skillIds: [cert.skillId],
      url: cert.verificationUrl,
      isPublic: true,
      source: "auto_certificate",
      createdAt: new Date().toISOString(),
    });

    return res.json({ received: true });
  } catch (e: any) {
    return res.status(400).json({ message: e.message });
  }
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

// ===============================================================
// CERTIFICATES — real issuance flow (spec section 7)
// Client can never write to /certificates directly (see firestore.rules).
// Issuance only happens here, after real payment confirmation.
// ===============================================================
import { getAdminDb, getAdminAuth, isAdminConfigured } from "./src/lib/firebaseAdmin";
import { getPaymentProvider, CERTIFICATE_PRICE_AMD } from "./src/services/paymentProviders.server";
import { computeSkillMastery } from "./src/services/skillsService";
import { randomUUID } from "crypto";

async function requireAuth(req: express.Request): Promise<string> {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("Missing Authorization: Bearer <idToken> header");
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded.uid;
}

app.post("/api/certificates/request", async (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(503).json({
      message: "Certificate issuance is not configured on this server yet (FIREBASE_SERVICE_ACCOUNT_JSON missing).",
    });
  }
  try {
    const uid = await requireAuth(req);
    const { skillId } = req.body;
    if (!skillId) return res.status(400).json({ message: "skillId required" });

    const db = getAdminDb();
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) return res.status(404).json({ message: "User profile not found" });
    const profile = userSnap.data() as any;

    const skills = computeSkillMastery(profile);
    const skill = skills.find((s) => s.skillId === skillId);
    if (!skill || skill.masteryPercent < 70) {
      return res.status(400).json({
        message: `Mastery too low to request a certificate for '${skillId}' (need 70%+, currently ${skill?.masteryPercent ?? 0}%).`,
      });
    }

    const certId = `cert_${randomUUID()}`;
    const verificationUrl = `${req.protocol}://${req.get("host")}/verify/${certId}`;
    const certificate = {
      id: certId,
      uid,
      skillId,
      skillTitle: skill.skillTitle,
      issueDate: new Date().toISOString(),
      masteryPercentAtIssue: skill.masteryPercent,
      verificationUrl,
      status: "pending_payment",
    };
    await db.collection("certificates").doc(certId).set(certificate);

    let checkout;
    try {
      checkout = await getPaymentProvider().createCheckout({
        uid,
        itemType: "certificate",
        itemId: certId,
        amountAMD: CERTIFICATE_PRICE_AMD,
        successRedirectUrl: `${req.protocol}://${req.get("host")}/verify/${certId}`,
        cancelRedirectUrl: `${req.protocol}://${req.get("host")}/`,
      });
    } catch (paymentErr: any) {
      // Certificate stays pending_payment; the request itself succeeded and is real,
      // but there is no working checkout until a payment provider is configured.
      return res.status(202).json({
        certificateId: certId,
        status: "pending_payment",
        paymentAvailable: false,
        message: paymentErr.message,
      });
    }

    return res.json({ certificateId: certId, status: "pending_payment", paymentAvailable: true, checkoutUrl: checkout.checkoutUrl });
  } catch (e: any) {
    return res.status(401).json({ message: e.message });
  }
});

// Public verification lookup — no auth required, matches spec's "shareable public verification page"
app.get("/api/certificates/:id", async (req, res) => {
  try {
    const db = getAdminDb();
    const snap = await db.collection("certificates").doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ message: "Certificate not found" });
    const cert = snap.data() as any;
    if (cert.status !== "issued") return res.status(404).json({ message: "Certificate not yet issued" });
    return res.json(cert);
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
});

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