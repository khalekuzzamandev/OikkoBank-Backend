import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    accountEmail: {
      type: String,
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
      enum: ["Active", "Inactive", "Pending"],
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Savings", "Current", "Salary", "Student", "Fixed Deposit"],
    },
    availableBalance: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      trim: true,
    },
    depositAmount: {
      type: Number,
      min: 0.01,
    },
    depositMethod: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      match: /^\d{9}$/,
      trim: true,
    },
    recipientAccountNumber: {
      type: String,
      trim: true,
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    transactionStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed"],
    },
    transactionType: {
      type: String,
      required: true,
      enum: ["Deposit", "Withdrawal", "Transfer"],
    },
    transferAmount: {
      type: Number,
      min: 0.01,
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
    withdrawalAmount: {
      type: Number,
      min: 0.01,
    },
    withdrawalMethod: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Transaction = model("Transaction", transactionSchema);

export default Transaction;