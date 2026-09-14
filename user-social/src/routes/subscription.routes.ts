import { Router } from "express";
import {
    cancelSubscription,
    getCreatorSubscribers,
    getUserSubscriptions,
    subscribeToCreator,
} from "../controllers/subscription.controller.js";

const router = Router();

router.post("/", subscribeToCreator);
router.post("/:id/cancel", cancelSubscription);
router.get("/me", getUserSubscriptions);
router.get("/creator/:creatorId", getCreatorSubscribers);

export default router;
