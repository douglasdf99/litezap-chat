import express from "express";
import isAuth from "../middleware/isAuth";
import planExpired from "../middleware/planExpired";

import * as TicketNoteController from "../controllers/TicketNoteController";

const ticketNoteRoutes = express.Router();

ticketNoteRoutes.get(
  "/ticket-notes/list",
  isAuth,
  TicketNoteController.findFilteredList
);

ticketNoteRoutes.get("/ticket-notes", isAuth, planExpired, TicketNoteController.index);

ticketNoteRoutes.get("/ticket-notes/:id", isAuth, planExpired, TicketNoteController.show);

ticketNoteRoutes.post("/ticket-notes", isAuth, planExpired, TicketNoteController.store);

ticketNoteRoutes.put("/ticket-notes/:id", isAuth, planExpired, TicketNoteController.update);

ticketNoteRoutes.delete(
  "/ticket-notes/:id",
  isAuth,
  TicketNoteController.remove
);

export default ticketNoteRoutes;
