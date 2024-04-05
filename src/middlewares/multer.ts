import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path = require("path");


export default new class uploadImage {
    Upload(fieldname: string){
        const storage = multer.diskStorage({
            destination: (req, res, cb) => {
                cb(null, "public/profile_img")
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = path.extname(file.originalname)
                cb(null, uniqueSuffix + ` profile-updated` + ext)
            }
        })

        const fileFilter = (req: Request, file: any, cb: any) => {
            const allowedTypes = ['image/jpeg', 'image/png']
            
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true)
            } else {
                cb(new Error('Format Image tidak sesuai'), false)
            }
        }

        const uploadFile = multer({
            storage: storage,
            fileFilter: fileFilter
        })

        return (req: Request, res: Response, next: NextFunction) => {
            uploadFile.single(fieldname) (req, res, (err: any) => {
                if (err) return res.status(400).json({
                    status: 102,
                    message: err.message,
                    data: null
                })
                
                if (req.file) {
                    res.locals.filename = req.file.filename
                }
                next()
            })
        }
    }
}