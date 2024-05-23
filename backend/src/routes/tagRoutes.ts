import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as TagController from "../controllers/TagController";

const tagRoutes = express.Router();

tagRoutes.get("/tags/list", isAuth, planExpired, TagController.list);

tagRoutes.get("/tags", isAuth, planExpired, TagController.index);

tagRoutes.get("/tags/kanban", isAuth, planExpired, TagController.kanban);

tagRoutes.post("/tags", isAuth, planExpired, TagController.store);

tagRoutes.put("/tags/:tagId", isAuth, planExpired, TagController.update);

tagRoutes.get("/tags/:tagId", isAuth, planExpired, TagController.show);

tagRoutes.delete("/tags/:tagId", isAuth, planExpired, TagController.remove);

tagRoutes.post("/tags/sync", isAuth, planExpired, TagController.syncTags);

export default tagRoutes;
