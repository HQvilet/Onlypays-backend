import { Router } from "express";
import {
    createTier,
    deleteTier,
    getCreatorTiers,
    getTierById,
    updateTier,
} from "../controllers/tier.controller.js";

const router = Router();

router.get("/creator/:creatorId", getCreatorTiers);
router.get("/:id", getTierById);
router.post("/", createTier);
router.put("/:id", updateTier);
router.delete("/:id", deleteTier);

export default router;
