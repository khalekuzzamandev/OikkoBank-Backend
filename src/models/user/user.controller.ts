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



// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const body: unknown = req.body;

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
      return;
    }

    const input = body as Record<string, unknown>;

    // All editable customer fields
    const allowedFields = [
      "name",
      "email",
      "image",
      "status",
      "fatherName",
      "motherName",
      "dob",
      "gender",
    ] as const;

    // Check invalid fields
    const invalidFields = Object.keys(input).filter(
      (field) => !allowedFields.includes(
        field as (typeof allowedFields)[number]
      )
    );

    if (invalidFields.length > 0) {
      res.status(400).json({
        success: false,
        message: "Some fields are not allowed to update",
        fields: invalidFields,
      });
      return;
    }

    const updates: Record<string, unknown> = {};

    // Validate and prepare updates
    for (const field of allowedFields) {
      if (!(field in input)) continue;

      const value = input[field];

      // Name and Email
      if (field === "name" || field === "email") {
        if (typeof value !== "string" || !value.trim()) {
          res.status(400).json({
            success: false,
            message: `${field} must be a non-empty string`,
          });
          return;
        }

        updates[field] =
          field === "email"
            ? value.trim().toLowerCase()
            : value.trim();

        continue;
      }

      // Image
      if (field === "image") {
        if (typeof value !== "string") {
          res.status(400).json({
            success: false,
            message: "Image must be a string",
          });
          return;
        }

        updates[field] = value.trim();
        continue;
      }

      // Status
      if (field === "status") {
        const allowedStatuses = ["Active", "pending","inactive", "Blocked"];

        if (
          typeof value !== "string" ||
          !allowedStatuses.includes(value)
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid customer status",
          });
          return;
        }

        updates[field] = value;
        continue;
      }

      // Father and Mother Name
      if (field === "fatherName" || field === "motherName") {
        if (typeof value !== "string") {
          res.status(400).json({
            success: false,
            message: `${field} must be a string`,
          });
          return;
        }

        updates[field] = value.trim();
        continue;
      }

      // Date of Birth
      if (field === "dob") {
        if (value === "") {
          updates[field] = null;
        } else if (
          typeof value === "string" &&
          !Number.isNaN(Date.parse(value))
        ) {
          updates[field] = new Date(value);
        } else {
          res.status(400).json({
            success: false,
            message: "Invalid date of birth",
          });
          return;
        }

        continue;
      }

      // Gender
      if (field === "gender") {
        const allowedGenders = ["Male", "Female", "Other"];

        if (
          typeof value !== "string" ||
          (value !== "" && !allowedGenders.includes(value))
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid gender",
          });
          return;
        }

        updates[field] = value;
      }
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
      res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
      return;
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: user,
    });

  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "Email already exists",
      });
      return;
    }

    console.error("Update user error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
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