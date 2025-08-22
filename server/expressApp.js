import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import { connectToDatabase } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure DB is connected on cold start
await connectToDatabase(process.env.MONGO_URI);

app.use("/api", invoiceRoutes);

export default app;


