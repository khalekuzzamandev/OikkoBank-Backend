import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
  },
  { timestamps: true, strict: false }
);

export const User = model("User", userSchema, "user");