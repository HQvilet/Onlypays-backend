import winston from "winston";

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

// ─── Environment ────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== "production";
const LOG_LEVEL = process.env.LOG_LEVEL || (isDev ? "debug" : "info");

// ─── Pretty format (dev only) ────────────────────────────────────────────────

const devFormat = combine(
    timestamp(),
    errors({ stack: true }),
    printf(({ level, message, timestamp, service, correlationId, ...meta }) => {
        const corr = correlationId ? ` [${correlationId}]` : "";
        const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        return `${timestamp} ${level}${corr} ${message}${extra}`;
    }),
);

// ─── Production JSON format ──────────────────────────────────────────────────

const prodFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json(),
);

// ─── Root logger ─────────────────────────────────────────────────────────────

const logger = winston.createLogger({
    level: LOG_LEVEL,
    defaultMeta: { service: "social-network" },
    format: isDev ? devFormat : prodFormat,
    transports: [
        new winston.transports.Console(),
    ],
    // Do not crash the process on unhandled rejection from a transport
    exitOnError: false,
});

// // ─── Child-logger factory ────────────────────────────────────────────────────

// /**
//  * Returns a child logger pre-seeded with the request's correlation ID.
//  * Use this inside controllers / middleware so every log line is traceable.
//  *
//  * @example
//  * const log = childLogger(req.correlationId);
//  * log.info("Processing request", { userId: req.authUserId });
//  */
// export function childLogger(correlationId?: string): winston.Logger {
//     return logger.child({ correlationId });
// }

export default logger;
