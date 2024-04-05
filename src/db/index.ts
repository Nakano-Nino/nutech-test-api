import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export async function connect() {
  const connection = createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
  });

  return connection;
}
