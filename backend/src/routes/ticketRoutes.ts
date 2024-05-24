import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as TicketController from "../controllers/TicketController";

const ticketRoutes = express.Router();

ticketRoutes.get("/tickets", isAuth, planExpired,  TicketController.index);

ticketRoutes.get("/tickets/:ticketId", isAuth, planExpired,  TicketController.show);

ticketRoutes.get("/ticket/kanban", isAuth, planExpired,  TicketController.kanban);

ticketRoutes.get("/tickets/u/:uuid", isAuth, planExpired,  TicketController.showFromUUID);

ticketRoutes.post("/tickets", isAuth, planExpired,  TicketController.store);

ticketRoutes.put("/tickets/:ticketId", isAuth, planExpired,  TicketController.update);

ticketRoutes.delete("/tickets/:ticketId", isAuth, planExpired,  TicketController.remove);

export default ticketRoutes;
