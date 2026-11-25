
import type { Request, Response } from "express";
import { accountService } from "./account.service.js";

// Create Account
const createAccount = async (req: Request, res: Response) => {
  try {
    const account = await accountService.createAccount(req.body);

    res.status(201).json({
      success: true,
      message: "Bank account created successfully",
      data: account,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message:
        error.code === 11000
          ? "Account number already exists"
          : error.message,
    });
  }
};

// Get All Accounts
const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await accountService.getAllAccounts();

    res.status(200).json({
      success: true,
      message: "Accounts fetched successfully",
      data: accounts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Account
const getAccountById = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.id;
    if (typeof accountId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const account = await accountService.getAccountById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account fetched successfully",
      data: account,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Accounts by User ID
const getAccountsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const accounts = await accountService.getAccountsByUserId(userId);

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No accounts found for this user",
      });
    }

    res.status(200).json({
      success: true,
      message: "User accounts fetched successfully",
      data: accounts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Account
const updateAccount = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.id;
    if (typeof accountId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const account = await accountService.updateAccount(
      accountId,
      req.body
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: account,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Account
const deleteAccount = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.id;
    if (typeof accountId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const account = await accountService.deleteAccount(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bank account deleted successfully",
      data: account,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const accountController = {
  createAccount,
  getAllAccounts,
  getAccountById,
  getAccountsByUserId,
  updateAccount,
  deleteAccount,
};
