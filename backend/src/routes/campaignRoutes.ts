import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as CampaignController from "../controllers/CampaignController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

routes.get("/campaigns/list", isAuth, planExpired,  CampaignController.findList);

routes.get("/campaigns", isAuth, planExpired,  CampaignController.index);

routes.get("/campaigns/:id", isAuth, planExpired,  CampaignController.show);

routes.post("/campaigns", isAuth, planExpired,  CampaignController.store);

routes.put("/campaigns/:id", isAuth, planExpired,  CampaignController.update);

routes.delete("/campaigns/:id", isAuth, planExpired,  CampaignController.remove);

routes.post("/campaigns/:id/cancel", isAuth, planExpired,  CampaignController.cancel);

routes.post("/campaigns/:id/restart", isAuth, planExpired,  CampaignController.restart);

routes.post(
  "/campaigns/:id/media-upload",
  isAuth, planExpired, 
  upload.array("file"),
  CampaignController.mediaUpload
);

routes.delete(
  "/campaigns/:id/media-upload",
  isAuth, planExpired, 
  CampaignController.deleteMedia
);

export default routes;
