import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as ContactListItemController from "../controllers/ContactListItemController";

const routes = express.Router();

routes.get(
  "/contact-list-items/list",
  isAuth, planExpired, 
  ContactListItemController.findList
);

routes.get("/contact-list-items", isAuth, planExpired,  ContactListItemController.index);

routes.get("/contact-list-items/:id", isAuth, planExpired,  ContactListItemController.show);

routes.post("/contact-list-items", isAuth, planExpired,  ContactListItemController.store);

routes.put("/contact-list-items/:id", isAuth, planExpired,  ContactListItemController.update);

routes.delete(
  "/contact-list-items/:id",
  isAuth, planExpired, 
  ContactListItemController.remove
);

export default routes;
