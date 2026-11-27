import { Schema, model } from "mongoose";

const loanSchema = new Schema(
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
    additionalNotes: {
      type: String,
      trim: true,
      default: "",
    },
    applicationDate: {
      type: Date,
      required: true,
    },
    applicationStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Reviewing", "Approved", "Rejected"],
      default: "Pending",
    },
    employmentDuration: {
      type: String,
      required: true,
      trim: true,
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    loanDuration: {
      type: String,
      required: true,
      trim: true,
    },
    loanType: {
      type: String,
      required: true,
      trim: true,
    },
    monthlyExpenses: {
      type: Number,
      required: true,
      min: 0,
    },
    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    officePhone: {
      type: String,
      required: true,
      trim: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    repaymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    termsAccepted: {
      type: Boolean,
      required: true,
      validate: {
        validator: (accepted: boolean) => accepted,
        message: "Loan terms must be accepted",
      },
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

const Loan = model("Loan", loanSchema);

export default Loan;