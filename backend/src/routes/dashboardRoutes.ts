import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as DashboardController from "../controllers/DashbardController";

const routes = express.Router();

routes.get("/dashboard", isAuth, planExpired, DashboardController.index);

export default routes;
