import { Request, Response } from "express";
import { connect } from "../db";
import Joi, { any } from "joi";

export default new (class TransactionController {
  async getBalance(req: Request, res: Response) {
    try {
      const connection = await connect();
      type QueryResult = any[];
      const { email } = res.locals.loginSession;

      const balance: QueryResult = await connection.query(
        "SELECT balance FROM users WHERE email = ?",
        [email]
      );

      if (balance[0] == null) {
        return res.status(404).json({
          status: 404,
          message: "Balance tidak ditemukan",
          data: null,
        });
      }

      res.status(200).json({
        status: 0,
        message: "Get Balance Berhasil",
        data: {
          balance: balance[0][0].balance,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
        data: null,
      });
    }
  }

  async topupBalance(req: Request, res: Response) {
    try {
      const connection = await connect();
      type QueryResult = any[];
      const { email } = res.locals.loginSession;

      const schema = Joi.object({
        top_up_amount: Joi.number().required().min(1),
      });

      if (schema.validate(req.body).error) {
        return res.status(400).json({
          status: 102,
          message:
            "Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
          data: null,
        });
      }

      const { top_up_amount } = req.body;

      const user: QueryResult = await connection.query(
        "SELECT id, balance FROM users WHERE email = ?",
        [email]
      );

      if (user[0] == null) {
        return res.status(404).json({
          status: 404,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      await connection.query(
        "UPDATE users SET balance = balance + ? WHERE id = ?",
        [top_up_amount, user[0][0].id]
      );

      // const currentDate = new Date();
      // const dateString = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`;

      // const invoiceCheck: QueryResult = await connection.query("SELECT MAX(RIGHT(invoice_number, 3)) AS max_sequence FROM transactions WHERE LEFT(invoice_number, 11) = ?", [`INV${dateString}`]);

      // let sequenceNumber;

      // if (invoiceCheck[0][0].max_sequence == null) {
      //     sequenceNumber = 1;
      // } else {
      //     sequenceNumber = parseInt(invoiceCheck[0][0].max_sequence, 10) + 1;
      // }

      // const sequenceString = sequenceNumber.toString().padStart(3, '0');
      // const invoiceNumber = `INV${dateString}-${sequenceString}`;

      const transactionData = {
        user_id: user[0][0].id,
        invoice_number: await generateInvoice(),
        transaction_type: "TOPUP",
        description: "Top Up balance",
        total_amount: top_up_amount,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await connection.query("INSERT INTO transactions SET ?", [
        transactionData,
      ]);

      res.status(200).json({
        status: 0,
        message: "Top Up Balance Berhasil",
        data: {
          balance: user[0][0].balance + top_up_amount,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
        data: null,
      });
    }
  }

  async transaction(req: Request, res: Response) {
    try {
      const connection = await connect();
      type QueryResult = any[];

      const { email } = res.locals.loginSession;
      const { service_code } = req.body;

      const user: QueryResult = await connection.query(
        "SELECT id, balance FROM users WHERE email = ?",
        [email]
      );
      if (user[0] == null) {
        return res.status(400).json({
          status: 102,
          message: "User tidak ditemukan",
          data: null,
        });
      }

      const service: QueryResult = await connection.query(
        "SELECT * FROM services WHERE service_code = ?",
        [service_code]
      );
      if (service[0] == null) {
        return res.status(400).json({
          status: 102,
          message: "Service ataus Layanan tidak ditemukan",
          data: null,
        });
      }

      if (user[0][0].balance < service[0][0].service_tariff) {
        return res.status(400).json({
          status: 400,
          message: "Balance tidak mencukupi",
          data: null,
        });
      }

      const transactionData = {
        user_id: user[0][0].id,
        invoice_number: await generateInvoice(),
        transaction_type: "PAYMENT",
        description: service[0][0].service_name,
        total_amount: service[0][0].service_tariff,
        created_at: new Date(),
        updated_at: new Date(),
      };

      await connection.query("INSERT INTO transactions SET ?", [
        transactionData,
      ]);

      await connection.query(
        "UPDATE users SET balance = balance - ? WHERE id = ?",
        [service[0][0].service_tariff, user[0][0].id]
      );

      res.status(200).json({
        status: 0,
        message: "Transaksi berhasil",
        data: {
          invoice_number: transactionData.invoice_number,
          servicce_code: service[0][0].service_code,
          service_name: service[0][0].service_name,
          transaction_type: transactionData.transaction_type,
          total_amount: transactionData.total_amount,
          created_on: transactionData.created_at,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
        data: null,
      });
    }
  }

  async transactionHistory(req: Request, res: Response) {
    try {
      const connection = await connect();
      type QueryResult = any[];

      const { email } = res.locals.loginSession;
      const { limit } = req.body;

      let transactions: QueryResult;

      const user: QueryResult = await connection.query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (limit) {
        transactions = await connection.query(
          "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
          [user[0][0].id, limit]
        );
      } else {
        transactions = await connection.query(
          "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
          [user[0][0].id]
        );
      }

      let records: QueryResult = [];
      for (let i = 0; i < transactions[0].length; i++) {
        records.push({
            invoice_number: transactions[0][i].invoice_number,
            transaction_type: transactions[0][i].transaction_type,
            description: transactions[0][i].description,
            total_amount: transactions[0][i].total_amount,
            created_on: transactions[0][i].created_at,
        })
      }

      res.status(200).json({
        status: 0,
        message: "Get History Berhasil",
        data: {
            records
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error,
        data: null,
      });
    }
  }
})();

async function generateInvoice() {
  const connection = await connect();
  type QueryResult = any[];
  const currentDate = new Date();
  const dateString = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${currentDate.getDate().toString().padStart(2, "0")}`;

  const invoiceCheck: QueryResult = await connection.query(
    "SELECT MAX(RIGHT(invoice_number, 3)) AS max_sequence FROM transactions WHERE LEFT(invoice_number, 11) = ?",
    [`INV${dateString}`]
  );

  let sequenceNumber;

  if (invoiceCheck[0][0].max_sequence == null) {
    sequenceNumber = 1;
  } else {
    sequenceNumber = parseInt(invoiceCheck[0][0].max_sequence, 10) + 1;
  }

  const sequenceString = sequenceNumber.toString().padStart(3, "0");
  const invoiceNumber = `INV${dateString}-${sequenceString}`;

  return invoiceNumber;
}
