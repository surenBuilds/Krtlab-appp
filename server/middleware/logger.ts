/**
 * Request logging middleware.
 */
import type { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  const start = Date.now();
  const originalEnd = _res.end.bind(_res);
  _res.end = function (...args: unknown[]) {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "test") {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${_res.statusCode} (${duration}ms)`);
    }
    return originalEnd(...args);
  } as typeof _res.end;
  next();
}
