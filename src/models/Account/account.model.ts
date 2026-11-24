
import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    staffEmail: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      minlength: 9,
      maxlength: 9,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      required: true,
      enum: ["Savings", "Current", "Salary", "Student", "Fixed Deposit"],
    },
    currency: {
      type: String,
      default: "BDT",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending"],
      default: "Pending",
    },
    accountPurpose: String,
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyTransferLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    monthlyTransferLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    interestRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    branch: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
