import { Router } from "express";
import {
  createWithdraw,
  deleteWithdraw,
  getAllWithdraws,
  getWithdrawById,
} from "./withdraw.controller.js";

const router = Router();

router.post("/", createWithdraw);
router.post("/create", createWithdraw);
router.get("/", getAllWithdraws);
router.get("/:id", getWithdrawById);
router.delete("/:id", deleteWithdraw);

export default router;