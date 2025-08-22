import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI env var. Add it to your .env file.");
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  // eslint-disable-next-line no-console
  console.log("✅ MongoDB connected");
  isConnected = true;
}

export async function ensureDatabaseConnection(mongoUri) {
  if (isConnected) return;
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    isConnected = true;
    return;
  }
  await connectToDatabase(mongoUri);
}


