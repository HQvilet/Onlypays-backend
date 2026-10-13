import { Router } from "express";
import userRoutes from "./user.routes.js";
import followRoutes from "./follow.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/follows", followRoutes);

export default router;
