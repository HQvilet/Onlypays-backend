import type { Request, Response } from "express";

/**
 * Get list of marketplace collections.
 */
export const getCollections = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: getCollections" });
};

/**
 * Get single marketplace collection by ID.
 */
export const getCollectionById = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: getCollectionById" });
};

/**
 * Create a new marketplace collection bundle.
 */
export const createCollection = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: createCollection" });
};

/**
 * Update an existing marketplace collection.
 */
export const updateCollection = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ status: "error", message: "Not implemented: updateCollection" });
};
