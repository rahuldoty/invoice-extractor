import mongoose from "mongoose";

export async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI env var. Add it to your .env file.");
  }

  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    // eslint-disable-next-line no-console
    console.log("✅ MongoDB connected");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Mongo error:", err);
    throw err;
  }
}


