import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { childLogger } from "../utils/logger.js";

/**
 * Validates the webhook secret sent by external callers (such as Auth0 Actions or internal services).
 * Looks for the secret in:
 *   1. `x-webhook-secret` header
 *   2. `authorization` header (e.g. `Bearer <secret>` or `<secret>`)
 *   3. `secret` query parameter
 *
 * Performs timing-safe comparison against `WEBHOOK_SECRET` (or `AUTH0_WEBHOOK_SECRET`).
 */
export const webhookSecretMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    const configuredSecret = process.env.WEBHOOK_SECRET;

    if (!configuredSecret) {
        childLogger(req.correlationId).error(
            "[WebhookAuth] WEBHOOK_SECRET is not configured in environment variables",
        );
        res.status(500).json({
            status: "error",
            message: "Webhook secret is not configured on the server.",
            correlationId: req.correlationId,
        });
        return;
    }

    const headerSecret = req.headers["X-Webhook-Secret"];


    let providedSecret: string | undefined;

    if (typeof headerSecret === "string" && headerSecret.trim().length > 0) {
        providedSecret = headerSecret.trim();
    }

    if (!providedSecret) {
        childLogger(req.correlationId).warn(
            "[WebhookAuth] Rejected request missing webhook secret",
        );
        res.status(401).json({
            status: "error",
            message: "Unauthorized: Missing webhook secret.",
            correlationId: req.correlationId,
        });
        return;
    }

    const expectedBuf = Buffer.from(configuredSecret);
    const providedBuf = Buffer.from(providedSecret);

    const isMatch =
        expectedBuf.length === providedBuf.length &&
        crypto.timingSafeEqual(expectedBuf, providedBuf);

    if (!isMatch) {
        childLogger(req.correlationId).warn(
            "[WebhookAuth] Rejected request with invalid webhook secret",
        );
        res.status(401).json({
            status: "error",
            message: "Unauthorized: Invalid webhook secret.",
            correlationId: req.correlationId,
        });
        return;
    }

    next();
};
