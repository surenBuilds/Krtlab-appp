/**
 * Centralized error handling middleware.
 */
import type { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/apiResponse";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("Unhandled error:", err.message);
  const statusCode = getStatusCode(err);
  const code = getErrorCode(err);
  res.status(statusCode).json(errorResponse(code, err.message || "Internal server error"));
}

function getStatusCode(err: Error): number {
  const msg = err.message.toLowerCase();
  if (msg.includes("required") || msg.includes("missing")) return 400;
  if (msg.includes("unauthorized") || msg.includes("auth")) return 401;
  if (msg.includes("not found")) return 404;
  if (msg.includes("quota") || msg.includes("rate limit")) return 429;
  return 500;
}

function getErrorCode(err: Error): string {
  const msg = err.message.toLowerCase();
  if (msg.includes("required") || msg.includes("missing")) return "VALIDATION_ERROR";
  if (msg.includes("unauthorized") || msg.includes("auth")) return "UNAUTHORIZED";
  if (msg.includes("not found")) return "NOT_FOUND";
  if (msg.includes("quota") || msg.includes("rate limit")) return "QUOTA_EXCEEDED";
  return "INTERNAL_ERROR";
}
