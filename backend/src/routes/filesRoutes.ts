import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";
import uploadConfig from "../config/upload";
import multer from "multer";

import * as FilesController from "../controllers/FilesController";

const upload = multer(uploadConfig);

const filesRoutes = express.Router();

filesRoutes.get("/files/list", isAuth, planExpired, FilesController.list);
filesRoutes.get("/files", isAuth, planExpired, FilesController.index);
filesRoutes.post("/files", isAuth, planExpired, FilesController.store);
filesRoutes.put("/files/:fileId", isAuth, planExpired,  FilesController.update);
filesRoutes.get("/files/:fileId", isAuth, planExpired, FilesController.show);
filesRoutes.delete("/files/:fileId", isAuth, planExpired, FilesController.remove);
filesRoutes.delete("/files", isAuth, planExpired, FilesController.removeAll);
filesRoutes.post("/files/uploadList/:fileListId", isAuth, planExpired, upload.array("files"), FilesController.uploadMedias);
export default filesRoutes;
