import Transfer from "./transfer.model.js";

type CreateTransferData = {
  accountId: string;
  accountName: string;
  accountNumber: string;
  accountType: "Savings" | "Current" | "Salary" | "Student" | "Fixed Deposit";
  availableBalance: number;
  recipientAccountNumber: string;
  transactionDate: Date;
  transactionStatus: "Pending" | "Completed" | "Failed";
  transactionType: "Transfer";
  transferAmount: number;
  userEmail: string;
  userId: string;
};

const createTransfer = async (transferData: CreateTransferData) => {
  return Transfer.create(transferData);
};

const getAllTransfers = async () => {
  return Transfer.find().sort({ createdAt: -1 });
};

const getTransferById = async (id: string) => {
  return Transfer.findById(id);
};

const updateTransfer = async (
  id: string,
  transferData: Record<string, unknown>
) => {
  return Transfer.findByIdAndUpdate(id, transferData, {
    new: true,
    runValidators: true,
  });
};

export const transferService = {
  createTransfer,
  getAllTransfers,
  getTransferById,
  updateTransfer,
};