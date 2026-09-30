import type { Request, Response } from "express";

/**
 * Follow another user/creator.
 */
export const followUser = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: followUser" });
};

/**
 * Unfollow a user/creator.
 */
export const unfollowUser = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: unfollowUser" });
};

/**
 * Get followers list for a user.
 */
export const getFollowers = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: getFollowers" });
};

/**
 * Get user following list.
 */
export const getFollowing = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: getFollowing" });
};
