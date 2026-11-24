import type { Request, Response } from "express";
import {
  createAccountService,
  getAccountByIdService,
  getAllAccountsService,
} from "./account.service.js";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const body: unknown = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body) ||
      Object.keys(body).length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Request body must be a non-empty account object",
      });
      return;
    }

    const account = await createAccountService(body as Record<string, unknown>);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: account,
    });
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllAccountsService(page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Get all accounts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const account = await getAccountByIdService(id);

    if (account === "INVALID_ID") {
      res.status(400).json({ success: false, message: "Invalid account id" });
      return;
    }

    if (!account) {
      res.status(404).json({ success: false, message: "Account not found" });
      return;
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Get account by id error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};