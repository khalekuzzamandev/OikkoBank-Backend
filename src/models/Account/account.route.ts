import { Router } from "express";
import {
  createAccount,
  getAccountById,
  getAllAccounts,
} from "./account.controller.js";

const router = Router();

router.post("/", createAccount);
router.get("/", getAllAccounts);
router.get("/:id", getAccountById);

export default router;
