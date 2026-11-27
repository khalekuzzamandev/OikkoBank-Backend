import { Schema, model } from "mongoose";

const transferSchema = new Schema(
  {
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
      minlength: 9,
      maxlength: 9,
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Savings", "Current", "Salary", "Student", "Fixed Deposit"],
    },
    availableBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    recipientAccountNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: 9,
      maxlength: 9,
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
      enum: ["Transfer"],
    },
    transferAmount: {
      type: Number,
      required: true,
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
  },
  { timestamps: true }
);

const Transfer = model("Transfer", transferSchema);

export default Transfer;