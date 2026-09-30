import type { Request, Response } from "express";

/**
 * Like a post.
 */
export const likePost = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: likePost" });
};

/**
 * Remove like from a post.
 */
export const unlikePost = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: unlikePost" });
};

/**
 * Bookmark a post.
 */
export const bookmarkPost = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: bookmarkPost" });
};

/**
 * Remove bookmark from a post.
 */
export const unbookmarkPost = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: unbookmarkPost" });
};

/**
 * Get bookmarked posts for user.
 */
export const getUserBookmarks = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: getUserBookmarks" });
};

/**
 * Get comments for a post.
 */
export const getPostComments = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: getPostComments" });
};

/**
 * Add a comment or reply to a post.
 */
export const addComment = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: addComment" });
};

/**
 * Delete a comment.
 */
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: deleteComment" });
};
