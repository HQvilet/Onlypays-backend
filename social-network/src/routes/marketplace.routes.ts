import { Router } from "express";
import {
    createCollection,
    getCollectionById,
    getCollections,
    updateCollection,
} from "../controllers/marketplace.controller.js";

const router = Router();

router.get("/collections", getCollections);
router.get("/collections/:id", getCollectionById);
router.post("/collections", createCollection);
router.put("/collections/:id", updateCollection);

export default router;
