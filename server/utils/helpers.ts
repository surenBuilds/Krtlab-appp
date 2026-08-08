export function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  const errorStr = JSON.stringify(error).toLowerCase();
  const message = String((error as Error)?.message || "").toLowerCase();
  return message.includes("429") || message.includes("quota") || message.includes("rate limit") || errorStr.includes("429");
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3, baseDelay: number = 2000): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try { return await fn(); } catch (error) {
      lastError = error;
      if (isQuotaError(error) && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export function extractJSON(text: string): string {
  const first = text.indexOf("{"), last = text.lastIndexOf("}");
  return first !== -1 && last !== -1 ? text.substring(first, last + 1) : text;
}

export function safeParseJSON<T>(text: string, fallback: T): T {
  try { return JSON.parse(extractJSON(text)); } catch { return fallback; }
}
