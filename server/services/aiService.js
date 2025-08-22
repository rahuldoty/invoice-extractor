import axios from "axios";

export async function generateSummary(invoice) {
  const apiKey = process.env.COHERE_API_KEY;

  const prompt = `Generate one sentence summary: 
  Invoice ${invoice.invoiceNumber || "unknown"} dated ${invoice.invoiceDate || "unknown"} 
  for ${invoice.customerName || "unknown"} totals ₹${invoice.totalAmount || 0}.`;

  const response = await axios.post(
    "https://api.cohere.ai/v1/generate",
    { model: "command-xlarge-nightly", prompt, max_tokens: 50 },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  return response.data.generations[0].text.trim();
}
