import { GoogleGenAI, Type } from "@google/genai";
import { Level, OptimizationAudit } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function runOptimizationEngine(
  levelData: Level,
  performance: {
    quizScore: number;
    completionTime: number;
    failureRate: number;
    dropOffPoint: 'theory' | 'quiz' | 'practice' | 'result';
  }
): Promise<OptimizationAudit | null> {
  const prompt = `
You are the KertLab Internal AI System (QA + Learning Optimization Agent).

Your task is to analyze the provided educational content and current user performance metrics to detect issues and auto-apply improvements.

STRICT RULES:
1. Fix ONLY content-level issues (lesson clarity, quiz difficulty, task instructions, game scenarios).
2. Do NOT change system architecture or logic.
3. Preserve the 20-level curriculum structure.
4. Ensure a high-quality user learning experience.

INPUT:
Original Content (Level Data):
${JSON.stringify(levelData, null, 2)}

Performance Assessment:
- Failure Rate on Quiz: ${performance.failureRate}%
- Avg Quiz Score: ${performance.quizScore}%
- User Drop-off Point: ${performance.dropOffPoint}
- Completion Time: ${performance.completionTime}s

RESPONSE REQUIREMENTS:
- Identify the most critical issue.
- Choose type from: "UX issue", "content issue", "difficulty imbalance", "repetition issue".
- Apply a fix to the specific component (lesson, quiz, task, or game).
- Output valid JSON matching the schema.

JSON SCHEMA:
{
  "id": "opt-123",
  "issueDetected": "Summary of what's wrong",
  "type": "UX issue | content issue | difficulty imbalance | repetition issue",
  "impact": "low | medium | high",
  "fixApplied": "Detailed explanation of what was improved",
  "improvedComponent": "lesson | quiz | task | game",
  "improvedData": { ... entire updated Level object ... }
}

Return ONLY the JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    let text = response.text || "";
    
    // Clean JSON
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    
    const result = JSON.parse(text) as OptimizationAudit;
    
    // Validate result
    if (!result.improvedData || !result.fixApplied) {
      throw new Error("Invalid optimization output");
    }
    
    return {
        ...result,
        timestamp: new Date().toISOString(),
        originalDataSnapshot: levelData
    };
  } catch (error) {
    console.error("Optimization Engine failed:", error);
    return null;
  }
}
