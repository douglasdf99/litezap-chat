import { Router } from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import WhatsAppSessionController from "../controllers/WhatsAppSessionController";

const whatsappSessionRoutes = Router();

whatsappSessionRoutes.post(
  "/whatsappsession/:whatsappId",
  isAuth, planExpired,
  WhatsAppSessionController.store
);

whatsappSessionRoutes.put(
  "/whatsappsession/:whatsappId",
  isAuth, planExpired,
  WhatsAppSessionController.update
);

whatsappSessionRoutes.delete(
  "/whatsappsession/:whatsappId",
  isAuth, planExpired,
  WhatsAppSessionController.remove
);

export default whatsappSessionRoutes;
