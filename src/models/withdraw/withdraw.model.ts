import { Schema, model } from "mongoose";

const withdrawSchema = new Schema(
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
    recipientAccountNumber: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      match: /^\d{9}$/,
      trim: true,
    },
    withdrawalAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    withdrawalMethod: {
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
      enum: ["Withdrawal"],
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

const Withdraw = model("Withdraw", withdrawSchema);

export default Withdraw;