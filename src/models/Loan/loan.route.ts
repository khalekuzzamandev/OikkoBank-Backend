import { Router } from "express";
import {
  createLoan,
  deleteLoan,
  getAllLoans,
  getLoanById,
} from "./loan.controller.js";

const router = Router();

router.post("/", createLoan);
router.post("/create", createLoan);
router.get("/", getAllLoans);
router.get("/:id", getLoanById);
router.delete("/:id", deleteLoan);

export default router;