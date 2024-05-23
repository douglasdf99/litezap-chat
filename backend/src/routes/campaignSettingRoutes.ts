import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as CampaignSettingController from "../controllers/CampaignSettingController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

routes.get("/campaign-settings", isAuth, planExpired,  CampaignSettingController.index);

routes.post("/campaign-settings", isAuth, planExpired,  CampaignSettingController.store);

export default routes;
