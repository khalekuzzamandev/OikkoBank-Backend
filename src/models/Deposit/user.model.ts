import { Schema, model } from "mongoose";

const depositSchema = new Schema(
  {
    accountEmail: {
      type: String,
      required: true,
      trim: true,
    },
    accountId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountStatus: {
      type: String,
      required: true,
      enum: ["Active", "Inactive", "Pending"],
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Savings", "Current", "Salary", "Student", "Fixed Deposit"],
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    depositMethod: {
      type: String,
      required: true,
      trim: true,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    transactionStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["Deposit"],
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Deposit = model("Deposit", depositSchema);

export default Deposit;