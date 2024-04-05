import { Router } from "express";
import userController from "../controllers/user.controller";
import Auth from "../middlewares/json_web_token";
import uploadImage from "../middlewares/multer";

const userRouter = Router();
userRouter.get("/getUsers", userController.getAllUsers);
userRouter.get("/profile", Auth, userController.getProfile);
userRouter.post("/registration", userController.register);
userRouter.post("/login", userController.login);
userRouter.put("/profile/update", Auth, userController.updateProfile);
userRouter.put("/profile/image", Auth, uploadImage.Upload("profile_image"), userController.updateProfileImage);

export default userRouter