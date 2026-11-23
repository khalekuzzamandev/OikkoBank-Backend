import { isValidObjectId } from "mongoose";
import { User } from "./user.model.js";

export const getAllUsersService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

export const getUserByIdService = async (id: string) => {
  if (!isValidObjectId(id)) return "INVALID_ID" as const;
  return User.findById(id).select("-password");
};