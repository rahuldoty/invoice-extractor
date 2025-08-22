import express from "express";
import multer from "multer";
import { uploadInvoice, createInvoice, generateInvoiceSummary } from "../controllers/invoiceController.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Health check
router.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Allow preflight for all routes to avoid 404 on OPTIONS
router.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(204).end();
});

router.post("/upload", upload.single("file"), uploadInvoice);
router.post("/invoices", createInvoice);
router.post("/invoices/:id/summary", generateInvoiceSummary);

export default router;


