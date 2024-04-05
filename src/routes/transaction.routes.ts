import { Router } from "express";
import transactionController from "../controllers/transaction.controller";
import Auth from "../middlewares/json_web_token";

const transactionRouter = Router();
transactionRouter.get("/balance", Auth, transactionController.getBalance);
transactionRouter.get("/transaction/history", Auth, transactionController.transactionHistory)
transactionRouter.post("/topup", Auth, transactionController.topupBalance);
transactionRouter.post("/transaction", Auth, transactionController.transaction);

export default transactionRouter;
