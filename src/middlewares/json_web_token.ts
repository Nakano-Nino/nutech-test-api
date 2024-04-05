import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

class Auth {
    Authentication(req: Request, res: Response, next: NextFunction){
        try {
            const authHeader = req.header('authorization')         
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    status: 401,
                    message: "Unauthorized",
                    data: null
                })
            }

            const token = authHeader.split(' ')[1]

            try {
                const loginSession = jwt.verify(token, "nutech")

                res.locals.loginSession = loginSession
                next()
            } catch (error) {
                return res.status(401).json({
                    status: 108,
                    message: "Token tidak tidak valid atau kadaluwarsa",
                    data: null
                })
            }
        } catch (error) {
            next(error)
        }
    }
}

export default new Auth().Authentication