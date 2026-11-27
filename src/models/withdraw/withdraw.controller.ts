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