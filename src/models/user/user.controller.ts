import type { Request, Response } from "express";
import {
  deleteUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
} from "./user.service.js";

// get all user
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllUsersService(page, limit);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// get user by id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await getUserByIdService(id);

    if (user === "INVALID_ID") {
      res.status(400).json({ success: false, message: "Invalid user id" });
      return;
    }

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const body: unknown = req.body;
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      res.status(400).json({ success: false, message: "Invalid request body" });
      return;
    }

    const input = body as Record<string, unknown>;
    const allowedFields = ["name", "email"] as const;
    if (
      Object.keys(input).some(
        (field) => !allowedFields.some((allowedField) => allowedField === field),
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Only name and email can be updated",
      });
      return;
    }

    const updates: { name?: string; email?: string } = {};
    for (const field of allowedFields) {
      if (!(field in input)) continue;
      const value = input[field];
      if (typeof value !== "string" || value.trim() === "") {
        res.status(400).json({
          success: false,
          message: `${field} must be a non-empty string`,
        });
        return;
      }
      updates[field] = value.trim();
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
      return;
    }

    const id = req.params.id as string;
    const user = await updateUserService(id, updates);

    if (user === "INVALID_ID") {
      res.status(400).json({ success: false, message: "Invalid user id" });
      return;
    }

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({ success: false, message: "Email already exists" });
      return;
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// delete user by id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await deleteUserService(id);

    if (user === "INVALID_ID") {
      res.status(400).json({ success: false, message: "Invalid user id" });
      return;
    }

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};