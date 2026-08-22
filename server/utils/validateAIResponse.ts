import { z } from "zod";
import { extractJSON } from "./helpers";

/**
 * Strips a ```json ... ``` (or bare ```) fenced code block wrapper if
 * present, leaving the inner content untouched otherwise.
 */
function stripMarkdownFence(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

/**
 * The single choke point every Gemini learning-content response should go
 * through before it reaches a route response or a React component:
 *
 *   raw text -> strip markdown fences -> JSON.parse -> Zod safeParse -> typed data
 *
 * Never throws. Always returns a discriminated result so callers can
 * return a controlled AI_GENERATION_ERROR / AI_VALIDATION_ERROR response
 * instead of letting malformed AI output propagate.
 *
 * NOTE: no explicit generic return-type annotation here (return type is
 * inferred). Isolated repro showed that explicitly annotating this as
 * `AIValidationResult<z.infer<S>>` breaks discriminated-union narrowing
 * at every call site (`if (!result.success)` fails to narrow, TS reports
 * the type as only the success:true branch) under this project's
 * TypeScript 5.8.3 + zod 3.25 combination, even though the annotation is
 * structurally correct. Letting TS infer the return type from the
 * `as const`-tagged literal branches below avoids the bug entirely.
 */
export function validateAIResponse<S extends z.ZodTypeAny>(rawText: string | undefined | null, schema: S) {
  const text = rawText || "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJSON(stripMarkdownFence(text)));
  } catch (err: any) {
    return {
      success: false as const,
      errorType: "AI_GENERATION_ERROR" as const,
      message: `Failed to parse AI response as JSON: ${err.message || String(err)}`,
      rawText: text,
    };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false as const,
      errorType: "AI_VALIDATION_ERROR" as const,
      message: "AI response JSON did not match the expected schema.",
      issues: result.error.issues,
      rawText: text,
    };
  }

  return { success: true as const, data: result.data as z.infer<S> };
}

/** Documentation/reference shape only — validateAIResponse() intentionally has no
 * explicit generic return-type annotation (see comment above the function) because
 * annotating it as `AIValidationResult<z.infer<S>>` breaks discriminated-union
 * narrowing at every call site under this project's TS 5.8.3 + zod 3.25 combo,
 * even though the annotation type itself is structurally correct. Letting TS
 * infer the return type from the `as const`-tagged literals in the function body
 * works correctly instead. */
export type AIValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errorType: "AI_GENERATION_ERROR"; message: string; rawText: string }
  | { success: false; errorType: "AI_VALIDATION_ERROR"; message: string; issues: z.ZodIssue[]; rawText: string };
