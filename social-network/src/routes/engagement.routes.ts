import { Router } from "express";
import {
    addComment,
    bookmarkPost,
    deleteComment,
    getPostComments,
    getUserBookmarks,
    likePost,
    unbookmarkPost,
    unlikePost,
} from "../controllers/engagement.controller.js";

const router = Router();

// Post Likes
router.post("/posts/:postId/like", likePost);
router.delete("/posts/:postId/like", unlikePost);

// Post Bookmarks
router.post("/posts/:postId/bookmark", bookmarkPost);
router.delete("/posts/:postId/bookmark", unbookmarkPost);
router.get("/bookmarks/me", getUserBookmarks);

// Post Comments
router.get("/posts/:postId/comments", getPostComments);
router.post("/posts/:postId/comments", addComment);
router.delete("/comments/:commentId", deleteComment);

export default router;
