import { Request, Response } from "express";
import { connect } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Joi from "joi";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model";

dotenv.config();

export default new (class UserController {
  async getAllUsers(req: Request, res: Response) {
    const connection = await connect();
    const users = await connection.query("SELECT * FROM users");
    res.json(users[0]);
  }

  async getProfile(req: Request, res: Response) {
    const connection = await connect();
    const { email } = res.locals.loginSession;
    type QueryResult = any[];

    const users: QueryResult = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    res.status(200).json({
      status: 0,
      message: "Sukses",
      data: {
        email: users[0][0].email,
        first_name: users[0][0].first_name,
        last_name: users[0][0].last_name,
        profile_image: users[0][0].profile_image,
      },
    });
  }

  async register(req: Request, res: Response) {
    const connection = await connect();
    type QueryResult = any[];
    const newUser: User = req.body;

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(8),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
    });

    const { error } = schema.validate(newUser);
    if (error)
      return res.status(400).json({
        status: 102,
        message: "Parameter email tidak sesuai format",
        data: null,
      });

    const users: QueryResult = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [newUser.email]
    );

    if (users[0].length > 0) {
      return res.status(409).json({
        status: 409,
        message: "Email sudah digunakan",
        data: null,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);

    const userData = {
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await connection.query("INSERT INTO users SET ?", [userData]);
    res.status(200).json({
      status: 0,
      message: "Registrasi berhasil silahkan login",
      data: null,
    });
  }

  async login(req: Request, res: Response) {
    const connection = await connect();
    const { email, password } = req.body;
    type QueryResult = any[][];

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required().min(8),
    });

    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({
        status: 102,
        message: "Parameter email tidak sesuai format",
        data: null,
      });

    const user: QueryResult = await connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (user[0] == null) {
      return res.status(404).json({
        status: 404,
        message: "Email tidak ditemukan",
        data: null,
      });
    }

    bcrypt.compare(password, user[0][0].password, (err, result) => {
      if (err) {
        return res.status(401).json({
          status: 103,
          message: "Username atau password salah",
          data: null,
        });
      }

      if (result) {
        return res.status(200).json({
          status: 200,
          message: "Login Sukses",
          data: {
            token: jwt.sign({ email: user[0][0].email }, `${process.env.SECRET_KEY}`, {
              expiresIn: "12h",
            }),
          },
        });
      }
    });
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const connection = await connect();
      const { email } = res.locals.loginSession;

      type QueryResult = any[];
      const { first_name, last_name, profile_image } = req.body;

      const userData = {
        email,
        first_name,
        last_name,
        profile_image,
        updated_at: new Date(),
      };

      await connection.query("UPDATE users SET ? WHERE email = ?", [
        userData,
        email,
      ]);

      const user: QueryResult = await connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      res.status(200).json({
        status: 0,
        message: "Update profile berhasil",
        data: {
          email: user[0][0].email,
          first_name: user[0][0].first_name,
          last_name: user[0][0].last_name,
          profile_image: user[0][0].profile_image,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error " + error,
        data: null,
      });
    }
  }

  async updateProfileImage(req: Request, res: Response) {
    try {
      const connection = await connect();
      const { email } = res.locals.loginSession;
      type QueryResult = any[];

      cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
      })

      let profile_image = ""

      if(req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "NUTECH/profile_image",
        });

        profile_image = result.secure_url
      }

      const userData = {
        email,
        profile_image,
        updated_at: new Date(),
      };

      await connection.query("UPDATE users SET ? WHERE email = ?", [
        userData,
        email,
      ]);

      const user: QueryResult = await connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      res.status(200).json({
        status: 0,
        message: "Update profile image berhasil",
        data: {
          email: user[0][0].email,
          first_name: user[0][0].first_name,
          last_name: user[0][0].last_name,
          profile_image: user[0][0].profile_image,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Server error " + error,
        data: null,
      });
    }
  }
})();
