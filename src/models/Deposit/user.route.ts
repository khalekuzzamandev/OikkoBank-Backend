import { Router } from "express";
import {
  createDeposit,
  deleteDeposit,
  getAllDeposits,
  getDepositById,
} from "./deposit.controller.js";

const router = Router();

router.post("/", createDeposit);
router.post("/create", createDeposit);
router.get("/", getAllDeposits);
router.get("/:id", getDepositById);
router.delete("/:id", deleteDeposit);

export default router;