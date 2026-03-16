import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import hpp from "hpp";
import compression from "compression";

import { env } from "./config/env.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import ApiError from "./utils/ApiError.js";

const app = express();

// ── Security ──────────────────────────────────────────
app.use(helmet()); // Secure HTTP headers
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      });
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  next();
}); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP parameter pollution

// ── CORS ──────────────────────────────────────────────
app.use(
  cors({
    origin: env.client.url,
    credentials: true, // Allow cookies to be sent
  })
);

// ── Body Parsing ──────────────────────────────────────
app.use(express.json({ limit: "10kb" })); // Prevent large payload attacks
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// ── Compression ───────────────────────────────────────
app.use(compression());

// ── Logging ───────────────────────────────────────────
if (env.app.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// ── Health Check ──────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// ── Routes ────────────────────────────────────────────
import authRoutes from "./modules/auth/auth.routes.js";
app.use("/api/auth", authRoutes);

import userRoutes from "./modules/users/user.routes.js";
app.use("/api/users", userRoutes);

import profileRoutes from "./modules/profiles/profile.routes.js";
app.use("/api/profiles", profileRoutes);
// ── 404 Handler ───────────────────────────────────────
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
});

// ── Global Error Handler ──────────────────────────────Dula
app.use(errorMiddleware);

export default app;