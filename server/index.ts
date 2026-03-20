import { randomUUID } from "crypto";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { checkDatabaseConnection, closeDatabasePool } from "./db";
import { env, isProduction } from "./config";

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

type LogLevel = "debug" | "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

const logLevelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function sanitizeLogFields(fields: LogFields): LogFields {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
}

function shouldLog(level: LogLevel) {
  return logLevelPriority[level] >= logLevelPriority[env.LOG_LEVEL];
}

function formatErrorFields(error: unknown): LogFields {
  if (error instanceof Error) {
    return sanitizeLogFields({
      errorName: error.name,
      errorMessage: error.message,
      errorStack: env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }

  return { errorMessage: String(error) };
}

function emitLog(
  level: LogLevel,
  message: string,
  source = "express",
  fields: LogFields = {},
) {
  if (!shouldLog(level)) {
    return;
  }

  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    source,
    message,
    ...sanitizeLogFields(fields),
  });

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warn") {
    console.warn(entry);
    return;
  }

  console.log(entry);
}

export function log(message: string, source = "express", fields?: LogFields) {
  emitLog("info", message, source, fields);
}

function logWarn(message: string, source = "express", fields?: LogFields) {
  emitLog("warn", message, source, fields);
}

function logError(message: string, source = "express", fields?: LogFields) {
  emitLog("error", message, source, fields);
}

function originIsAllowed(origin?: string): boolean {
  if (!origin) return true;
  return env.CORS_ALLOWED_ORIGINS.includes(origin);
}

app.use((req, res, next) => {
  const requestIdHeader = req.headers["x-request-id"];
  const requestId =
    typeof requestIdHeader === "string" && requestIdHeader.trim().length > 0
      ? requestIdHeader.trim()
      : randomUUID();

  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
});

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
    res.setHeader("Access-Control-Expose-Headers", "x-request-id");
    res.append("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    if (origin && !originIsAllowed(origin)) {
      logWarn("cors preflight rejected", "http", {
        method: req.method,
        path: req.path,
        origin,
        requestId: res.locals.requestId,
      });

      return res.status(403).json({ message: "Origin not allowed" });
    }

    return res.sendStatus(204);
  }

  return next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log("request completed", "http", {
        requestId: res.locals.requestId,
        method: req.method,
        path,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    }
  });

  next();
});

async function shutdown(signal: string) {
  log("received shutdown signal", "shutdown", { signal });

  httpServer.close(async (serverError) => {
    if (serverError) {
      logError("http server close failed", "shutdown", {
        signal,
        ...formatErrorFields(serverError),
      });
    }

    try {
      await closeDatabasePool();
    } catch (dbError) {
      logError("database pool close failed", "shutdown", {
        signal,
        ...formatErrorFields(dbError),
      });
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

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      code?: string;
      status?: number;
      statusCode?: number;
      message?: string;
    };

    if (error.code === "EBADCSRFTOKEN") {
      logWarn("csrf validation failed", "http", {
        requestId: res.locals.requestId,
        method: _req.method,
        path: _req.path,
        statusCode: 403,
      });

      if (res.headersSent) {
        return next(err);
      }

      return res
        .status(403)
        .json({ message: "Invalid or missing CSRF token" });
    }

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    logError("request failed", "http", {
      requestId: res.locals.requestId,
      method: _req.method,
      path: _req.path,
      statusCode: status,
      ...formatErrorFields(err),
    });

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

  log("server started", "startup", {
    host: env.HOST,
    port: env.PORT,
    environment: env.NODE_ENV,
  });
}

startServer().catch(async (error) => {
  logError("server failed to boot", "startup", formatErrorFields(error));

  try {
    await closeDatabasePool();
  } catch (dbError) {
    logError(
      "startup cleanup failed while closing database pool",
      "startup",
      formatErrorFields(dbError),
    );
  }

  process.exit(1);
});
