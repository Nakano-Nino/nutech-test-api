import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

import userRouter from "./routes/user.routes";
import informationRouter from "./routes/information.routes";
import transactionRouter from "./routes/transaction.routes";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

const app = express();
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use('/api', userRouter)
app.use("/api", informationRouter)
app.use("/api", transactionRouter)

app.listen(port, () => console.log(`Server running on port ${port}`))