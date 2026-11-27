import { Router } from "express";
import {
  createTransfer,
  getAllTransfers,
  getTransferById,
} from "./transfer.controller.js";

const router = Router();

router.post("/", createTransfer);
router.post("/create", createTransfer);
router.get("/", getAllTransfers);
router.get("/:id", getTransferById);

export default router;