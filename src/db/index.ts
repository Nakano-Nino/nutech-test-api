import { createPool } from "mysql2/promise";

export async function connect() {
  const connection = createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "nutech_test_db",
    connectionLimit: 10,
  });

  return connection;
}
