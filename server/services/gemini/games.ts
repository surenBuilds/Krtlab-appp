import { getAIClient, TEXT_MODEL } from "../../utils/aiClient";
import { withRetry, safeParseJSON } from "../../utils/helpers";
const ai = () => getAIClient();

export async function generateStandaloneGame(topic: string, level: string, domain: string, content: string) {
  const r = await withRetry(() => ai().models.generateContent({ model: TEXT_MODEL, contents: `Create educational game: topic="${topic}", domain="${domain}", level="${level}". Context: ${content}. JSON: {id,title,type:"simulation"|"quiz"|"memory"|"sorting"|"scenario",description,difficulty,instructions,gameData:{},scoringSystem:{basePoints,bonusMultiplier},winCondition,totalXpReward}. ONLY JSON.`, config: { responseMimeType: "application/json" } }));
  return safeParseJSON(r.text||"{}", { id: `game-${Date.now()}`, title: `${topic} Game`, type: "quiz", description: "", difficulty: "medium", instructions: "", gameData: {}, scoringSystem: { basePoints: 10, bonusMultiplier: 1.5 }, winCondition: "", totalXpReward: 100 });
}
