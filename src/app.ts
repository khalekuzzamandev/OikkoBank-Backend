import cors from "cors";
import express, { type Express } from "express";

import userRoutes from "./models/user/user.route.js";
import accountRoutes from "./models/Account/account.route.js";
const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("Welcome to Oikko Bank API");
});


// get all users
app.use("/api/users", userRoutes);

// Account Routes
app.use("/api/accounts", accountRoutes);


export default app;