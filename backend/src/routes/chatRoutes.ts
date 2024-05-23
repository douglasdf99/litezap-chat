import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as ChatController from "../controllers/ChatController";

const routes = express.Router();

routes.get("/chats", isAuth, planExpired,  ChatController.index);

routes.get("/chats/:id", isAuth, planExpired,  ChatController.show);

routes.get("/chats/:id/messages", isAuth, planExpired,  ChatController.messages);

routes.post("/chats/:id/messages", isAuth, planExpired,  ChatController.saveMessage);

routes.post("/chats/:id/read", isAuth, planExpired,  ChatController.checkAsRead);

routes.post("/chats", isAuth, planExpired,  ChatController.store);

routes.put("/chats/:id", isAuth, planExpired,  ChatController.update);

routes.delete("/chats/:id", isAuth, planExpired,  ChatController.remove);

export default routes;
