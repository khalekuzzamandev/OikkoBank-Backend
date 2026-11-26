import Deposit from "./user.model.js";

type CreateDepositData = {
  accountEmail: string;
  accountId: string;
  accountName: string;
  accountNumber: string;
  accountStatus: "Active" | "Inactive" | "Pending";
  accountType: "Savings" | "Current" | "Salary" | "Student" | "Fixed Deposit";
  currency: string;
  depositAmount: number;
  depositMethod: string;
  transactionDate: Date;
  transactionStatus: "Pending" | "Completed" | "Failed";
  transactionType: "Deposit";
  userEmail: string;
  userId: string;
};

const createDeposit = async (depositData: CreateDepositData) => {
  return Deposit.create(depositData);
};

const getAllDeposits = async () => {
  return Deposit.find().sort({ createdAt: -1 });
};

const getDepositById = async (id: string) => {
  return Deposit.findById(id);
};

export const depositService = {
  createDeposit,
  getAllDeposits,
  getDepositById,
};