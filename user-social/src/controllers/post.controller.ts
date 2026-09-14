import type { Request, Response } from "express";
import type {
    CreatePostBody,
    UpdatePostBody,
    PostIdParam,
    CreatorIdParam,
    PaginationQuery,
} from "../types/post.types.js";
import * as postService from "../services/post.service.js";

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

function handleServiceError(res: Response, error: unknown, correlationId?: string): void {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "POST_NOT_FOUND" || message === "CREATOR_NOT_FOUND") {
        res.status(404).json({ status: "error", message: "Post not found.", correlationId });
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

    console.error("[PostController]", { error, correlationId });
    res.status(500).json({ status: "error", message: "Internal server error.", correlationId });
}

// ---------------------------------------------------------------------------
// Controllers  (req.authUserId is guaranteed by authMiddleware on guarded routes)
// ---------------------------------------------------------------------------

/**
 * POST /api/posts
 * Creates a new feed post for the authenticated creator.
 */
export const createPost = async (
    req: Request<Record<string, never>, unknown, CreatePostBody>,
    res: Response,
): Promise<void> => {
    const body = req.body;

    if (body.attachments !== undefined && !Array.isArray(body.attachments)) {
        res.status(400).json({ status: "error", message: "attachments must be an array." });
        return;
    }

    if (Array.isArray(body.attachments)) {
        for (const att of body.attachments) {
            if (!att.mediaId || typeof att.mediaId !== "string") {
                res.status(400).json({
                    status: "error",
                    message: "Each attachment must have a valid mediaId (UUID string).",
                });
                return;
            }
            if (!att.mediaType) {
                res.status(400).json({
                    status: "error",
                    message: "Each attachment must have a mediaType (IMAGE | VIDEO | AUDIO).",
                });
                return;
            }
        }
    }

    try {
        const post = await postService.createPost(req.authUserId!, body);
        res.status(201).json({ status: "success", data: post });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * GET /api/posts/:id
 * Returns post details by post UUID.
 */
export const getPostById = async (
    req: Request<PostIdParam>,
    res: Response,
): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ status: "error", message: "Invalid post ID." });
        return;
    }

    try {
        const post = await postService.getPostById(id);
        res.status(200).json({ status: "success", data: post });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * PUT /api/posts/:id
 * Updates an existing post. Only the owner creator may update it.
 */
export const updatePost = async (
    req: Request<PostIdParam, unknown, UpdatePostBody>,
    res: Response,
): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ status: "error", message: "Invalid post ID." });
        return;
    }

    const body = req.body;

    if (
        body.caption === undefined &&
        body.visibility === undefined &&
        body.requiredTierId === undefined &&
        body.priceOpx === undefined &&
        body.status === undefined
    ) {
        res.status(400).json({
            status: "error",
            message: "At least one field must be provided to update.",
        });
        return;
    }

    try {
        const post = await postService.updatePost(req.authUserId!, id, body);
        res.status(200).json({ status: "success", data: post });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * DELETE /api/posts/:id
 * Soft-deletes a post. Only the owner creator may delete it.
 */
export const deletePost = async (
    req: Request<PostIdParam>,
    res: Response,
): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ status: "error", message: "Invalid post ID." });
        return;
    }

    try {
        await postService.deletePost(req.authUserId!, id);
        res.status(204).send();
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * GET /api/posts/feed
 * Returns a cursor-paginated feed of posts from followed creators.
 */
export const getFeedPosts = async (
    req: Request<Record<string, never>, unknown, never, PaginationQuery>,
    res: Response,
): Promise<void> => {
    const { cursor, limit } = req.query;

    try {
        const result = await postService.getFeedPosts(req.authUserId!, cursor, limit);
        res.status(200).json({ status: "success", ...result });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};

/**
 * GET /api/posts/creator/:creatorId
 * Returns a cursor-paginated list of published posts by a specific creator.
 */
export const getCreatorPosts = async (
    req: Request<CreatorIdParam, unknown, never, PaginationQuery>,
    res: Response,
): Promise<void> => {
    const { creatorId } = req.params;

    if (!creatorId) {
        res.status(400).json({ status: "error", message: "Invalid creator ID." });
        return;
    }

    const { cursor, limit } = req.query;

    try {
        const result = await postService.getCreatorPosts(creatorId, cursor, limit);
        res.status(200).json({ status: "success", ...result });
    } catch (error) {
        handleServiceError(res, error, req.correlationId);
    }
};
