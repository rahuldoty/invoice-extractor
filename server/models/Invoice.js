import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  invoiceDate: String,
  customerName: String,
  totalAmount: Number,
  summary: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Invoice", invoiceSchema);
