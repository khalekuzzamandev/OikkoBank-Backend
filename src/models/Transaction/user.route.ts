import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
} from "./transaction.controller.js";

const router = Router();

router.post("/", createTransaction);
router.post("/create", createTransaction);
router.get("/", getAllTransactions);
router.get("/:id", getTransactionById);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;