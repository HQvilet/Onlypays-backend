import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

/**
 * HTTP request/response logger middleware.
 * Logs method, path, status code, and latency on every outgoing response.
 * Attaches `correlationId` so each line is traceable back to the request.
 */
export const httpLoggerMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const start = Date.now();

    res.on("finish", () => {
        const latencyMs = Date.now() - start;
        const level =
            res.statusCode >= 500 ? "error" :
            res.statusCode >= 400 ? "warn"  : "info";

        logger[level]("HTTP request", {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            latencyMs,
            correlationId: req.correlationId,
            userId: req.authUserId,
        });
    });

    next();
};
