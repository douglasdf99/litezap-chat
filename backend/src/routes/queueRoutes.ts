import { Router } from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as QueueController from "../controllers/QueueController";

const queueRoutes = Router();

queueRoutes.get("/queue", isAuth, planExpired, QueueController.index);

queueRoutes.post("/queue", isAuth, planExpired, QueueController.store);

queueRoutes.get("/queue/:queueId", isAuth, planExpired, QueueController.show);

queueRoutes.put("/queue/:queueId", isAuth, planExpired, QueueController.update);

queueRoutes.delete("/queue/:queueId", isAuth, planExpired, QueueController.remove);

export default queueRoutes;
