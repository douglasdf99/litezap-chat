import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as QuickMessageController from "../controllers/QuickMessageController";
import multer from "multer";
import uploadConfig from "../config/upload";

const upload = multer(uploadConfig);

const routes = express.Router();

routes.get("/quick-messages/list", isAuth, planExpired, QuickMessageController.findList);

routes.get("/quick-messages", isAuth, planExpired, QuickMessageController.index);

routes.get("/quick-messages/:id", isAuth, planExpired, QuickMessageController.show);

routes.post("/quick-messages", isAuth, planExpired, QuickMessageController.store);

routes.put("/quick-messages/:id", isAuth, planExpired, QuickMessageController.update);

routes.delete("/quick-messages/:id", isAuth, planExpired, QuickMessageController.remove);

routes.post(
    "/quick-messages/:id/media-upload",
    isAuth,
    upload.array("file"),
    QuickMessageController.mediaUpload
  );
  
  routes.delete(
    "/quick-messages/:id/media-upload",
    isAuth,
    QuickMessageController.deleteMedia
  );
  
export default routes;
