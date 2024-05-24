import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";
import uploadConfig from "../config/upload";
import tokenAuth from "../middleware/tokenAuth";

import * as MessageController from "../controllers/MessageController";

const messageRoutes = Router();

const upload = multer(uploadConfig);

messageRoutes.get("/messages/:ticketId", isAuth, planExpired, MessageController.index);
messageRoutes.post("/messages/:ticketId", isAuth, planExpired, upload.array("medias"), MessageController.store);
messageRoutes.delete("/messages/:messageId", isAuth, planExpired, MessageController.remove);
messageRoutes.post("/api/messages/send", tokenAuth, upload.array("medias"), MessageController.send);

export default messageRoutes;
