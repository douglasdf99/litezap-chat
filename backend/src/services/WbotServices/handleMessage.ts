import { isNil } from "lodash";
import moment from "moment";
import Queue from "../../models/Queue";
import Setting from "../../models/Setting";
import verifyMessage from "./verifyMessage";
import verifyMediaMessage from "./verifyMediaMessage";
import findOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import findOrCreateTicketTrackingService from "../TicketServices/FindOrCreateATicketTrakingService";
import showWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import formatBody from "../../helpers/Mustache";
import handleRating from "./handleRating";
import handleChartbot from "./handleChartbot";
import getBodyMessage from "./getBodyMessage";
import getTypeMessage from "./getTypeMessage";
import { debounce } from "../../helpers/Debounce";
import { WASocket, jidNormalizedUser, proto } from "@whiskeysockets/baileys";
import { logger } from "../../utils/logger";
import * as Sentry from "@sentry/node";
import { Store } from "../../libs/store";
import verifyContact from "./verifyContact";
import verifyQueue from "./verifyQueue";
import { provider } from "./providers";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import handleOpenAi from "./handleOpenAi";
import Message from "../../models/Message";
import verifyRating from "./verifyRating";


type Session = WASocket & {
  id?: number;
  store?: Store;
};

interface IMe {
  name: string;
  id: string;
}

