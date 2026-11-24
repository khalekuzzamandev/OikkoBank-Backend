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
  updateAccount,
  deleteAccount,
};
