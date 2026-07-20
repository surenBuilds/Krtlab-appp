import { Level, OptimizationAudit } from "../types";

export async function runOptimizationEngine(
  levelData: Level,
  performance: {
    quizScore: number;
    completionTime: number;
    failureRate: number;
    dropOffPoint: 'theory' | 'quiz' | 'practice' | 'result';
  }
): Promise<OptimizationAudit | null> {
  try {
    const response = await fetch("/api/gemini/runOptimizationEngine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ levelData, performance }),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const result = await response.json() as OptimizationAudit;
    return {
      ...result,
      timestamp: new Date().toISOString(),
      originalDataSnapshot: levelData,
    };
  } catch (error) {
    console.error("Optimization Engine failed:", error);
    return null;
  }
}
