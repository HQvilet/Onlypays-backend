import { Router } from "express";
import {
    followUser,
    getFollowers,
    getFollowing,
    unfollowUser,
} from "../controllers/follow.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Protected — caller must be authenticated
router.post("/:targetUserId", authMiddleware, followUser);
router.delete("/:targetUserId", authMiddleware, unfollowUser);

// Public — follower and following lists can be queried by userId
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

export default router;
