import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { transferService } from "./transfer.service.js";

const isOneOf = <T extends readonly string[]>(
  value: unknown,
  options: T
): value is T[number] =>
  typeof value === "string" && options.some((option) => option === value);

const accountTypes = [
  "Savings",
  "Current",
  "Salary",
  "Student",
  "Fixed Deposit",
] as const;
const transactionStatuses = ["Pending", "Completed", "Failed"] as const;

export const createTransfer = async (req: Request, res: Response) => {
  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ success: false, message: "Invalid request body" });
    return;
  }

  const input = body as Record<string, unknown>;
  if (
    typeof input.accountId !== "string" ||
    !input.accountId.trim() ||
    typeof input.accountName !== "string" ||
    !input.accountName.trim() ||
    typeof input.accountNumber !== "string" ||
    !/^\d{9}$/.test(input.accountNumber) ||
    !isOneOf(input.accountType, accountTypes) ||
    typeof input.recipientAccountNumber !== "string" ||
    !/^\d{9}$/.test(input.recipientAccountNumber) ||
    !isOneOf(input.transactionStatus, transactionStatuses) ||
    input.transactionType !== "Transfer" ||
    typeof input.userEmail !== "string" ||
    !input.userEmail.trim() ||
    typeof input.userId !== "string" ||
    !input.userId.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "All transfer fields must be provided with valid values",
    });
    return;
  }

  if (
    typeof input.availableBalance !== "number" ||
    !Number.isFinite(input.availableBalance) ||
    input.availableBalance < 0 ||
    typeof input.transferAmount !== "number" ||
    !Number.isFinite(input.transferAmount) ||
    input.transferAmount <= 0
  ) {
    res.status(400).json({
      success: false,
      message:
        "Available balance must be non-negative and transfer amount must be positive",
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
    const transfer = await transferService.createTransfer({
      accountId: input.accountId.trim(),
      accountName: input.accountName.trim(),
      accountNumber: input.accountNumber,
      accountType: input.accountType,
      availableBalance: input.availableBalance,
      recipientAccountNumber: input.recipientAccountNumber,
      transactionDate: new Date(input.transactionDate),
      transactionStatus: input.transactionStatus,
      transactionType: "Transfer",
      transferAmount: input.transferAmount,
      userEmail: input.userEmail.trim(),
      userId: input.userId.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Transfer request created successfully",
      data: transfer,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error("Create transfer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllTransfers = async (_req: Request, res: Response) => {
  try {
    const transfers = await transferService.getAllTransfers();
    res.status(200).json({
      success: true,
      message: "Transfers fetched successfully",
      data: transfers,
    });
  } catch (error) {
    console.error("Get transfers error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTransferById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid transfer ID" });
    return;
  }

  try {
    const transfer = await transferService.getTransferById(id);
    if (!transfer) {
      res.status(404).json({ success: false, message: "Transfer not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transfer fetched successfully",
      data: transfer,
    });
  } catch (error) {
    console.error("Get transfer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateTransfer = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid transfer ID" });
    return;
  }

  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ success: false, message: "Invalid request body" });
    return;
  }

  const input = body as Record<string, unknown>;
  const updateData: Record<string, unknown> = {};
  const accountNumberFields = ["accountNumber", "recipientAccountNumber"];
  const allowedFields = [
    "accountName",
    ...accountNumberFields,
    "accountType",
    "availableBalance",
    "transactionDate",
    "transactionStatus",
    "transferAmount",
  ];

  if (Object.keys(input).length === 0) {
    res
      .status(400)
      .json({ success: false, message: "No transfer fields to update" });
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

    if (key === "accountName") {
      if (typeof value !== "string" || !value.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid account name",
        });
        return;
      }
      updateData[key] = value.trim();
    } else if (accountNumberFields.includes(key)) {
      if (typeof value !== "string" || !/^\d{9}$/.test(value)) {
        res.status(400).json({
          success: false,
          message: `'${key}' must be exactly 9 digits`,
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
    } else if (key === "availableBalance" || key === "transferAmount") {
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

  try {
    const transfer = await transferService.updateTransfer(id, updateData);
    if (!transfer) {
      res.status(404).json({ success: false, message: "Transfer not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transfer updated successfully",
      data: transfer,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error("Update transfer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteTransfer = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid transfer ID" });
    return;
  }

  try {
    const transfer = await transferService.deleteTransfer(id);
    if (!transfer) {
      res.status(404).json({ success: false, message: "Transfer not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Transfer deleted successfully",
      data: transfer,
    });
  } catch (error) {
    console.error("Delete transfer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};