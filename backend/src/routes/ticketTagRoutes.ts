import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as TicketTagController from "../controllers/TicketTagController";

const ticketTagRoutes = express.Router();

ticketTagRoutes.put("/ticket-tags/:ticketId/:tagId", isAuth, planExpired, TicketTagController.store);
ticketTagRoutes.delete("/ticket-tags/:ticketId", isAuth, planExpired, TicketTagController.remove);

export default ticketTagRoutes;
