import { Router } from "express";

import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";
import * as UserController from "../controllers/UserController";

const userRoutes = Router();

userRoutes.get("/users", isAuth, planExpired, UserController.index);

userRoutes.get("/users/list", isAuth, planExpired, UserController.list);

userRoutes.post("/users", isAuth, planExpired, UserController.store);

userRoutes.put("/users/:userId", isAuth, planExpired, UserController.update);

userRoutes.get("/users/:userId", isAuth, planExpired, UserController.show);

userRoutes.delete("/users/:userId", isAuth, planExpired, UserController.remove);

export default userRoutes;
