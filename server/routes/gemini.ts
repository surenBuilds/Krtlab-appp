import { Router, Request, Response } from "express";
import * as gemini from "../services/gemini";
import { getAIClient, TEXT_MODEL } from "../utils/aiClient";
import { withRetry } from "../utils/helpers";
import { validateAIResponse } from "../utils/validateAIResponse";
import { PracticeLabTaskSchema } from "../schemas/aiResponses";

const router = Router();

router.post("/generateLessonAudio", async (req: Request, res: Response) => { if (!req.body.lessonText) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.generateLessonAudio(req.body.lessonText)); });
router.post("/generateSimplerExplanation", async (req: Request, res: Response) => { if (!req.body.lessonText) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.generateSimplerExplanation(req.body.lessonText)); });
router.post("/askTutorQuestion", async (req: Request, res: Response) => { const { lessonText, question, history } = req.body; if (!lessonText || !question) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.askTutorQuestion(lessonText, question, history || [])); });
router.post("/analyzeProgress", async (req: Request, res: Response) => { res.json(await gemini.analyzeProgress(req.body)); });
router.post("/generateLessonContent", async (req: Request, res: Response) => {
  const result = await gemini.generateLessonContent(req.body);
  if (!result.success) {
    res.status(422).json({ error: result.errorType, message: result.message, issues: result.issues });
    return;
  }
  res.json(result.data);
});
router.post("/generatePracticeLabTask", async (req: Request, res: Response) => {
  try {
    const r = await withRetry(() => getAIClient().models.generateContent({ model: TEXT_MODEL, contents: "Generate practice lab", config: { responseMimeType: "application/json" } }));
    const result = validateAIResponse(r.text, PracticeLabTaskSchema);
    if (!result.success) {
      console.warn(`[generatePracticeLabTask] ${result.errorType}: ${result.message}`);
      res.status(422).json({ error: result.errorType, message: result.message, issues: "issues" in result ? result.issues : undefined });
      return;
    }
    res.json(result.data);
  } catch (err: any) {
    res.status(502).json({ error: "AI_GENERATION_ERROR", message: err.message || "Failed to generate practice lab task." });
  }
});
router.post("/chatWithMentor", async (req: Request, res: Response) => { const { messages, userName, context } = req.body; if (!messages || !userName) { res.status(400).json({ message: "required" }); return; } res.json({ text: await gemini.chatWithMentor(messages, userName, context) }); });
router.post("/generateProgressionFeedback", async (req: Request, res: Response) => { if (!req.body.input) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.generateProgressionFeedback(req.body.input)); });
router.post("/explainQuizMistake", async (req: Request, res: Response) => { const { question, userAnswer, correctAnswer, context } = req.body; if (!question || !userAnswer || !correctAnswer) { res.status(400).json({ message: "required" }); return; } res.json({ text: await gemini.explainQuizMistake(question, userAnswer, correctAnswer, context) }); });
router.post("/generateLanguagePlacementTest", async (req: Request, res: Response) => { if (!req.body.language) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.generateLanguagePlacementTest(req.body.language)); });
router.post("/generateLanguageVocabulary", async (req: Request, res: Response) => { const { language, level, count } = req.body; if (!language || !level) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.generateLanguageVocabulary(language, level, count || 20)); });
router.post("/generateLanguageGrammar", async (req: Request, res: Response) => { const { language, level } = req.body; if (!language || !level) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.generateLanguageGrammar(language, level)); });
router.post("/generateStandaloneGame", async (req: Request, res: Response) => { const { topic, level, domain, content } = req.body; if (!topic || !domain) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.generateStandaloneGame(topic, level || "Intermediate", domain, content || "")); });
router.post("/generateCertificateOutcomes", async (req: Request, res: Response) => { if (!req.body.courseName) { res.status(400).json({ message: "required" }); return; } res.json({ text: await gemini.generateCertificateOutcomes(req.body.courseName, req.body.levelName || "Completion") }); });
router.post("/extractTermsFromLesson", async (req: Request, res: Response) => { if (!req.body.lessonContent) { res.status(400).json({ message: "required" }); return; } res.json(await gemini.extractTermsFromLesson(req.body.lessonContent)); });
router.post("/runOptimizationEngine", async (req: Request, res: Response) => { res.json({ id: "opt-"+Date.now(), type: "content issue", impact: "low", issueDetected: "none", fixApplied: "none", improvedComponent: "lesson", timestamp: new Date().toISOString() }); });

export default router;
