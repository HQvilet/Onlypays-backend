import { Redis } from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

export const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        // Retry connection up to 3 times, with exponential delay
        if (times > 3) {
            console.warn("[Redis] Connection retries exhausted. Running without cache.");
            return null;
        }
        return Math.min(times * 100, 2000);
    },
});

redis.on("error", (err) => {
    console.error("[Redis] Client error:", err.message);
});

redis.on("connect", () => {
    console.log("[Redis] Successfully connected to Redis server");
});