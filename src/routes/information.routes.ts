import { Router } from "express";
import Auth from "../middlewares/json_web_token";
import informationController from "../controllers/information.controller";

const informationRouter = Router();
informationRouter.get("/banner", informationController.getAllBanners);
informationRouter.get("/services", Auth, informationController.getAllServices);

export default informationRouter;
