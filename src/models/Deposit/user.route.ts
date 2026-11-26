import { Router } from "express";
import {
  createDeposit,
  getAllDeposits,
  getDepositById,
} from "./deposit.controller.js";

const router = Router();

router.post("/", createDeposit);
router.post("/create", createDeposit);
router.get("/", getAllDeposits);
router.get("/:id", getDepositById);

export default router;