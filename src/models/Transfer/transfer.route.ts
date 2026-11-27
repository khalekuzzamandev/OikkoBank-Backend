import { Router } from "express";
import {
  createTransfer,
  deleteTransfer,
  getAllTransfers,
  getTransferById,
  updateTransfer,
} from "./transfer.controller.js";

const router = Router();

router.post("/", createTransfer);
router.post("/create", createTransfer);
router.get("/", getAllTransfers);
router.get("/:id", getTransferById);
router.patch("/:id", updateTransfer);
router.delete("/:id", deleteTransfer);

export default router;