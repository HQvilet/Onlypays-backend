import type { Request, Response } from "express";
import type {
    CreateUserWebhookBody,
    UpdateUserProfileBody,
    UserIdParam,
    UsernameParam,
} from "../types/user.types.js";
import * as userService from "../services/user.service.js";
import { childLogger } from "../utils/logger.js";

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

function handleServiceError(res: Response, error: unknown, correlationId?: string): void {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "USER_NOT_FOUND") {
        res.status(404).json({ status: "error", message: "User not found.", correlationId });
        return;
    }

    if (message === "FORBIDDEN") {
        res.status(403).json({
            status: "error",
            message: "You do not have permission to perform this action.",
            correlationId,
        });
        return;
    }

    if (message === "INVALID_USER_ID") {
        res.status(400).json({
            status: "error",
            message: "A valid user ID (id, userId, or sub) is required.",
            correlationId,
        });
        return;
    }

    if (message === "INVALID_EMAIL") {
        res.status(400).json({
            status: "error",
            message: "A valid email address is required.",
            correlationId,
        });
        return;
    }

    if (message === "EMAIL_TAKEN") {
        res.status(409).json({
            status: "error",
            message: "Email is already registered by another account.",
            correlationId,
        });
        return;
    }

    if (message === "USERNAME_TAKEN") {
        res.status(409).json({
            status: "error",
            message: "Username is already taken.",
            correlationId,
        });
        return;
    }

    childLogger(correlationId).error("[UserController] Unhandled service error", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ status: "error", message: "Internal server error.", correlationId });
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/users/webhook (or POST /api/users)
 * Provisions/creates a user record from an incoming webhook (e.g. Auth0 Action).
 * Guarded by webhookSecretMiddleware.
 */
export const createUserWebhook = async (
    req: Request<Record<string, never>, unknown, CreateUserWebhookBody>,
    res: Response,
): Promise<void> => {
    try {
        const result = await userService.createUser(req.body);
        const statusCode = result.created ? 201 : 200;
        res.status(statusCode).json({
            status: "success",
            data: result.user,
            created: result.created,
            correlationId: req.correlationId,
        });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * GET /api/users/me
 * Returns the profile of the currently authenticated user.
 */
export const getCurrentUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const profile = await userService.getAuthenticatedUserProfile(req.authUserId!);
        res.status(200).json({ status: "success", data: profile });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * GET /api/users/:id
 * Returns a user's public profile by user ID (Auth0 user ID).
 */
export const getUserById = async (
    req: Request<UserIdParam>,
    res: Response,
): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ status: "error", message: "Invalid user ID." });
        return;
    }

    try {
        const profile = await userService.getUserProfileById(id);
        res.status(200).json({ status: "success", data: profile });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * GET /api/users/username/:username
 * Returns a user's public profile by username.
 */
export const getUserByUsername = async (
    req: Request<UsernameParam>,
    res: Response,
): Promise<void> => {
    const { username } = req.params;

    if (!username) {
        res.status(400).json({ status: "error", message: "Invalid username." });
        return;
    }

    try {
        const profile = await userService.getUserProfileByUsername(username);
        res.status(200).json({ status: "success", data: profile });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * PATCH /api/users/me
 * Updates the authenticated user's mutable profile fields.
 */
export const updateUserProfile = async (
    req: Request<Record<string, never>, unknown, UpdateUserProfileBody>,
    res: Response,
): Promise<void> => {
    const { displayName, bio, avatarUrl, bannerUrl } = req.body;

    if (displayName === undefined && bio === undefined && avatarUrl === undefined && bannerUrl === undefined) {
        res.status(400).json({
            status: "error",
            message: "At least one field must be provided to update.",
        });
        return;
    }

    if (displayName !== undefined && (typeof displayName !== "string" || displayName.trim().length === 0)) {
        res.status(400).json({ status: "error", message: "displayName must be a non-empty string." });
        return;
    }

    const body: UpdateUserProfileBody = {
        ...(displayName !== undefined && { displayName: displayName.trim() }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
    };

    try {
        const updated = await userService.updateUserProfile(req.authUserId!, body);
        res.status(200).json({ status: "success", data: updated });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};
