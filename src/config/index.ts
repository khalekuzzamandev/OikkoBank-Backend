import mongoose from "mongoose";

export async function connectToDatabase(): Promise<void> {
  const mongoUrl = process.env.MONGODB_URL;

  if (!mongoUrl) {
    throw new Error("MONGODB_URL is not configured in the environment.");
  }

  await mongoose.connect(mongoUrl);
  console.log("📢 MongoDB connected successfully.");
}
