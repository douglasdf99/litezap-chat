import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";
import uploadConfig from "../config/upload";

import * as ContactListController from "../controllers/ContactListController";
import multer from "multer";

const routes = express.Router();

const upload = multer(uploadConfig);

routes.get("/contact-lists/list", isAuth, planExpired,  ContactListController.findList);

routes.get("/contact-lists", isAuth, planExpired,  ContactListController.index);

routes.get("/contact-lists/:id", isAuth, planExpired,  ContactListController.show);

routes.post("/contact-lists", isAuth, planExpired,  ContactListController.store);

routes.post(
  "/contact-lists/:id/upload",
  isAuth, planExpired, 
  upload.array("file"),
  ContactListController.upload
);

routes.put("/contact-lists/:id", isAuth, planExpired,  ContactListController.update);

routes.delete("/contact-lists/:id", isAuth, planExpired,  ContactListController.remove);

export default routes;
