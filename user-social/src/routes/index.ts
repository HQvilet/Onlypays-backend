import { Router } from "express";
import userRoutes from "./user.routes.js";
import tierRoutes from "./tier.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import followRoutes from "./follow.routes.js";
import postRoutes from "./post.routes.js";
import engagementRoutes from "./engagement.routes.js";
import marketplaceRoutes from "./marketplace.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/tiers", tierRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/follows", followRoutes);
router.use("/posts", postRoutes);
router.use("/", engagementRoutes);
router.use("/marketplace", marketplaceRoutes);

export default router;
