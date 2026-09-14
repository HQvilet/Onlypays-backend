import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import { prisma } from "./db/client.js";
import apiRouter from "./routes/index.js";

import { correlationMiddleware } from "./middleware/correlation.middleware.js";
import { idempotencyMiddleware } from "./middleware/idempotency.middleware.js";

const app = express();
const PORT = process.env.PORT || 4001;

// CORS Policy Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Correlation-ID",
        "X-User-Id",
        "X-User-Roles",
        "Idempotency-Key",
        "X-Idempotency-Key",
    ],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Correlation ID Middleware
app.use(correlationMiddleware);

// Health & Readiness Probes
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK", service: "user-social", timestamp: new Date().toISOString() });
});

app.get("/ready", async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "READY", database: "connected" });
    } catch (error) {
        res.status(503).json({ status: "NOT_READY", database: "disconnected", error: (error as Error).message });
    }
});

// API Routes Mounting
app.use("/api", apiRouter);

// 404 Not Found Handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ status: "error", message: "Resource not found" });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled server error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
});

async function startServer() {
    try {
        await prisma.$connect();
        console.log("Connected to PostgreSQL via Prisma Client");

        app.listen(PORT, () => {
            console.log(`User & Social Service listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to database", error);
        process.exit(1);
    }
}

startServer();