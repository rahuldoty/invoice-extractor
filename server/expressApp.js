import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import { ensureDatabaseConnection } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Lightweight health endpoint (no DB)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// Ensure DB is connected per request (lazy connect for serverless)
app.use(async (req, res, next) => {
  try {
    await ensureDatabaseConnection(process.env.MONGO_URI);
    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("DB connect error:", err);
    res.status(500).json({ message: "Database connection error" });
  }
});

// Support both '/api/*' and bare '/*' when routed via Vercel
app.use("/api", invoiceRoutes);
app.use("/", invoiceRoutes);

export default app;


