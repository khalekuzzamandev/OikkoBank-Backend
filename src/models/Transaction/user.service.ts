import Transaction from "./transaction.model.js";

const createTransaction = async (transactionData: Record<string, unknown>) => {
  return Transaction.create(transactionData);
};

const getAllTransactions = async () => {
  return Transaction.find().sort({ createdAt: -1 });
};

const getTransactionById = async (id: string) => {
  return Transaction.findById(id);
};

const updateTransaction = async (
  id: string,
  transactionData: Record<string, unknown>
) => {
  return Transaction.findByIdAndUpdate(id, transactionData, {
    new: true,
    runValidators: true,
  });
};

const deleteTransaction = async (id: string) => {
  return Transaction.findByIdAndDelete(id);
};

export const transactionService = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};