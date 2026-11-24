import { Schema, model } from "mongoose";

const accountSchema = new Schema(
  {},
  { timestamps: true, strict: false }
);

export const Account = model("Account", accountSchema, "account");
