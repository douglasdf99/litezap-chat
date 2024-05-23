import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";

const contactRoutes = express.Router();

contactRoutes.post(
  "/contacts/import",
  isAuth, planExpired, 
  ImportPhoneContactsController.store
);

contactRoutes.get("/contacts", isAuth, planExpired, ContactController.index);

contactRoutes.get("/contacts/list", isAuth, planExpired,  ContactController.list);

contactRoutes.get("/contacts/:contactId", isAuth, planExpired,  ContactController.show);

contactRoutes.post("/contacts", isAuth, planExpired,  ContactController.store);

contactRoutes.put("/contacts/:contactId", isAuth, planExpired,  ContactController.update);

contactRoutes.delete("/contacts/:contactId", isAuth, planExpired,  ContactController.remove);

export default contactRoutes;
