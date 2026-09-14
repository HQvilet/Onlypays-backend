import type { Request, Response } from "express";
import type {
    UpdateUserProfileBody,
    UserIdParam,
    UsernameParam,
} from "../types/user.types.js";
import * as userService from "../services/user.service.js";

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

    console.error("[UserController]", { error, correlationId });
    res.status(500).json({ status: "error", message: "Internal server error.", correlationId });
}

// ---------------------------------------------------------------------------
// Controllers  (req.auth0UserId is guaranteed by authMiddleware on guarded routes)
// ---------------------------------------------------------------------------

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
 * Returns a user's public profile by internal UUID.
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
