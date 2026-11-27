import type { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { loanService } from "./user.service.js";

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
const applicationStatuses = ["Pending", "Approved", "Rejected"] as const;

export const createLoan = async (req: Request, res: Response) => {
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
    (input.additionalNotes !== undefined &&
      typeof input.additionalNotes !== "string") ||
    typeof input.employmentDuration !== "string" ||
    !input.employmentDuration.trim() ||
    typeof input.loanDuration !== "string" ||
    !input.loanDuration.trim() ||
    typeof input.loanType !== "string" ||
    !input.loanType.trim() ||
    typeof input.occupation !== "string" ||
    !input.occupation.trim() ||
    typeof input.officePhone !== "string" ||
    !input.officePhone.trim() ||
    typeof input.organization !== "string" ||
    !input.organization.trim() ||
    typeof input.repaymentMethod !== "string" ||
    !input.repaymentMethod.trim() ||
    !isOneOf(input.applicationStatus, applicationStatuses) ||
    input.termsAccepted !== true ||
    typeof input.userEmail !== "string" ||
    !input.userEmail.trim() ||
    typeof input.userId !== "string" ||
    !input.userId.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "All loan fields must be provided with valid values",
    });
    return;
  }

  if (
    typeof input.loanAmount !== "number" ||
    !Number.isFinite(input.loanAmount) ||
    input.loanAmount <= 0 ||
    typeof input.monthlyExpenses !== "number" ||
    !Number.isFinite(input.monthlyExpenses) ||
    input.monthlyExpenses < 0 ||
    typeof input.monthlyIncome !== "number" ||
    !Number.isFinite(input.monthlyIncome) ||
    input.monthlyIncome < 0
  ) {
    res.status(400).json({
      success: false,
      message: "Loan amount must be positive and income/expenses non-negative",
    });
    return;
  }

  if (
    typeof input.applicationDate !== "string" ||
    Number.isNaN(Date.parse(input.applicationDate))
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid application date",
    });
    return;
  }

  try {
    const loan = await loanService.createLoan({
      accountEmail: input.accountEmail.trim(),
      accountId: input.accountId.trim(),
      accountName: input.accountName.trim(),
      accountNumber: input.accountNumber.trim(),
      accountStatus: input.accountStatus,
      accountType: input.accountType,
      ...(typeof input.additionalNotes === "string"
        ? { additionalNotes: input.additionalNotes.trim() }
        : {}),
      applicationDate: new Date(input.applicationDate),
      applicationStatus: input.applicationStatus,
      employmentDuration: input.employmentDuration.trim(),
      loanAmount: input.loanAmount,
      loanDuration: input.loanDuration.trim(),
      loanType: input.loanType.trim(),
      monthlyExpenses: input.monthlyExpenses,
      monthlyIncome: input.monthlyIncome,
      occupation: input.occupation.trim(),
      officePhone: input.officePhone.trim(),
      organization: input.organization.trim(),
      repaymentMethod: input.repaymentMethod.trim(),
      termsAccepted: true,
      userEmail: input.userEmail.trim(),
      userId: input.userId.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Loan application created successfully",
      data: loan,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error("Create loan error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllLoans = async (_req: Request, res: Response) => {
  try {
    const loans = await loanService.getAllLoans();
    res.status(200).json({
      success: true,
      message: "Loan applications fetched successfully",
      data: loans,
    });
  } catch (error) {
    console.error("Get loans error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getLoanById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid loan ID" });
    return;
  }

  try {
    const loan = await loanService.getLoanById(id);
    if (!loan) {
      res.status(404).json({ success: false, message: "Loan not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Loan application fetched successfully",
      data: loan,
    });
  } catch (error) {
    console.error("Get loan error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateLoan = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid loan ID" });
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
    "employmentDuration",
    "loanDuration",
    "loanType",
    "occupation",
    "officePhone",
    "organization",
    "repaymentMethod",
  ];
  const allowedFields = [
    ...stringFields,
    "accountStatus",
    "accountType",
    "additionalNotes",
    "applicationDate",
    "applicationStatus",
    "loanAmount",
    "monthlyExpenses",
    "monthlyIncome",
    "termsAccepted",
  ];

  if (Object.keys(input).length === 0) {
    res.status(400).json({ success: false, message: "No loan fields to update" });
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
    } else if (key === "additionalNotes") {
      if (typeof value !== "string") {
        res.status(400).json({
          success: false,
          message: "Invalid value for 'additionalNotes'",
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
    } else if (key === "applicationStatus") {
      if (!isOneOf(value, applicationStatuses)) {
        res.status(400).json({
          success: false,
          message: "Invalid application status",
        });
        return;
      }
      updateData[key] = value;
    } else if (key === "applicationDate") {
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        res.status(400).json({
          success: false,
          message: "Invalid application date",
        });
        return;
      }
      updateData[key] = new Date(value);
    } else if (
      key === "loanAmount" ||
      key === "monthlyExpenses" ||
      key === "monthlyIncome"
    ) {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        (key === "loanAmount" ? value <= 0 : value < 0)
      ) {
        res.status(400).json({
          success: false,
          message: `Invalid value for '${key}'`,
        });
        return;
      }
      updateData[key] = value;
    } else if (key === "termsAccepted") {
      if (value !== true) {
        res.status(400).json({
          success: false,
          message: "Loan terms must be accepted",
        });
        return;
      }
      updateData[key] = true;
    }
  }

  try {
    const loan = await loanService.updateLoan(id, updateData);
    if (!loan) {
      res.status(404).json({ success: false, message: "Loan not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Loan application updated successfully",
      data: loan,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }

    console.error("Update loan error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteLoan = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "Invalid loan ID" });
    return;
  }

  try {
    const loan = await loanService.deleteLoan(id);
    if (!loan) {
      res.status(404).json({ success: false, message: "Loan not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Loan application deleted successfully",
      data: loan,
    });
  } catch (error) {
    console.error("Delete loan error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};