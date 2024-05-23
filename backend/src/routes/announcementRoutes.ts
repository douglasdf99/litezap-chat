import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as AnnouncementController from "../controllers/AnnouncementController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);
const routes = express.Router();

routes.get("/announcements/list", isAuth, planExpired,  AnnouncementController.findList);

routes.get("/announcements", isAuth, planExpired,  AnnouncementController.index);

routes.get("/announcements/:id", isAuth, planExpired,  AnnouncementController.show);

routes.post("/announcements", isAuth, planExpired,  AnnouncementController.store);

routes.put("/announcements/:id", isAuth, planExpired,  AnnouncementController.update);

routes.delete("/announcements/:id", isAuth, planExpired,  AnnouncementController.remove);

routes.post(
  "/announcements/:id/media-upload",
  isAuth, planExpired, 
  upload.array("file"),
  AnnouncementController.mediaUpload
);

routes.delete(
  "/announcements/:id/media-upload",
  isAuth, planExpired, 
  AnnouncementController.deleteMedia
);

export default routes;
