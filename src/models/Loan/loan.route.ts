import { Router } from "express";
import {
  createLoan,
  deleteLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
} from "./loan.controller.js";

const router = Router();

router.post("/", createLoan);
router.post("/create", createLoan);
router.get("/", getAllLoans);
router.get("/:id", getLoanById);
router.patch("/:id", updateLoan);
router.delete("/:id", deleteLoan);

export default router;