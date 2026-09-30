import { Router } from "express";
import {
    createPost,
    deletePost,
    getCreatorPosts,
    getFeedPosts,
    getPostById,
    updatePost,
} from "../controllers/post.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Protected — requires authenticated caller
router.get("/feed", authMiddleware, getFeedPosts);
router.post("/", authMiddleware, createPost);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

// Public — browsable without authentication
router.get("/creator/:creatorId", getCreatorPosts);
router.get("/:id", getPostById);

export default router;
