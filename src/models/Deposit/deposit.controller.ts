import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { depositService } from "./user.service.js";

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

export const createDeposit = async (req: Request, res: Response) => {
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
    typeof input.depositMethod !== "string" ||
    !input.depositMethod.trim() ||
    !isOneOf(input.transactionStatus, transactionStatuses) ||
    input.transactionType !== "Deposit" ||
    typeof input.userEmail !== "string" ||
    !input.userEmail.trim() ||
    typeof input.userId !== "string" ||
    !input.userId.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "All deposit fields must be provided with valid values",
    });
    return;
  }

  if (
    typeof input.depositAmount !== "number" ||
    !Number.isFinite(input.depositAmount) ||
    input.depositAmount <= 0
  ) {
    res.status(400).json({
      success: false,
      message: "Deposit amount must be a positive number",
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
    const deposit = await depositService.createDeposit({
      accountEmail: input.accountEmail.trim(),
      accountId: input.accountId.trim(),
      accountName: input.accountName.trim(),
      accountNumber: input.accountNumber.trim(),
      accountStatus: input.accountStatus,
      accountType: input.accountType,
      currency: input.currency.trim(),
      depositAmount: input.depositAmount,
      depositMethod: input.depositMethod.trim(),
      transactionDate: new Date(input.transactionDate),
      transactionStatus: input.transactionStatus,
      transactionType: input.transactionType,
      userEmail: input.userEmail.trim(),
      userId: input.userId.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Deposit created successfully",
      data: deposit,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error("Create deposit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllDeposits = async (_req: Request, res: Response) => {
  try {
    const deposits = await depositService.getAllDeposits();
    res.status(200).json({
      success: true,
      message: "Deposits fetched successfully",
      data: deposits,
    });
  } catch (error) {
    console.error("Get deposits error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDepositById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid deposit ID" });
    return;
  }

  try {
    const deposit = await depositService.getDepositById(id);
    if (!deposit) {
      res.status(404).json({ success: false, message: "Deposit not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Deposit fetched successfully",
      data: deposit,
    });
  } catch (error) {
    console.error("Get deposit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDeposit = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid deposit ID" });
    return;
  }

  const body: unknown = req.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ success: false, message: "Invalid request body" });
    return;
  }

  const input = body as Record<string, unknown>;
  const stringFields = [
    "accountName",
    "accountNumber",
    "currency",
    "depositMethod",
  ];
  const allowedFields = [
    ...stringFields,
    "accountStatus",
    "accountType",
    "depositAmount",
    "transactionDate",
    "transactionStatus",
  ];
  const updateData: Record<string, unknown> = {};

  if (Object.keys(input).length === 0) {
    res
      .status(400)
      .json({ success: false, message: "No deposit fields to update" });
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
    } else if (key === "depositAmount") {
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        res.status(400).json({
          success: false,
          message: "Deposit amount must be a positive number",
        });
        return;
      }
      updateData[key] = value;
    }
  }

  try {
    const deposit = await depositService.updateDeposit(id, updateData);
    if (!deposit) {
      res.status(404).json({ success: false, message: "Deposit not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Deposit updated successfully",
      data: deposit,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error("Update deposit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteDeposit = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid deposit ID" });
    return;
  }

  try {
    const deposit = await depositService.deleteDeposit(id);
    if (!deposit) {
      res.status(404).json({ success: false, message: "Deposit not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Deposit deleted successfully",
      data: deposit,
    });
  } catch (error) {
    console.error("Delete deposit error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};