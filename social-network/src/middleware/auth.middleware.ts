import type { Request, Response, NextFunction } from "express";

// Extend Express Request type to include auth0UserId
declare global {
    namespace Express {
        interface Request {
            authUserId?: string;
        }
    }
}

/**
 * Auth Middleware.
 * Reads the `X-User-Id` header injected by the Kong API Gateway (which has
 * already validated the Auth0 JWT). If the header is missing the request is
 * rejected with 401 before it reaches any controller.
 *
 * Attaches the value to `req.auth0UserId` so controllers can consume it
 * without repeating the header-extraction / null-check logic.
 */
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const userId = req.headers["x-user-id"];

    if (!userId || typeof userId !== "string") {
        res.status(401).json({
            status: "error",
            message: "Unauthorized.",
            correlationId: req.correlationId,
        });
        return;
    }

    req.authUserId = userId;
    next();
};
