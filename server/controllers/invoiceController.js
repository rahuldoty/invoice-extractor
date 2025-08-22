import Invoice from "../models/Invoice.js";
import { extractOCR } from "../services/orcService.js";
import { generateSummary } from "../services/aiService.js";

export async function uploadInvoice(req, res) {
  try {
    // Debug step
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ocrRaw = await extractOCR(req.file);

    const draft = {
      invoiceNumber: ocrRaw.invoiceNumber || "",
      invoiceDate: ocrRaw.invoiceDate || "",
      customerName: ocrRaw.customerName || "",
      totalAmount: ocrRaw.totalAmount || ""
    };

    res.json({ draft, ocrRaw });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("🔥 Server error:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
}

export async function createInvoice(req, res) {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: "Save failed", error: err.message });
  }
}

export async function generateInvoiceSummary(req, res) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Not found" });

    const summary = await generateSummary(invoice);
    invoice.summary = summary;
    await invoice.save();

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: "Summary failed", error: err.message });
  }
}


