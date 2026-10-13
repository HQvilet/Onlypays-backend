import { Router } from "express";
import {
    createUserWebhook,
    getCurrentUser,
    getUserById,
    getUserByUsername,
    updateUserProfile,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { webhookSecretMiddleware } from "../middleware/webhook.middleware.js";

const router = Router();

// Webhook provisioning — protected by WEBHOOK_SECRET check
router.post("/webhook", webhookSecretMiddleware, createUserWebhook);
router.post("/", webhookSecretMiddleware, createUserWebhook);

// Protected — caller must be authenticated via gateway X-User-Id
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/me", authMiddleware, updateUserProfile);

// Public — no auth required to look up a profile
router.get("/username/:username", getUserByUsername);
router.get("/:id", getUserById);

export default router;
