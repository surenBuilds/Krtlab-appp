export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta: { timestamp: string; duration: number };
}

export function successResponse<T>(data: T, duration: number = 0): APIResponse<T> {
  return { success: true, data, meta: { timestamp: new Date().toISOString(), duration } };
}

export function errorResponse(code: string, message: string, details?: unknown): APIResponse<never> {
  return { success: false, error: { code, message, details }, meta: { timestamp: new Date().toISOString(), duration: 0 } };
}
