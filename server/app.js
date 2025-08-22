import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import { connectToDatabase } from "./config/db.js";
const PORT = 5007;

dotenv.config();

const app = express();
app.use(cors());

// app.use(cors({
//   origin: "http://localhost:5175", // your frontend URL
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true, // if you use cookies/auth
// }));
app.use(express.json());

// Database
await connectToDatabase(process.env.MONGO_URI);

// Routes
app.use("/api", invoiceRoutes);

app.listen(PORT, () => console.log("🚀 Server running on port 5007"));
