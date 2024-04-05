import express from "express";
import cors from "cors";

import userRouter from "./routes/user.routes";
import informationRouter from "./routes/information.routes";
import transactionRouter from "./routes/transaction.routes";

const app = express();

app.use(express.json())
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use('/api', userRouter)
app.use("/api", informationRouter)
app.use("/api", transactionRouter)

app.listen(3000, () => console.log("Server running on port 3000"))