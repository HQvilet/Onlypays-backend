import type { Request, Response, NextFunction } from "express";
import { redis } from "../cache/redis.js";

interface IdempotencyOptions {
    /** Time-to-live in seconds for cached response (Default: 86400 / 24 hours) */
    ttlSeconds?: number;
    /** If true, returns 400 Bad Request when Idempotency-Key header is missing on POST/PUT/PATCH */
    required?: boolean;
}

/**
 * Idempotency Key Middleware using Redis.
 * Caches HTTP response based on Idempotency-Key header to prevent duplicate operations.
 */
export const createIdempotencyMiddleware = (options: IdempotencyOptions = {}) => {
    const ttlSeconds = options.ttlSeconds || 86400; // 24 hours default
    const required = options.required ?? false;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Skip non-mutating HTTP methods
        if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
            return next();
        }

        const idempotencyKey =
            (req.headers["idempotency-key"] as string) ||
            (req.headers["x-idempotency-key"] as string);

        if (!idempotencyKey) {
            if (required) {
                res.status(400).json({
                    status: "error",
                    message: "Header 'Idempotency-Key' is required for this operation",
                });
                return;
            }
            return next();
        }

        const userId = (req.headers["x-user-id"] as string) || "anonymous";
        const cacheKey = `idempotency:${userId}:${idempotencyKey}`;

        try {
            // Check if request was previously processed
            const cachedResponse = await redis.get(cacheKey);

            if (cachedResponse) {
                const { statusCode, body } = JSON.parse(cachedResponse);
                res.setHeader("X-Cache", "HIT");
                res.setHeader("X-Idempotency-Replayed", "true");
                res.status(statusCode).json(body);
                return;
            }
        } catch (err) {
            console.warn("[Idempotency] Failed to query Redis cache, bypassing cache check:", (err as Error).message);
        }

        res.setHeader("X-Cache", "MISS");

        // Intercept res.json to capture response payload and cache in Redis
        const originalJson = res.json.bind(res);

        res.json = (body: any): Response => {
            // Cache successful 2xx responses in Redis
            if (res.statusCode >= 200 && res.statusCode < 300) {
                redis.setex(
                    cacheKey,
                    ttlSeconds,
                    JSON.stringify({
                        statusCode: res.statusCode,
                        body,
                    })
                ).catch((err) => {
                    console.error("[Idempotency] Failed to save response to Redis:", err.message);
                });
            }

            return originalJson(body);
        };

        next();
    };
};

/** Default instance for general route protection */
export const idempotencyMiddleware = createIdempotencyMiddleware({ required: false });
