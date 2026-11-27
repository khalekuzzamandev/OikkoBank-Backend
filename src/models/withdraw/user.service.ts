import Withdraw from "./withdraw.model.js";

type CreateWithdrawData = {
  accountEmail: string;
  accountId: string;
  accountName: string;
  accountNumber: string;
  accountStatus: "Active" | "Inactive" | "Pending";
  accountType: "Savings" | "Current" | "Salary" | "Student" | "Fixed Deposit";
  currency: string;
  recipientAccountNumber: string;
  withdrawalAmount: number;
  withdrawalMethod: string;
  transactionDate: Date;
  transactionStatus: "Pending" | "Completed" | "Failed";
  transactionType: "Withdrawal";
  userEmail: string;
  userId: string;
};

const createWithdraw = async (withdrawData: CreateWithdrawData) => {
  return Withdraw.create(withdrawData);
};

const getAllWithdraws = async () => {
  return Withdraw.find().sort({ createdAt: -1 });
};

const getWithdrawById = async (id: string) => {
  return Withdraw.findById(id);
};

const deleteWithdraw = async (id: string) => {
  return Withdraw.findByIdAndDelete(id);
};

export const withdrawService = {
  createWithdraw,
  getAllWithdraws,
  getWithdrawById,
  deleteWithdraw,
};