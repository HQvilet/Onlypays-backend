import type { Request, Response } from "express";
import type {
    TargetUserIdParam,
    UserIdParam,
    FollowPaginationQuery,
} from "../types/follow.types.js";
import * as followService from "../services/follow.service.js";
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

    if (message === "CANNOT_SELF_FOLLOW") {
        res.status(422).json({ status: "error", message: "You cannot follow yourself.", correlationId });
        return;
    }

    childLogger(correlationId).error("[FollowController] Unhandled service error", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ status: "error", message: "Internal server error.", correlationId });
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/follows/:targetUserId
 * Authenticated user follows targetUserId. Idempotent.
 */
export const followUser = async (
    req: Request<TargetUserIdParam>,
    res: Response,
): Promise<void> => {
    const { targetUserId } = req.params;

    if (!targetUserId) {
        res.status(400).json({ status: "error", message: "targetUserId is required." });
        return;
    }

    try {
        const edge = await followService.followUser(req.authUserId!, targetUserId);
        res.status(201).json({ status: "success", data: edge });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * DELETE /api/follows/:targetUserId
 * Authenticated user unfollows targetUserId. Idempotent.
 */
export const unfollowUser = async (
    req: Request<TargetUserIdParam>,
    res: Response,
): Promise<void> => {
    const { targetUserId } = req.params;

    if (!targetUserId) {
        res.status(400).json({ status: "error", message: "targetUserId is required." });
        return;
    }

    try {
        await followService.unfollowUser(req.authUserId!, targetUserId);
        res.status(204).send();
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * GET /api/follows/:userId/followers
 * Returns the paginated list of users who follow userId.
 */
export const getFollowers = async (
    req: Request<UserIdParam, unknown, unknown, FollowPaginationQuery>,
    res: Response,
): Promise<void> => {
    const { userId } = req.params;
    const { cursor, limit } = req.query;

    if (!userId) {
        res.status(400).json({ status: "error", message: "userId is required." });
        return;
    }

    try {
        const result = await followService.getFollowers(
            userId,
            cursor as string | undefined,
            limit ? parseInt(limit as string, 10) : undefined,
        );
        res.status(200).json({ status: "success", ...result });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * GET /api/follows/:userId/following
 * Returns the paginated list of users that userId is following.
 */
export const getFollowing = async (
    req: Request<UserIdParam, unknown, unknown, FollowPaginationQuery>,
    res: Response,
): Promise<void> => {
    const { userId } = req.params;
    const { cursor, limit } = req.query;

    if (!userId) {
        res.status(400).json({ status: "error", message: "userId is required." });
        return;
    }

    try {
        const result = await followService.getFollowing(
            userId,
            cursor as string | undefined,
            limit ? parseInt(limit as string, 10) : undefined,
        );
        res.status(200).json({ status: "success", ...result });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};
