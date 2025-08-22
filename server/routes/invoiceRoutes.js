import express from "express";
import multer from "multer";
import { uploadInvoice, createInvoice, generateInvoiceSummary } from "../controllers/invoiceController.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Health check
router.get("/health", (req, res) => {
  res.json({ ok: true });
});



router.post("/upload", upload.single("file"), uploadInvoice);
router.post("/invoices", createInvoice);
router.post("/invoices/:id/summary", generateInvoiceSummary);

export default router;


