import Loan from "./loan.model.js";

type CreateLoanData = {
  accountEmail: string;
  accountId: string;
  accountName: string;
  accountNumber: string;
  accountStatus: "Active" | "Inactive" | "Pending";
  accountType: "Savings" | "Current" | "Salary" | "Student" | "Fixed Deposit";
  additionalNotes?: string;
  applicationDate: Date;
  applicationStatus: "Pending"|"Reviewing"| "Approved" | "Rejected";
  employmentDuration: string;
  loanAmount: number;
  loanDuration: string;
  loanType: string;
  monthlyExpenses: number;
  monthlyIncome: number;
  occupation: string;
  officePhone: string;
  organization: string;
  repaymentMethod: string;
  termsAccepted: true;
  userEmail: string;
  userId: string;
};

const createLoan = async (loanData: CreateLoanData) => {
  return Loan.create(loanData);
};

const getAllLoans = async () => {
  return Loan.find().sort({ createdAt: -1 });
};

const getLoanById = async (id: string) => {
  return Loan.findById(id);
};

const updateLoan = async (id: string, loanData: Record<string, unknown>) => {
  return Loan.findByIdAndUpdate(id, loanData, {
    new: true,
    runValidators: true,
  });
};

const deleteLoan = async (id: string) => {
  return Loan.findByIdAndDelete(id);
};

export const loanService = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
};