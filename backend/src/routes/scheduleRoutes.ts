import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as ScheduleController from "../controllers/ScheduleController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const scheduleRoutes = express.Router();

scheduleRoutes.get("/schedules", isAuth, planExpired, ScheduleController.index);

scheduleRoutes.post("/schedules", isAuth, planExpired, ScheduleController.store);

scheduleRoutes.put("/schedules/:scheduleId", isAuth, planExpired, ScheduleController.update);

scheduleRoutes.get("/schedules/:scheduleId", isAuth, planExpired, ScheduleController.show);

scheduleRoutes.delete("/schedules/:scheduleId", isAuth, planExpired, ScheduleController.remove);

scheduleRoutes.post("/schedules/:id/media-upload", isAuth, planExpired, upload.array("file"), ScheduleController.mediaUpload);

scheduleRoutes.delete("/schedules/:id/media-upload", isAuth, planExpired, ScheduleController.deleteMedia);

export default scheduleRoutes;
