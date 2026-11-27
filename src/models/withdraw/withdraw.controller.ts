import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { withdrawService } from "./user.service.js";

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

export const createWithdraw = async (req: Request, res: Response) => {
  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ success: false, message: "Invalid request body" });
    return;
  }

  const input = body as Record<string, unknown>;
  if (
    typeof input.accountEmail !== "string" ||
    !input.accountEmail.trim() ||
    typeof input.accountId !== "string" ||
    !input.accountId.trim() ||
    typeof input.accountName !== "string" ||
    !input.accountName.trim() ||
    typeof input.accountNumber !== "string" ||
    !input.accountNumber.trim() ||
    !isOneOf(input.accountStatus, accountStatuses) ||
    !isOneOf(input.accountType, accountTypes) ||
    typeof input.currency !== "string" ||
    !input.currency.trim() ||
    (input.recipientAccountNumber !== undefined &&
      (typeof input.recipientAccountNumber !== "string" ||
        !input.recipientAccountNumber.trim())) ||
    typeof input.withdrawalMethod !== "string" ||
    !input.withdrawalMethod.trim() ||
    !isOneOf(input.transactionStatus, transactionStatuses) ||
    input.transactionType !== "Withdrawal" ||
    typeof input.userEmail !== "string" ||
    !input.userEmail.trim() ||
    typeof input.userId !== "string" ||
    !input.userId.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "All withdrawal fields must be provided with valid values",
    });
    return;
  }

  if (
    typeof input.receiptNumber !== "string" ||
    !/^\d{9}$/.test(input.receiptNumber)
  ) {
    res.status(400).json({
      success: false,
      message: "Receipt number must be exactly 9 digits",
    });
    return;
  }

  if (
    typeof input.withdrawalAmount !== "number" ||
    !Number.isFinite(input.withdrawalAmount) ||
    input.withdrawalAmount <= 0
  ) {
    res.status(400).json({
      success: false,
      message: "Withdrawal amount must be a positive number",
    });
    return;
  }

  if (
    typeof input.transactionDate !== "string" ||
    Number.isNaN(Date.parse(input.transactionDate))
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid transaction date",
    });
    return;
  }

  try {
    const withdraw = await withdrawService.createWithdraw({
      accountEmail: input.accountEmail.trim(),
      accountId: input.accountId.trim(),
      accountName: input.accountName.trim(),
      accountNumber: input.accountNumber.trim(),
      accountStatus: input.accountStatus,
      accountType: input.accountType,
      currency: input.currency.trim(),
      ...(typeof input.recipientAccountNumber === "string"
        ? { recipientAccountNumber: input.recipientAccountNumber.trim() }
        : {}),
      receiptNumber: input.receiptNumber,
      withdrawalAmount: input.withdrawalAmount,
      withdrawalMethod: input.withdrawalMethod.trim(),
      transactionDate: new Date(input.transactionDate),
      transactionStatus: input.transactionStatus,
      transactionType: "Withdrawal",
      userEmail: input.userEmail.trim(),
      userId: input.userId.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal created successfully",
      data: withdraw,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error("Create withdrawal error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllWithdraws = async (_req: Request, res: Response) => {
  try {
    const withdraws = await withdrawService.getAllWithdraws();
    res.status(200).json({
      success: true,
      message: "Withdrawals fetched successfully",
      data: withdraws,
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getWithdrawById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid withdrawal ID" });
    return;
  }

  try {
    const withdraw = await withdrawService.getWithdrawById(id);
    if (!withdraw) {
      res.status(404).json({ success: false, message: "Withdrawal not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Withdrawal fetched successfully",
      data: withdraw,
    });
  } catch (error) {
    console.error("Get withdrawal error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateWithdraw = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid withdrawal ID" });
    return;
  }

  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ success: false, message: "Invalid request body" });
    return;
  }

  const input = body as Record<string, unknown>;
  const updateData: Record<string, unknown> = {};
  const stringFields = [
    "accountName",
    "accountNumber",
    "currency",
    "recipientAccountNumber",
    "receiptNumber",
    "withdrawalMethod",
  ];
  const allowedFields = [
    ...stringFields,
    "accountStatus",
    "accountType",
    "withdrawalAmount",
    "transactionDate",
    "transactionStatus",
  ];

  if (Object.keys(input).length === 0) {
    res
      .status(400)
      .json({ success: false, message: "No withdrawal fields to update" });
    return;
  }

  for (const [key, value] of Object.entries(input)) {
    if (!allowedFields.includes(key)) {
      res.status(400).json({
        success: false,
        message: `Field '${key}' cannot be updated`,
      });
      return;
    }

    if (stringFields.includes(key)) {
      if (typeof value !== "string" || !value.trim()) {
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
      updateData[key] = value.trim();
    } else if (key === "accountStatus") {
      if (!isOneOf(value, accountStatuses)) {
        res.status(400).json({
          success: false,
          message: "Invalid account status",
        });
        return;
      }
      updateData[key] = value;
    } else if (key === "accountType") {
      if (!isOneOf(value, accountTypes)) {
        res.status(400).json({
          success: false,
          message: "Invalid account type",
        });
        return;
      }
      updateData[key] = value;
    } else if (key === "transactionStatus") {
      if (!isOneOf(value, transactionStatuses)) {
        res.status(400).json({
          success: false,
          message: "Invalid transaction status",
        });
        return;
      }
      updateData[key] = value;
    } else if (key === "transactionDate") {
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        res.status(400).json({
          success: false,
          message: "Invalid transaction date",
        });
        return;
      }
      updateData[key] = new Date(value);
    } else if (key === "withdrawalAmount") {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        res.status(400).json({
          success: false,
          message: "Withdrawal amount must be a positive number",
        });
        return;
      }
      updateData[key] = value;
    }
  }

  try {
    const withdraw = await withdrawService.updateWithdraw(id, updateData);
    if (!withdraw) {
      res.status(404).json({ success: false, message: "Withdrawal not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Withdrawal updated successfully",
      data: withdraw,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error("Update withdrawal error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteWithdraw = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid withdrawal ID" });
    return;
  }

  try {
    const withdraw = await withdrawService.deleteWithdraw(id);
    if (!withdraw) {
      res.status(404).json({ success: false, message: "Withdrawal not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Withdrawal deleted successfully",
      data: withdraw,
    });
  } catch (error) {
    console.error("Delete withdrawal error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};