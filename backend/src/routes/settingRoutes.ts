import { Router } from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as SettingController from "../controllers/SettingController";

const settingRoutes = Router();

settingRoutes.get("/settings", isAuth, planExpired, SettingController.index);

// routes.get("/settings/:settingKey", isAuth, planExpired, SettingsController.show);

// change setting key to key in future
settingRoutes.put("/settings/:settingKey", isAuth, planExpired, SettingController.update);

export default settingRoutes;
