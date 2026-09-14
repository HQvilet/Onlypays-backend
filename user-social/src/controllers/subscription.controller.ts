import type { Request, Response } from "express";

/**
 * Subscribe user to a creator tier.
 */
export const subscribeToCreator = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: subscribeToCreator" });
};

/**
 * Cancel an active subscription.
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: cancelSubscription" });
};

/**
 * Get active subscriptions for current subscriber.
 */
export const getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: getUserSubscriptions" });
};

/**
 * Get list of subscribers for a creator.
 */
export const getCreatorSubscribers = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: getCreatorSubscribers" });
};
