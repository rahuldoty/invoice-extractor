import axios from "axios";

export async function extractOCR(file) {
  const apiKey = process.env.OCR_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OCR_API_KEY env var. Add it to your .env file.");
  }

  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

  // OCR.space prefers form-encoded or multipart; avoid huge query strings.
  const form = new URLSearchParams();
  form.append("base64Image", base64Image);
  // Optional tuning flags
  form.append("isTable", "true");
  form.append("scale", "true");

  let response;
  try {
    response = await axios.post(
      "https://api.ocr.space/parse/image",
      form.toString(),
      {
        headers: {
          apikey: apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout: 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    const msg = data?.ErrorMessage?.[0] || err.message || "OCR request failed";
    throw new Error(`OCR API error${status ? ` (${status})` : ""}: ${msg}`);
  }

  if (response.data?.IsErroredOnProcessing) {
    const msg = response.data?.ErrorMessage?.[0] || "Unknown OCR processing error";
    throw new Error(`OCR processing error: ${msg}`);
  }

  const text = response.data?.ParsedResults?.[0]?.ParsedText || "";

  // Line-aware parsing for robustness across formats
  const cleaned = text.replace(/\r/g, "").replace(/[\t\f\v]+/g, " ");
  const lines = cleaned
    .split("\n")
    .map(l => l.replace(/\s{2,}/g, " ").trim())
    .filter(Boolean);

  function findByLabels(labels) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const label of labels) {
        const rx = new RegExp(`^${label}[:\s\-]*`, "i");
        if (rx.test(line)) {
          const after = line.replace(rx, "").trim();
          if (after) return after;
          // fallback to next non-empty line
          let j = i + 1;
          while (j < lines.length && !lines[j]) j++;
          if (j < lines.length) return lines[j].trim();
        }
      }
    }
    return "";
  }

  // Invoice Number
  let invoiceNumber = findByLabels([
    "invoice number",
    "invoice no.",
    "invoice no",
    "invoice #",
    "inv no",
    "inv#",
    "bill no",
    "bill number",
    "inv"
  ]);
  if (!invoiceNumber) {
    const m = /(Invoice|Inv\.?|Bill)\s*(No\.|No|#|Number)?[:\s\-]*([A-Za-z0-9\-\/]+)/i.exec(cleaned);
    if (m) invoiceNumber = (m[3] || m[2] || "").trim();
  }

  // Invoice Date
  let invoiceDate = findByLabels([
    "invoice date",
    "date",
    "dated"
  ]);
  if (!invoiceDate) {
    const dateCandidates = cleaned.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},\s*\d{4})/);
    if (dateCandidates) invoiceDate = dateCandidates[0];
  }

  // Customer Name
  let customerName = findByLabels([
    "customer name",
    "customer",
    "billed to",
    "bill to",
    "client",
    "sold to",
    "ship to"
  ]);

  // Total Amount (prefer strong labels, avoid subtotal/tax)
  const penaltyKeywords = /(sub\s*total|tax|cgst|sgst|igst|vat|shipping|delivery|round\s*off|discount)/i;
  function extractAmount(str) {
    const m = str.match(/([₹Rs$]?\s*[\d,.]+(?:\.\d{1,2})?)/i);
    if (!m) return null;
    const num = m[1].replace(/[₹Rs$\s]/gi, "").replace(/,/g, "");
    const n = parseFloat(num);
    return Number.isFinite(n) ? n : null;
  }

  let totalAmount = 0;
  let bestScore = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    const isGrandTotal = /grand\s*total|total\s*amount|amount\s*payable|balance\s*due/.test(lower);
    const isGenericTotal = /^total\b/.test(lower) || /\btotal\b/.test(lower);
    if (penaltyKeywords.test(lower) && !isGrandTotal) continue;
    if (isGrandTotal || isGenericTotal) {
      let candidate = extractAmount(line);
      if (candidate == null && i + 1 < lines.length) candidate = extractAmount(lines[i + 1]);
      if (candidate != null) {
        const score = isGrandTotal ? 2 : 1;
        if (score > bestScore || (score === bestScore && candidate > totalAmount)) {
          totalAmount = candidate;
          bestScore = score;
        }
      }
    }
  }
  if (!totalAmount) {
    // fallback: highest monetary value seen that isn't penalized
    let maxVal = 0;
    for (const line of lines) {
      if (penaltyKeywords.test(line)) continue;
      const val = extractAmount(line);
      if (val != null && val > maxVal) maxVal = val;
    }
    if (maxVal) totalAmount = maxVal;
  }

  return { invoiceNumber, invoiceDate, customerName, totalAmount };
}