const sendMessage = async (wbot, contact, ticket, message) => {
  const sentMessage = await wbot.sendMessage(
    `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    { text: message }
  );
  await verifyMessage(sentMessage, ticket, contact);
};
const getMeSocket = (wbot: Session): IMe => {
  return {
    id: jidNormalizedUser((wbot as WASocket).user.id),
    name: (wbot as WASocket).user.name
  }
};

const isWithinTimeWindow = (updatedAt, minutes) => {
  const now = moment();
  const updateTime = moment(updatedAt);
  console.log(now, updateTime,updatedAt,  now.diff(updateTime, 'minutes'));
  return now.diff(updateTime, 'minutes') <= minutes;
};

const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;

  const senderId = msg.participant || msg.key.participant || msg.key.remoteJid || undefined;

  return senderId && jidNormalizedUser(senderId);
};

const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return;
    }

    const ifType =
      msgType === "conversation" ||
      msgType === "extendedTextMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "viewOnceMessage";

    if (!ifType) {
      logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
      Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
    }

    return !!ifType;
  } catch (error) {
    Sentry.setExtra("Error isValidMsg", { msg });
    Sentry.captureException(error);
  }
};

const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
  return isGroup
    ? {
      id: getSenderMessage(msg, wbot),
      name: msg.pushName
    }
    : {
      id: msg.key.remoteJid,
      name: msg.key.fromMe ? rawNumber : msg.pushName
    };
};

const handleOutOfHoursMessage = async (wbot, contact, ticket, message) => {
  const debouncedSentMessage = debounce(
    async () => {
      await sendMessage(wbot, contact, ticket, message);
    },
    3000,
    ticket.id
  );
  debouncedSentMessage();
};

const handleRatingFlow = async (bodyMessage, ticket, ticketTracking) => {
  if (ticketTracking && verifyRating(ticketTracking)) {
    await handleRating(parseFloat(bodyMessage), ticket, ticketTracking);
    return true;
  }
  return false;
};

const checkMessageValidity = (msg) => {
  if (!isValidMsg(msg)) return false;

  const bodyMessage = getBodyMessage(msg);
  const msgType = getTypeMessage(msg);

  const hasMedia =
    msg.message?.audioMessage ||
    msg.message?.imageMessage ||
    msg.message?.videoMessage ||
    msg.message?.documentMessage ||
    msg.message.stickerMessage;

  if (msg.key.fromMe) {
    if (/\u200e/.test(bodyMessage)) return false;
    if (!hasMedia && !["conversation", "extendedTextMessage", "vcard"].includes(msgType)) {
      return false;
    }
  }
  return true;
};

const handleBusinessHours = async (scheduleType, currentSchedule, ticket, whatsapp, wbot, contact) => {
  if (scheduleType.value === "company" && !isNil(currentSchedule) && (!currentSchedule || currentSchedule.inActivity === false)) {
    const body = `${whatsapp.outOfHoursMessage}`;
    await handleOutOfHoursMessage(wbot, contact, ticket, body);
    return true;
  }

  if (scheduleType.value === "queue" && ticket.queueId !== null) {
    const queue = await Queue.findByPk(ticket.queueId);

    const { schedules }: any = queue;
    const now = moment();
    const weekday = now.format("dddd").toLowerCase();
    const schedule = schedules.find(
      (s) =>
        s.weekdayEn === weekday &&
        s.startTime !== "" &&
        s.startTime !== null &&
        s.endTime !== "" &&
        s.endTime !== null
    );

    if (queue.outOfHoursMessage !== null && queue.outOfHoursMessage !== "" && !isNil(schedule)) {
      const startTime = moment(schedule.startTime, "HH:mm");
      const endTime = moment(schedule.endTime, "HH:mm");

      if (now.isBefore(startTime) || now.isAfter(endTime)) {
        const body = queue.outOfHoursMessage;
        await handleOutOfHoursMessage(wbot, contact, ticket, body);
        return true;
      }
    }
  }
  return false;
};

const handleMessage = async (msg, wbot, companyId) => {
  if (!checkMessageValidity(msg)) return;

  let mediaSent;

  try {
    const isGroup = msg.key.remoteJid?.endsWith("@g.us");
    const msgIsGroupBlock = await Setting.findOne({
      where: { companyId, key: "CheckMsgIsGroup" },
    });

    if (msgIsGroupBlock?.value === "enabled" && isGroup) return;

    const msgContact = await getContactMessage(msg, wbot);
    let groupContact;

    if (isGroup) {
      const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid);
      const msgGroupContact = { id: grupoMeta.id, name: grupoMeta.subject };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }

    const whatsapp = await showWhatsAppService(wbot.id, companyId);
    const contact = await verifyContact(msgContact, wbot, companyId);
    let unreadMessages = 0;

    // if (msg.key.fromMe) {
    //   await cacheLayer.set(`contacts:${contact.id}:unreads`, "0");
    // } else {
    //   const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`);
    //   unreadMessages = +unreads + 1;
    //   await cacheLayer.set(`contacts:${contact.id}:unreads`, `${unreadMessages}`);
    // }

    const lastMessage = await Message.findOne({
      where: { contactId: contact.id, companyId },
      order: [["createdAt", "DESC"]],
    });

    if (unreadMessages === 0 && whatsapp.complationMessage && formatBody(whatsapp.complationMessage, contact).trim().toLowerCase() === lastMessage?.body.trim().toLowerCase()) {
      return;
    }

    const ticket = await findOrCreateTicketService(contact, wbot.id, unreadMessages, companyId, groupContact);

    await provider(ticket, msg, companyId, contact, wbot);

    const bodyMessage = getBodyMessage(msg);

    if (bodyMessage === "#") {
      await ticket.update({ queueOptionId: null, chatbot: false, queueId: null });
      await verifyQueue(wbot, msg, ticket, ticket.contact);
      return;
    }

    const ticketTracking = await findOrCreateTicketTrackingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp?.id,
    });

    if (await handleRatingFlow(bodyMessage, ticket, ticketTracking)) return;

    if (msg.message?.audioMessage || msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.documentMessage || msg.message?.stickerMessage) {
      mediaSent = await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    const currentSchedule = await VerifyCurrentSchedule(companyId);
    const scheduleType = await Setting.findOne({ where: { companyId, key: "scheduleType" } });

    if (!ticket.queue && !isGroup && !msg.key.fromMe && !ticket.userId && !isNil(whatsapp.promptId)) {
      await handleOpenAi(msg, wbot, ticket, contact, mediaSent);
    }

    if (!ticket.queue && !isGroup && !msg.key.fromMe && !ticket.userId && whatsapp.queues.length >= 1) {
      await verifyQueue(wbot, msg, ticket, ticket.contact);
    }

    const dontReadTheFirstQuestion = ticket.queue === null;

    await ticket.reload();

    const lastMessageFromMe = await Message.findOne({
      where: { ticketId: ticket.id, fromMe: true },
      order: [["createdAt", "DESC"]],
    });

    if (!msg.key.fromMe && scheduleType && !ticket.userId && ticket.queueId !== null && !isWithinTimeWindow(lastMessageFromMe.createdAt, 10)) {
      if (await handleBusinessHours(scheduleType, currentSchedule, ticket, whatsapp, wbot, contact)) return;
    }

    if (!whatsapp.queues.length && !ticket.userId && !isGroup && !msg.key.fromMe) {
      
      if (lastMessageFromMe && lastMessageFromMe.body.includes(whatsapp.greetingMessage)) return;

      if (whatsapp.greetingMessage) {
        const debouncedSentMessage = debounce(
          async () => {
            await sendMessage(wbot, contact, ticket, whatsapp.greetingMessage);
          },
          1000,
          ticket.id
        );
        debouncedSentMessage();
        return;
      }
    }
    if (whatsapp.queues.length === 1 && ticket.queue) {
      console.log(ticket.chatbot && !msg.key.fromMe);
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot);
      }
    }

    if (whatsapp.queues.length > 1 && ticket.queue) {
      if (ticket.chatbot && !msg.key.fromMe) {
        await handleChartbot(ticket, msg, wbot, dontReadTheFirstQuestion);
      }
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};

export default handleMessage;
