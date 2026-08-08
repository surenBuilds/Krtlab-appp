import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: { headers: { "User-Agent": "krtlab-build" } },
    });
  }
  return aiClient;
}

export const TEXT_MODEL = "gemini-3.5-flash";
export const TTS_MODEL = "gemini-3.1-flash-tts-preview";
