import { getIO } from "../../libs/socket";
import { proto } from "@whiskeysockets/baileys";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import getBodyMessage from "./getBodyMessage"

import CreateMessageService from "../MessageServices/CreateMessageService";
import getTypeMessage from "./getTypeMessage";
import verifyQuotedMessage from "./verifyQuotedMessage";
import Queue from "../../models/Queue";
import User from "../../models/User";

const updateTicketStatus = async (ticket, body) => {
  await ticket.update({ lastMessage: body });

  if (ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });
  }
};

const createMessage = async (msg, ticket, contact, body) => {
  const quotedMsg = await verifyQuotedMessage(msg);

  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg)
  };

  return await CreateMessageService({ messageData, companyId: ticket.companyId });
};

const emitTicketEvents = (io, ticket) => {
  io.to("closed").emit(`company-${ticket.companyId}-ticket`, {
    action: "delete",
    ticket,
    ticketId: ticket.id
  });

  io.to(ticket.status)
    .to(ticket.id.toString())
    .emit(`company-${ticket.companyId}-ticket`, {
      action: "update",
      ticket,
      ticketId: ticket.id
    });
};

export const verifyMessage = async (msg: proto.IWebMessageInfo, ticket: Ticket, contact: Contact) => {
  const io = getIO();
  const body = getBodyMessage(msg);

  await updateTicketStatus(ticket, body);
  await createMessage(msg, ticket, contact, body);

  if (!msg.key.fromMe && ticket.status === "closed") {
    emitTicketEvents(io, ticket);
  }
};

export default verifyMessage;
