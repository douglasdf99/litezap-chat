import { Router } from "express";
import * as PromptController from "../controllers/PromptController";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";


const promptRoutes = Router();

promptRoutes.get("/prompt", isAuth, planExpired, PromptController.index);

promptRoutes.post("/prompt", isAuth, planExpired, PromptController.store);

promptRoutes.get("/prompt/:promptId", isAuth, planExpired, PromptController.show);

promptRoutes.put("/prompt/:promptId", isAuth, planExpired, PromptController.update);

promptRoutes.delete("/prompt/:promptId", isAuth, planExpired, PromptController.remove);

export default promptRoutes;
