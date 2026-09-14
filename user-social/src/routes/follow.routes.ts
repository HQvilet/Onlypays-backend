import { Router } from "express";
import {
    followUser,
    getFollowers,
    getFollowing,
    unfollowUser,
} from "../controllers/follow.controller.js";

const router = Router();

router.post("/:targetUserId", followUser);
router.delete("/:targetUserId", unfollowUser);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

export default router;
