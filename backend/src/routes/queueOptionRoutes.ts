import { Router } from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as QueueOptionController from "../controllers/QueueOptionController";

const queueOptionRoutes = Router();

queueOptionRoutes.get("/queue-options", isAuth, planExpired, QueueOptionController.index);

queueOptionRoutes.post("/queue-options", isAuth, planExpired, QueueOptionController.store);

queueOptionRoutes.get("/queue-options/:queueOptionId", isAuth, planExpired, QueueOptionController.show);

queueOptionRoutes.put("/queue-options/:queueOptionId", isAuth, planExpired, QueueOptionController.update);

queueOptionRoutes.delete("/queue-options/:queueOptionId", isAuth, planExpired, QueueOptionController.remove);

export default queueOptionRoutes;
