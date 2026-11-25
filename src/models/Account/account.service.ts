import Account from "./account.model.js";

// Create Account
const createAccount = async (accountData: any) => {
  return await Account.create(accountData);
};

// Get All Accounts
const getAllAccounts = async () => {
  return await Account.find().sort({ createdAt: -1 });
};

// Get Single Account
const getAccountById = async (id: string) => {
  return await Account.findById(id);
};

// Get Accounts by User ID
const getAccountsByUserId = async (userId: string) => {
  return await Account.find({ userId }).sort({ createdAt: -1 });
};

// Update Account
const updateAccount = async (id: string, accountData: any) => {
  return await Account.findByIdAndUpdate(id, accountData, {
    new: true,
    runValidators: true,
  });
};

// Delete Account
const deleteAccount = async (id: string) => {
  return await Account.findByIdAndDelete(id);
};

export const accountService = {
  createAccount,
  getAllAccounts,
  getAccountById,
  getAccountsByUserId,
  updateAccount,
  deleteAccount,
};
