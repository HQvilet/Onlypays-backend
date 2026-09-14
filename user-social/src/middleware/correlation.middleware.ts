import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// Extend Express Request type to include correlationId
declare global {
    namespace Express {
        interface Request {
            correlationId?: string;
        }
    }
}

/**
 * Request Correlation ID Middleware.
 * Extracts X-Correlation-ID header from incoming request or generates a new UUID.
 * Sets the header on response and attaches it to req.correlationId for logging.
 */
export const correlationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const correlationId =
        (req.headers["x-correlation-id"] as string) ||
        (req.headers["correlation-id"] as string) ||
        `req-${Date.now()}-${randomUUID().substring(0, 8)}`;

    req.correlationId = correlationId;
    res.setHeader("X-Correlation-ID", correlationId);
    next();
};
