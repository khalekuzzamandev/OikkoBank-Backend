import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { transactionService } from "./user.service.js";

const isOneOf = <T extends readonly string[]>(
  value: unknown,
  options: T
): value is T[number] =>
  typeof value === "string" && options.some((option) => option === value);

const accountStatuses = ["Active", "Inactive", "Pending"] as const;
const accountTypes = [
  "Savings",
  "Current",
  "Salary",
  "Student",
  "Fixed Deposit",
] as const;
const transactionStatuses = ["Pending", "Completed", "Failed"] as const;
const transactionTypes = ["Deposit", "Withdrawal", "Transfer"] as const;

type TransactionCreateData = {
  accountId: string;
  accountName: string;
  accountNumber: string;
  accountType: (typeof accountTypes)[number];
  transactionDate: Date;
  transactionStatus: (typeof transactionStatuses)[number];
  transactionType: (typeof transactionTypes)[number];
  userEmail: string;
  userId: string;
  accountEmail?: string;
  accountStatus?: (typeof accountStatuses)[number];
  availableBalance?: number;
  currency?: string;
  depositAmount?: number;
  depositMethod?: string;
  receiptNumber?: string;
  recipientAccountNumber?: string;
  transferAmount?: number;
  withdrawalAmount?: number;
  withdrawalMethod?: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const parseCreateTransaction = (
  input: Record<string, unknown>
): { data?: TransactionCreateData; error?: string } => {
  if (
    !isNonEmptyString(input.accountId) ||
    !isNonEmptyString(input.accountName) ||
    !isNonEmptyString(input.accountNumber) ||
    !isOneOf(input.accountType, accountTypes) ||
    !isOneOf(input.transactionStatus, transactionStatuses) ||
    !isOneOf(input.transactionType, transactionTypes) ||
    !isNonEmptyString(input.userEmail) ||
    !isNonEmptyString(input.userId)
  ) {
    return { error: "Required transaction fields are missing or invalid" };
  }

  if (
    typeof input.transactionDate !== "string" ||
    Number.isNaN(Date.parse(input.transactionDate))
  ) {
    return { error: "Invalid transaction date" };
  }

  const data: TransactionCreateData = {
    accountId: input.accountId.trim(),
    accountName: input.accountName.trim(),
    accountNumber: input.accountNumber.trim(),
    accountType: input.accountType,
    transactionDate: new Date(input.transactionDate),
    transactionStatus: input.transactionStatus,
    transactionType: input.transactionType,
    userEmail: input.userEmail.trim(),
    userId: input.userId.trim(),
  };

  if (input.transactionType === "Deposit") {
    if (
      !isNonEmptyString(input.accountEmail) ||
      !isOneOf(input.accountStatus, accountStatuses) ||
      !isNonEmptyString(input.currency) ||
      !isNonEmptyString(input.depositMethod)
    ) {
      return { error: "Required deposit fields are missing or invalid" };
    }
    if (
      typeof input.depositAmount !== "number" ||
      !Number.isFinite(input.depositAmount) ||
      input.depositAmount <= 0
    ) {
      return { error: "Deposit amount must be a positive number" };
    }
    Object.assign(data, {
      accountEmail: input.accountEmail.trim(),
      accountStatus: input.accountStatus,
      currency: input.currency.trim(),
      depositAmount: input.depositAmount,
      depositMethod: input.depositMethod.trim(),
    });
  } else if (input.transactionType === "Withdrawal") {
    if (
      !isNonEmptyString(input.accountEmail) ||
      !isOneOf(input.accountStatus, accountStatuses) ||
      !isNonEmptyString(input.currency) ||
      !isNonEmptyString(input.withdrawalMethod) ||
      typeof input.receiptNumber !== "string" ||
      !/^\d{9}$/.test(input.receiptNumber)
    ) {
      return { error: "Required withdrawal fields are missing or invalid" };
    }
    if (
      typeof input.withdrawalAmount !== "number" ||
      !Number.isFinite(input.withdrawalAmount) ||
      input.withdrawalAmount <= 0
    ) {
      return { error: "Withdrawal amount must be a positive number" };
    }
    if (
      input.recipientAccountNumber !== undefined &&
      !isNonEmptyString(input.recipientAccountNumber)
    ) {
      return { error: "Invalid recipient account number" };
    }
    Object.assign(data, {
      accountEmail: input.accountEmail.trim(),
      accountStatus: input.accountStatus,
      currency: input.currency.trim(),
      receiptNumber: input.receiptNumber,
      withdrawalAmount: input.withdrawalAmount,
      withdrawalMethod: input.withdrawalMethod.trim(),
      ...(typeof input.recipientAccountNumber === "string"
        ? { recipientAccountNumber: input.recipientAccountNumber.trim() }
        : {}),
    });
  } else {
    if (
      !/^\d{9}$/.test(input.accountNumber) ||
      typeof input.recipientAccountNumber !== "string" ||
      !/^\d{9}$/.test(input.recipientAccountNumber)
    ) {
      return {
        error: "Transfer account numbers must be exactly 9 digits",
      };
    }
    if (
      typeof input.availableBalance !== "number" ||
      !Number.isFinite(input.availableBalance) ||
      input.availableBalance < 0 ||
      typeof input.transferAmount !== "number" ||
      !Number.isFinite(input.transferAmount) ||
      input.transferAmount <= 0
    ) {
      return {
        error: "Available balance must be non-negative and transfer amount positive",
      };
    }
    Object.assign(data, {
      availableBalance: input.availableBalance,
      recipientAccountNumber: input.recipientAccountNumber,
      transferAmount: input.transferAmount,
    });
  }

  return { data };
};

export const createTransaction = async (req: Request, res: Response) => {
  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ success: false, message: "Invalid request body" });
    return;
  }

  const parsed = parseCreateTransaction(body as Record<string, unknown>);
  if (!parsed.data) {
    res.status(400).json({
      success: false,
      message: parsed.error ?? "Invalid transaction data",
    });
    return;
  }

  try {
    const transaction = await transactionService.createTransaction(parsed.data);
    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    console.error("Create transaction error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await transactionService.getAllTransactions();
    res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid transaction ID" });
    return;
  }

  try {
    const transaction = await transactionService.getTransactionById(id);
    if (!transaction) {
      res.status(404).json({ success: false, message: "Transaction not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid transaction ID" });
    return;
  }

  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ success: false, message: "Invalid request body" });
    return;
  }

  const input = body as Record<string, unknown>;
  if (Object.keys(input).length === 0) {
    res
      .status(400)
      .json({ success: false, message: "No transaction fields to update" });
    return;
  }

  try {
    const existing = await transactionService.getTransactionById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: "Transaction not found" });
      return;
    }

    const stringFields = [
      "accountEmail",
      "accountName",
      "accountNumber",
      "currency",
      "depositMethod",
      "recipientAccountNumber",
      "receiptNumber",
      "withdrawalMethod",
    ];
    const commonFields = [
      ...stringFields,
      "accountStatus",
      "accountType",
      "transactionDate",
      "transactionStatus",
    ];
    const typeFields =
      existing.transactionType === "Deposit"
        ? ["depositAmount", "depositMethod"]
        : existing.transactionType === "Withdrawal"
          ? ["receiptNumber", "recipientAccountNumber", "withdrawalAmount", "withdrawalMethod"]
          : ["availableBalance", "recipientAccountNumber", "transferAmount"];
    const allowedFields = new Set([...commonFields, ...typeFields]);
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (!allowedFields.has(key)) {
        res.status(400).json({
          success: false,
          message: `Field '${key}' cannot be updated`,
        });
        return;
      }

      if (stringFields.includes(key)) {
        if (!isNonEmptyString(value)) {
          res.status(400).json({
            success: false,
            message: `Invalid value for '${key}'`,
          });
          return;
        }
        if (key === "receiptNumber" && !/^\d{9}$/.test(value)) {
          res.status(400).json({
            success: false,
            message: "Receipt number must be exactly 9 digits",
          });
          return;
        }
        if (
          key === "recipientAccountNumber" &&
          existing.transactionType === "Transfer" &&
          !/^\d{9}$/.test(value)
        ) {
          res.status(400).json({
            success: false,
            message: "Recipient account number must be exactly 9 digits",
          });
          return;
        }
        updateData[key] = value.trim();
      } else if (key === "accountStatus") {
        if (!isOneOf(value, accountStatuses)) {
          res
            .status(400)
            .json({ success: false, message: "Invalid account status" });
          return;
        }
        updateData[key] = value;
      } else if (key === "accountType") {
        if (!isOneOf(value, accountTypes)) {
          res
            .status(400)
            .json({ success: false, message: "Invalid account type" });
          return;
        }
        updateData[key] = value;
      } else if (key === "transactionStatus") {
        if (!isOneOf(value, transactionStatuses)) {
          res
            .status(400)
            .json({ success: false, message: "Invalid transaction status" });
          return;
        }
        updateData[key] = value;
      } else if (key === "transactionDate") {
        if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
          res
            .status(400)
            .json({ success: false, message: "Invalid transaction date" });
          return;
        }
        updateData[key] = new Date(value);
      } else {
        if (
          typeof value !== "number" ||
          !Number.isFinite(value) ||
          (key === "availableBalance" ? value < 0 : value <= 0)
        ) {
          res.status(400).json({
            success: false,
            message: `Invalid value for '${key}'`,
          });
          return;
        }
        updateData[key] = value;
      }
    }

    const transaction = await transactionService.updateTransaction(
      id,
      updateData
    );
    if (!transaction) {
      res.status(404).json({ success: false, message: "Transaction not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    console.error("Update transaction error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid transaction ID" });
    return;
  }

  try {
    const transaction = await transactionService.deleteTransaction(id);
    if (!transaction) {
      res.status(404).json({ success: false, message: "Transaction not found" });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};