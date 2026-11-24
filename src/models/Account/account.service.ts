import { isValidObjectId } from "mongoose";
import { Account } from "./account.model.js";

export const createAccountService = async (accountData: Record<string, unknown>) => {
  return Account.create(accountData);
};

export const getAllAccountsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [accounts, total] = await Promise.all([
    Account.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Account.countDocuments(),
  ]);

  return { accounts, total, page, totalPages: Math.ceil(total / limit) };
};

export const getAccountByIdService = async (id: string) => {
  if (!isValidObjectId(id)) return "INVALID_ID" as const;
  return Account.findById(id);
};
