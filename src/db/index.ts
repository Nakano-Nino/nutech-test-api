import { createPool } from "mysql2/promise";

export async function connect() {
  const connection = createPool({
    host: "viaduct.proxy.rlwy.net",
    port: 19881,
    user: "root",
    password: "JsAnUlPRJRqlWPqCtgLwycKLdYbyrQrJ",
    database: "railway",
    connectionLimit: 10,
  });

  return connection;
}
