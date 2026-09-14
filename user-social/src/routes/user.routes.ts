import { Router } from "express";
import {
    getCurrentUser,
    getUserById,
    getUserByUsername,
    updateUserProfile,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Protected — caller must be authenticated
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/me", authMiddleware, updateUserProfile);

// Public — no auth required to look up a profile
router.get("/username/:username", getUserByUsername);
router.get("/:id", getUserById);

export default router;
