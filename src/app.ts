import cors from "cors";
import express, { type Express } from "express";

import { connectToDatabase } from "./config/index.js";
import userRoutes from "./models/user/user.route.js";
import accountRoutes from "./models/Account/account.route.js";
import depositRoutes from "./models/Deposit/user.route.js";
import loanRoutes from "./models/Loan/loan.route.js";
import withdrawRoutes from "./models/withdraw/user.route.js";
import transferRoutes from "./models/Transfer/transfer.route.js";
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Oikko Bank API");
});

app.use("/api", async (_req, _res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// get all users
app.use("/api/users", userRoutes);

// Account Routes
app.use("/api/accounts", accountRoutes);

// Deposit Routes
app.use("/api/deposits", depositRoutes);

// Loan Routes
app.use("/api/loans", loanRoutes);

// Withdrawal Routes
app.use("/api/withdrawals", withdrawRoutes);

// Transfer Routes
app.use("/api/transfers", transferRoutes);

export default app;