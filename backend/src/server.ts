import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { ApiError } from "./utils/ApiError";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import auditRoutes from "./routes/audit.routes";
import tenderRoutes from "./routes/tender.routes";
import clarificationRoutes from "./routes/clarification.routes";
import bidRoutes from "./routes/bid.routes";
import evaluationRoutes from "./routes/evaluation.routes";
import debriefingRoutes from "./routes/debriefing.routes";
import notificationRoutes from "./routes/notification.routes";
import reportRoutes from "./routes/report.routes";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploaded documents
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Tender Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/tenders", tenderRoutes);
app.use("/api/clarifications", clarificationRoutes);
app.use("/api", bidRoutes);
app.use("/api", evaluationRoutes);
app.use("/api", debriefingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
