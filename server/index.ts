import express, { type Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { checkDatabaseConnection, closeDatabasePool } from "./db";
import { env, isProduction } from "./config";
import { logger } from "./logger";

const app = express();
const httpServer = createServer(app);
const startedAt = Date.now();

app.disable("x-powered-by");

if (isProduction) {
  app.set("trust proxy", 1);
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function originIsAllowed(origin?: string): boolean {
  if (!origin) return true;
  return env.CORS_ALLOWED_ORIGINS.includes(origin);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && originIsAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-csrf-token",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.append("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    if (origin && !originIsAllowed(origin)) {
      return res.status(403).json({ message: "Origin not allowed" });
    }

    return res.sendStatus(204);
  }

  return next();
});

// ── Security headers (CSP, HSTS, etc.) ──
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  if (isProduction) {
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.openai.com",
        "font-src 'self' https://fonts.gstatic.com",
        "frame-ancestors 'none'",
      ].join("; "),
    );
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  next();
});

// ── Compression ──
app.use(compression());

// ── Global API rate limiting ──
app.use(
  "/api/",
  rateLimit({
    windowMs: 60_000,
    max: env.NODE_ENV === "test" ? 10_000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  }),
);

// ── Body parsing with size limits ──
app.use(
  express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "1mb" }));

app.get("/health", async (_req, res) => {
  const dbStatus = await checkDatabaseConnection();
  const healthy = dbStatus.ok;

  res
    .status(healthy ? 200 : 503)
    .json({
      status: healthy ? "ok" : "degraded",
      service: "adaptive-business-suite-backend",
      environment: env.NODE_ENV,
      database: healthy ? "up" : "down",
      aiProvider: env.AI_PROVIDER,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    });
});

export function log(message: string, source = "express") {
  logger.info({ source }, message);
}

// ── Request ID + structured logging ──
app.use((req, res, next) => {
  const reqId = randomUUID();
  res.setHeader("X-Request-Id", reqId);
  (req as any).reqId = reqId;

  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      logger.info({
        reqId,
        method: req.method,
        path,
        status: res.statusCode,
        durationMs: duration,
      }, `${req.method} ${path} ${res.statusCode}`);
    }
  });

  next();
});

async function shutdown(signal: string) {
  logger.info({ signal }, "received signal, closing server");

  httpServer.close(async (serverError) => {
    if (serverError) {
      logger.error({ err: serverError }, "HTTP server close failed");
    }

    try {
      await closeDatabasePool();
    } catch (dbError) {
      logger.error({ err: dbError }, "database pool close failed");
    } finally {
      process.exit(serverError ? 1 : 0);
    }
  });
}

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

async function startServer() {
  const dbStatus = await checkDatabaseConnection();
  if (!dbStatus.ok) {
    throw dbStatus.error;
  }

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err?.code === "EBADCSRFTOKEN") {
      if (res.headersSent) {
        return next(err);
      }

      return res
        .status(403)
        .json({ message: "Invalid or missing CSRF token" });
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error({ err, reqId: ((_req as any).reqId) }, "Internal Server Error");

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(
      {
        port: env.PORT,
        host: env.HOST,
      },
      resolve,
    );
  });

  logger.info({ host: env.HOST, port: env.PORT, env: env.NODE_ENV }, "server started");
}

startServer().catch(async (error) => {
  logger.fatal({ err: error }, "failed to boot");

  try {
    await closeDatabasePool();
  } catch (dbError) {
    logger.error({ err: dbError }, "failed to close database pool on startup failure");
  }

  process.exit(1);
});
