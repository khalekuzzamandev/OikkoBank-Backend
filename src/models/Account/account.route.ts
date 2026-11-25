
import { Router } from "express";
import { accountController } from "./account.controller.js";

const router = Router();

router.post("/create", accountController.createAccount);
router.get("/", accountController.getAllAccounts);
router.get("/user/:userId", accountController.getAccountsByUserId);
router.get("/:id", accountController.getAccountById);
router.put("/:id", accountController.updateAccount);
router.delete("/:id", accountController.deleteAccount);

export default router;
